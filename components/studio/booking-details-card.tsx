"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  Calendar,
  Clock,
  Loader2,
  MapPin,
  User,
  X,
} from "lucide-react";

import type { Booking } from "@/lib/mongo";
import { isOptimizableImage } from "@/lib/image";

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-[#d5ff3f] text-black",
  cancelled: "bg-neutral-200 text-neutral-600",
  cancelling: "bg-amber-100 text-amber-800",
};

const CANCELLABLE = new Set(["pending", "confirmed", "cancelling"]);

const formatDateTime = (booking: Booking) => {
  if (!booking.date) return null;

  const date = new Date(`${booking.date}T${booking.time || "09:00"}`);
  if (Number.isNaN(date.getTime())) return booking.date;

  const dateLabel = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return booking.time
    ? `${dateLabel} · ${booking.time}`
    : dateLabel;
};

export default function BookingDetailsCard({
  booking,
  onCancel,
  onDismiss,
}: {
  booking: Booking;
  onCancel?: () => void;
  onDismiss?: () => void;
}) {
  const [askingCancel, setAskingCancel] = useState(false);
  const cancelling = booking.status === "cancelling";
  const canCancel = Boolean(onCancel) && CANCELLABLE.has(booking.status);
  const shootDate = formatDateTime(booking);

  return (
    <article className="overflow-hidden rounded-3xl border border-black/10 bg-white">
      {/* Studio visual */}
      <div className="relative h-40 w-full overflow-hidden bg-neutral-100">
        {booking.imageUrl ? (
          <Image
            src={booking.imageUrl}
            alt={booking.studioTitle}
            fill
            sizes="(min-width: 1024px) 400px, 100vw"
            unoptimized={!isOptimizableImage(booking.imageUrl)}
            className="object-cover"
          />
        ) : null}

        <span
          className={`absolute left-4 top-4 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${
            statusStyles[booking.status] ?? statusStyles.pending
          }`}
        >
          {booking.status}
        </span>

        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-neutral-800 transition hover:bg-black hover:text-white"
          >
            <X size={15} />
          </button>
        ) : null}
      </div>

      <div className="p-6">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-400">
          {booking.studioCategory || "Studio"}
        </p>

        <h3 className="mt-1 text-xl font-bold leading-snug">
          {booking.studioTitle}
        </h3>

        {booking.confirmationCode && (
          <p className="mt-2 inline-flex rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-bold tracking-wider text-neutral-700">
            CONF # {booking.confirmationCode}
          </p>
        )}

        <dl className="mt-5 space-y-2.5 border-t border-black/10 pt-5 text-sm">
          {shootDate && (
            <div className="flex items-center gap-2.5 text-neutral-700">
              <Calendar size={15} className="shrink-0 text-neutral-400" />
              <span>{shootDate}</span>
            </div>
          )}

          {typeof booking.hours === "number" && booking.hours > 0 && (
            <div className="flex items-center gap-2.5 text-neutral-700">
              <Clock size={15} className="shrink-0 text-neutral-400" />
              <span>
                {booking.hours} hour{booking.hours > 1 ? "s" : ""} booked
              </span>
            </div>
          )}

          {typeof booking.hourlyRate === "number" &&
            typeof booking.total === "number" && (
              <div className="flex items-center justify-between rounded-xl bg-[#f5f5f0] px-4 py-3">
                <span className="text-xs font-semibold text-neutral-500">
                  Rate
                </span>
                <span className="text-xs font-semibold text-neutral-700">
                  ${booking.hourlyRate} × {booking.hours ?? 1} h
                </span>
              </div>
            )}

          {booking.location && (
            <div className="flex items-start gap-2.5 text-neutral-700">
              <MapPin size={15} className="mt-0.5 shrink-0 text-neutral-400" />
              <span>{booking.location}</span>
            </div>
          )}

          {booking.hostName && (
            <div className="flex items-center gap-2.5 text-neutral-700">
              <User size={15} className="shrink-0 text-neutral-400" />
              <span>Host: {booking.hostName}</span>
            </div>
          )}
        </dl>

        {typeof booking.total === "number" && (
          <div className="mt-4 flex items-end justify-between rounded-xl bg-[#171717] px-5 py-4 text-white">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/60">
              Total
            </span>
            <span className="text-2xl font-black">
              ${booking.total}
              <span className="ml-1 text-xs font-normal text-white/50">
                incl. deposit
              </span>
            </span>
          </div>
        )}

        {booking.message && (
          <p className="mt-4 rounded-xl border border-black/10 p-4 text-sm leading-6 text-neutral-600">
            “{booking.message}”
          </p>
        )}

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-black/10 pt-5">
          <p className="text-xs text-neutral-400">
            Requested{" "}
            {booking.createdAt
              ? new Date(booking.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : "—"}
          </p>

          <div className="flex items-center gap-2">
            {canCancel && !askingCancel && !cancelling && (
              <button
                type="button"
                onClick={() => setAskingCancel(true)}
                className="flex items-center gap-1.5 rounded-full border border-black/10 px-3.5 py-2 text-xs font-bold text-neutral-600 transition hover:border-red-300 hover:text-red-600"
              >
                <X size={13} />
                Cancel
              </button>
            )}

            {canCancel && askingCancel && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-neutral-500">
                  Cancel this booking?
                </span>
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={cancelling}
                  className="rounded-full bg-red-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {cancelling ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    "Yes, cancel it"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setAskingCancel(false)}
                  disabled={cancelling}
                  className="rounded-full border border-black/10 px-3.5 py-2 text-xs font-bold text-neutral-700 transition hover:border-black disabled:opacity-60"
                >
                  Keep it
                </button>
              </div>
            )}

            {booking.studioId && (
              <Link
                href={`/studios/${booking.studioId}`}
                className="rounded-full bg-[#171717] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#d5ff3f] hover:text-black"
              >
                View studio
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
