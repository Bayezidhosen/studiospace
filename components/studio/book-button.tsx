"use client";

import { useState } from "react";
import { CalendarPlus } from "lucide-react";

import type { Studio } from "@/lib/data/studios";
import BookingFlow from "@/components/studio/booking-flow";

export default function BookButton({ studio }: { studio: Studio }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lime-button flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-bold"
      >
        <CalendarPlus size={17} />
        Request Booking
      </button>

      <BookingFlow
        /* Remount on every open so the booking form always starts clean. */
        key={open ? "open" : "closed"}
        open={open}
        onClose={() => setOpen(false)}
        studio={studio}
      />
    </>
  );
}
