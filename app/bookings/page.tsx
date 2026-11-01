"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CalendarCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

import type { Booking } from "@/lib/mongo";
import BookingDetailsCard from "@/components/studio/booking-details-card";

export default function BookingsPage() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const loadBookings = useCallback(() => {
    return fetch("/api/bookings")
      .then((response) => response.json())
      .then((data) => {
        setAuthenticated(Boolean(data?.authenticated));
        /* Final guard: never render cancelled records, even if the API
           accidentally returns stale cancelled documents. */
        setBookings(
          Array.isArray(data?.bookings)
            ? data.bookings.filter(
                (booking: Booking) =>
                  (booking.status || "pending").toLowerCase() !== "cancelled",
              )
            : [],
        );
      })
      .catch(() => setAuthenticated(false));
  }, []);

  useEffect(() => {
    let cancelled = false;

    loadBookings().finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [loadBookings]);

  const handleCancel = async (bookingId: string) => {
    /* Optimistic update: spinner on the card, no layout jump. */
    const previous = bookings;
    setBookings((current) =>
      current.map((booking) =>
        booking.id === bookingId
          ? { ...booking, status: "cancelling" }
          : booking,
      ),
    );

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
      });

      if (response.ok || response.status === 404) {
        /* Deleted (or already gone from another tab):
           the card disappears immediately — no browser refresh. */
        setBookings((current) =>
          current.filter((booking) => booking.id !== bookingId),
        );
        toast.success("Booking cancelled.");
        return;
      }

      const data = await response
        .json()
        .catch(() => ({ error: "Could not cancel the booking." }));

      if (response.status === 401) {
        toast.error("Please log in to manage your bookings.");
        return;
      }

      throw new Error(data?.error || "Could not cancel the booking.");
    } catch (error) {
      setBookings(previous);
      toast.error(
        error instanceof Error ? error.message : "Something went wrong."
      );
    }
  };

  return (
    <main className="min-h-[70vh] bg-[#f5f5f0]">
      <section className="dark-section py-20 text-center md:py-24">
        <div className="container-custom">
          <span className="text-xs font-bold tracking-[0.2em] text-[#d5ff3f]">
            YOUR REQUESTS
          </span>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-6xl">
            My bookings.
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-white/50">
            Every booking confirmation and request — collected live from your
            StudioSpace account.
          </p>
        </div>
      </section>

      <section className="container-custom py-16 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-neutral-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : !authenticated ? (
          <div className="mx-auto max-w-md rounded-3xl border border-black/10 bg-white p-10 text-center">
            <CalendarCheck className="mx-auto text-neutral-300" size={34} />
            <h2 className="mt-4 text-xl font-bold">You are not signed in</h2>
            <p className="mt-3 text-sm text-neutral-500">
              Log in to see your booking confirmations.
            </p>
            <Link
              href="/login"
              className="mt-7 inline-flex rounded-full bg-[#171717] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#d5ff3f] hover:text-black"
            >
              Log in
            </Link>
          </div>
        ) : bookings.length === 0 ? (
          <div className="mx-auto flex max-w-md flex-col items-center rounded-3xl border border-black/10 bg-white p-10 text-center">
            <CalendarCheck className="text-neutral-300" size={34} />
            <h2 className="mt-4 text-xl font-bold">No active bookings</h2>
            <p className="mt-3 text-sm text-neutral-500">
              Request a studio and it will appear here. Cancelling a
              booking removes it completely.
            </p>
            <Link
              href="/studios"
              className="mt-7 inline-flex rounded-full bg-[#d5ff3f] px-6 py-3 text-sm font-bold text-black transition hover:bg-[#c6f02e]"
            >
              Explore studios
            </Link>
          </div>
        ) : (
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
            {bookings.map((booking) => (
              <BookingDetailsCard
                key={booking.id}
                booking={booking}
                onCancel={
                  ["pending", "confirmed"].includes(booking.status)
                    ? () => handleCancel(booking.id)
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
