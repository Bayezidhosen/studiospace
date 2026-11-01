import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { deleteBooking } from "@/lib/mongo";

/**
 * Cancel a booking: the document is removed from MongoDB entirely,
 * scoped to the logged-in user so no one can delete another user's
 * booking.
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
