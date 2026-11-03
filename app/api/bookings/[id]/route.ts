import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import {
  deleteBooking,
  getBookingById,
  getBookingByIdUnscoped,
  getStudioRecordById,
  updateBookingStatus,
} from "@/lib/mongo";

/** Only these statuses can be cancelled; completed ones are historical. */
const CANCELLABLE = new Set(["pending", "confirmed"]);

/**
 * Host review decisions: confirm (pending → confirmed) and complete
 * (confirmed → completed). Only the owner of the booked studio may
 * transition a status, verified against the server session.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return NextResponse.json(
      { error: "Please log in to manage bookings." },
      { status: 401 },
    );
  }

  const { id } = await params;

  let body: { action?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const action = body.action;
  const nextStatus =
    action === "confirm" ? "confirmed" : action === "complete" ? "completed" : null;

  if (!nextStatus) {
    return NextResponse.json(
      { error: "Action must be 'confirm' or 'complete'." },
      { status: 400 },
    );
  }

  try {
    const booking = await getBookingByIdUnscoped(id);

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found." },
        { status: 404 },
      );
    }

    /* Authorization: the session user must own the booked studio. */
    const studio = await getStudioRecordById(booking.studioId);

    if (!studio || studio.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the studio host can manage booking statuses." },
        { status: 403 },
      );
    }

    const current = (booking.status || "pending").toLowerCase();

    if (action === "confirm" && current !== "pending") {
      return NextResponse.json(
        { error: "Only pending bookings can be confirmed." },
        { status: 409 },
      );
    }

    if (action === "complete" && current !== "confirmed") {
      return NextResponse.json(
        { error: "Only confirmed bookings can be completed." },
        { status: 409 },
      );
    }

    const updated = await updateBookingStatus(id, nextStatus);

    if (!updated) {
      return NextResponse.json(
        { error: "Booking not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ booking: updated });
  } catch (error) {
    console.error("Failed to update booking status:", error);
    return NextResponse.json(
      { error: "Could not update the booking. Please try again." },
      { status: 500 },
    );
  }
}

/**
 * Cancel a booking: the document is removed from MongoDB entirely,
 * scoped to the logged-in user so no one can delete another user's
 * booking, and only pending/confirmed bookings are cancellable.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return NextResponse.json(
      { error: "Please log in to manage your bookings." },
      { status: 401 },
    );
  }

  const { id } = await params;

  try {
    /* Look the booking up first so completed vs missing vs not-yours
       return distinct, correct status codes. */
    const booking = await getBookingById(id, session.user.email);

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found." },
        { status: 404 },
      );
    }

    if (!CANCELLABLE.has((booking.status || "pending").toLowerCase())) {
      return NextResponse.json(
        { error: `A ${booking.status} booking can no longer be cancelled.` },
        { status: 409 },
      );
    }

    const deleted = await deleteBooking(id, session.user.email);

    if (!deleted) {
      return NextResponse.json(
        { error: "Booking not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Failed to cancel booking:", error);
    return NextResponse.json(
      { error: "Could not cancel the booking. Please try again." },
      { status: 500 },
    );
  }
}
