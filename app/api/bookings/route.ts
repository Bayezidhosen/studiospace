import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { createBooking, getBookings } from "@/lib/mongo";

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

  if (!body.studioId || !body.studioTitle) {
    return NextResponse.json(
      { error: "studioId and studioTitle are required." },
      { status: 400 },
    );
  }

  if (!body.date || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
    return NextResponse.json(
      { error: "Please choose a valid shoot date." },
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

  try {
    const booking = await createBooking({
      studioId: body.studioId,
      studioTitle: body.studioTitle,
      studioCategory: body.studioCategory ?? "",
      bookerName: session.user.name ?? "StudioSpace user",
      bookerEmail: session.user.email,
      date: body.date,
      time: body.time ?? "",
      hours,
      message: body.message,
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Failed to create booking:", error);
    return NextResponse.json(
      { error: "Could not save the booking. Please try again." },
      { status: 500 },
    );
  }
}
