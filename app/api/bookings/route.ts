import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import {
  createBooking,
  findBookingConflict,
  getBookings,
} from "@/lib/mongo";

/** Collect the logged-in user's booking records from MongoDB. */
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return NextResponse.json({ authenticated: false, bookings: [] });
  }

  const bookings = await getBookings(session.user.email);

  return NextResponse.json({
    authenticated: true,
    bookings,
  });
}

/** Minutes since midnight for a "HH:MM" string, or null when malformed. */
function parseTime(time: string): number | null {
  if (!/^\d{1,2}:\d{2}$/.test(time)) return null;
  const [h, m] = time.split(":").map(Number);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

/** Today's date (UTC) as YYYY-MM-DD so past dates can be rejected. */
function todayIso(): string {
  return new Date().toISOString().split("T")[0];
}

/** Save a booking request to MongoDB for the logged-in user. */
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return NextResponse.json(
      { error: "Please log in to request a booking." },
      { status: 401 },
    );
  }

  let body: {
    studioId?: string;
    studioTitle?: string;
    studioCategory?: string;
    date?: string;
    time?: string;
    hours?: number;
    message?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.studioId || body.studioId.length > 200) {
    return NextResponse.json(
      { error: "studioId is required." },
      { status: 400 },
    );
  }

  if (!body.studioTitle || body.studioTitle.length > 200) {
    return NextResponse.json(
      { error: "studioTitle is required." },
      { status: 400 },
    );
  }

  if (!body.date || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
    return NextResponse.json(
      { error: "Please choose a valid shoot date." },
      { status: 400 },
    );
  }

  if (body.date < todayIso()) {
    return NextResponse.json(
      { error: "The shoot date cannot be in the past." },
      { status: 400 },
    );
  }

  /* A start time is required so double-booking conflicts are detectable. */
  if (!body.time) {
    return NextResponse.json(
      { error: "Please choose a valid start time." },
      { status: 400 },
    );
  }

  const startTime = parseTime(body.time);
  if (startTime === null) {
    return NextResponse.json(
      { error: "Please choose a valid start time." },
      { status: 400 },
    );
  }

  const hours = Number(body.hours);
  if (!Number.isInteger(hours) || hours < 1 || hours > 12) {
    return NextResponse.json(
      { error: "Booking hours must be between 1 and 12." },
      { status: 400 },
    );
  }

  /* End time must land on the same day, before midnight. */
  const endTime = startTime + hours * 60;
  if (endTime > 24 * 60) {
    return NextResponse.json(
      { error: "The session must end before midnight. Please shorten it or start earlier." },
      { status: 400 },
    );
  }

  if (body.message && body.message.length > 2000) {
    return NextResponse.json(
      { error: "Please keep your message under 2000 characters." },
      { status: 400 },
    );
  }

  try {
    /* Double-booking guard: reject overlapping CONFIRMED bookings. */
    const conflict = await findBookingConflict({
      studioId: body.studioId,
      date: body.date,
      time: body.time,
      hours,
    });

    if (conflict) {
      return NextResponse.json({ error: conflict }, { status: 409 });
    }

    const booking = await createBooking({
      studioId: body.studioId,
      studioTitle: body.studioTitle,
      studioCategory: body.studioCategory ?? "",
      bookerName: session.user.name ?? "StudioSpace user",
      bookerEmail: session.user.email,
      date: body.date,
      time: body.time,
      hours,
      message: body.message,
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    /* Unknown studio id — the data layer reports it via a marker. */
    if (error instanceof Error && error.message.startsWith("STUDIO_NOT_FOUND:")) {
      return NextResponse.json(
        { error: "Studio not found. Please refresh and try again." },
        { status: 404 },
      );
    }

    console.error("Failed to create booking:", error);
    return NextResponse.json(
      { error: "Could not save the booking. Please try again." },
      { status: 500 },
    );
  }
}
