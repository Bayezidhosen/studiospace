"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, PartyPopper } from "lucide-react";
import { toast } from "sonner";

import { type Studio } from "@/lib/data/studios";
import { type Booking } from "@/lib/mongo";
import BookingDetailsCard from "@/components/studio/booking-details-card";

type Props = {
  open: boolean;
  onClose: () => void;
  onBooked?: (booking: Booking) => void;
  studio: Studio;
};

type Step = "form" | "confirm" | "success";

export default function BookingFlow({
  open,
  onClose,
  onBooked,
  studio,
}: Props) {
  const router = useRouter();
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const [step, setStep] = useState<Step>("form");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [hours, setHours] = useState(1);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState<Booking | null>(null);

  useEffect(() => {
    if (open) {
      setStep("form");
      setDate("");
      setTime("10:00");
      setHours(1);
      setMessage("");
      setSubmitting(false);
      setBooked(null);
    }
  }, [open]);

  if (!open) return null;

  const hourlyRate = studio.price;
  const deposit = studio.deposit ?? 0;
  const sessionTotal = hourlyRate * hours + deposit;

  const requestBooking = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studioId: studio.id,
          studioTitle: studio.name,
          studioCategory: studio.category,
          date,
          time,
          hours,
          message,
        }),
      });

      if (response.status === 401) {
        toast.error("Please log in to request a booking.");
        onClose();
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Booking failed.");
      }

      const created = (await response.json()) as Booking;
      setBooked(created);
      setStep("success");
      onBooked?.(created);
      toast.success("Booking request confirmed!");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Book ${studio.name}`}
      onClick={(event) => {
        if (event.target === event.currentTarget && !submitting) onClose();
      }}
    >
      <div className="relative my-auto w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="relative h-28">
          <Image
            src={studio.image}
            alt={studio.name}
            fill
            sizes="640px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/10" />

          <div className="absolute bottom-4 left-6 right-6 text-white">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d5ff3f]">
              {studio.category}
            </p>
            <h2 className="mt-1 truncate text-xl font-bold">
              {studio.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close booking dialog"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-neutral-800 transition hover:bg-black hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6">
          {/* STEP 1 — DETAILS FORM */}
          {step === "form" && (
            <div>
              <h3 className="text-lg font-bold">Booking details</h3>
              <p className="mt-1 text-sm text-neutral-500">
                Pick your shoot date and session length.
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="booking-date"
                    className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-500"
                  >
                    Shoot date
                  </label>
                  <input
                    id="booking-date"
                    type="date"
                    required
                    min={today}
                    value={date}
                    onChange={(event) =>
                      setDate(event.target.value)
                    }
                    className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="booking-time"
                    className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-500"
                  >
                    Start time
                  </label>
                  <input
                    id="booking-time"
                    type="time"
                    value={time}
                    onChange={(event) =>
                      setTime(event.target.value)
                    }
                    className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="booking-hours"
                    className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-500"
                  >
                    Booking length
                  </label>
                  <select
                    id="booking-hours"
                    value={hours}
                    onChange={(event) =>
                      setHours(Number(event.target.value))
                    }
                    className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none"
                  >
                    {Array.from({ length: 12 }, (_, index) => index + 1).map(
                      (value) => (
                        <option key={value} value={value}>
                          {value} hour{value > 1 ? "s" : ""} — $
                          {hourlyRate * value}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="booking-message"
                    className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-500"
                  >
                    Message to the host{" "}
                    <span className="font-normal normal-case text-neutral-400">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    id="booking-message"
                    rows={3}
                    value={message}
                    onChange={(event) =>
                      setMessage(event.target.value)
                    }
                    placeholder="Tell the host about your project, crew size or gear needs..."
                    className="w-full resize-none rounded-xl border border-black/10 px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Price breakdown */}
              <dl className="mt-5 space-y-2 rounded-2xl bg-[#f5f5f0] p-5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-neutral-500">
                    ${hourlyRate} / hr × {hours} h
                  </dt>
                  <dd className="font-semibold">${hourlyRate * hours}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Security deposit</dt>
                  <dd className="font-semibold">${deposit}</dd>
                </div>
                <div className="flex justify-between border-t border-black/10 pt-2.5">
                  <dt className="font-bold">Total</dt>
                  <dd className="text-lg font-black">${sessionTotal}</dd>
                </div>
              </dl>

              <button
                type="button"
                disabled={!date}
                onClick={() =>
                  setStep("confirm")
                }
                className="mt-5 flex w-full items-center justify-center rounded-full bg-[#d5ff3f] px-6 py-4 text-sm font-bold text-black transition hover:bg-[#c6f02e] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Review &amp; confirm
              </button>

              {!date && (
                <p className="mt-2.5 text-center text-xs text-neutral-400">
                  Choose a shoot date to continue.
                </p>
              )}
            </div>
          )}

          {/* STEP 2 — CONFIRMATION */}
          {step === "confirm" && (
            <div>
              <h3 className="text-lg font-bold">Confirm your booking</h3>
              <p className="mt-1 text-sm text-neutral-500">
                Double-check the details before sending the request.
              </p>

              <dl className="mt-5 divide-y divide-black/5 rounded-2xl border border-black/10 p-5 text-sm">
                <div className="flex justify-between py-2.5">
                  <dt className="text-neutral-500">Studio</dt>
                  <dd className="max-w-[60%] text-right font-semibold">
                    {studio.name}
                  </dd>
                </div>
                <div className="flex justify-between py-2.5">
                  <dt className="text-neutral-500">Date</dt>
                  <dd className="font-semibold">{date}</dd>
                </div>
                <div className="flex justify-between py-2.5">
                  <dt className="text-neutral-500">Start time</dt>
                  <dd className="font-semibold">{time}</dd>
                </div>
                <div className="flex justify-between py-2.5">
                  <dt className="text-neutral-500">Length</dt>
                  <dd className="font-semibold">
                    {hours} hour{hours > 1 ? "s" : ""}
                  </dd>
                </div>
                <div className="flex justify-between py-2.5">
                  <dt className="text-neutral-500">Total</dt>
                  <dd className="font-semibold">${sessionTotal}</dd>
                </div>
                {message && (
                  <div className="py-2.5">
                    <dt className="text-neutral-500">Your note</dt>
                    <dd className="mt-1 bg-[#f5f5f0] rounded-xl p-3 text-sm text-neutral-700">
                      {message}
                    </dd>
                  </div>
                )}
              </dl>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-full border border-black/10 px-5 py-4 text-sm font-bold text-neutral-700 transition hover:border-black disabled:opacity-60"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>

                <button
                  type="button"
                  onClick={requestBooking}
                  disabled={submitting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#171717] px-6 py-4 text-sm font-bold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Confirm booking"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 — SUCCESS + DETAILS CARD */}
          {step === "success" && booked && (
            <div>
              <div className="mb-5 flex items-center gap-3 rounded-2xl bg-[#d5ff3f]/20 px-5 py-4">
                <PartyPopper size={22} className="shrink-0 text-black" />
                <div>
                  <p className="text-sm font-bold text-black">
                    Booking request confirmed!
                  </p>
                  <p className="text-xs text-neutral-600">
                    The host will confirm your slot shortly.
                  </p>
                </div>
              </div>

              <BookingDetailsCard booking={booked} />

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-full border border-black/10 px-5 py-3.5 text-sm font-bold text-neutral-700 transition hover:border-black"
                >
                  Done
                </button>

                <Link
                  href="/bookings"
                  className="flex flex-1 items-center justify-center rounded-full bg-[#171717] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-black"
                >
                  View all bookings
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
