
"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function BookButton({ studioName }: { studioName: string }) {
  const [loading, setLoading] = useState(false);

  const handleBook = async () => {
    if (loading) return;
    setLoading(true);

    // Simulated booking request until the booking flow is wired up.
    await new Promise((resolve) => setTimeout(resolve, 700));

    toast.success(`Booking request sent for ${studioName}.`);
    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={handleBook}
      disabled={loading}
      className="lime-button flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          Sending request...
        </>
      ) : (
        "Request Booking"
      )}
    </button>
  );
}
