"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import {
  ArrowUpRight,
  Building,
  CalendarCheck,
  CircleCheck,
  Clock,
  LoaderCircle,
  SquarePlus,
} from "lucide-react";

import type { Booking } from "@/lib/mongo";
import { useRequireSession } from "@/lib/use-require-session";

/* Time-of-day greeting can only be computed on the client;
   this is React's hydration-safe way to detect the browser. */
const noopSubscribe = () => () => {};

function useIsClient() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/* Statuses are stored as free text in Mongo; normalise for display. */
function statusLabel(status: string | undefined) {
  const value = (status || "pending").toLowerCase();

  if (value === "pending") return { text: "Pending", className: "bg-amber-100 text-amber-700" };
  if (value === "confirmed") return { text: "Confirmed", className: "bg-[#d5ff3f]/40 text-neutral-900" };
  if (value === "completed") return { text: "Completed", className: "bg-emerald-100 text-emerald-700" };

  return { text: status || "Pending", className: "bg-neutral-100 text-neutral-600" };
}

export default function DashboardPage() {
  const { user, isPending } = useRequireSession();

  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const loadBookings = useCallback(() => {
    return fetch("/api/bookings")
      .then((response) => response.json())
      .then((data) => {
        setBookings(
          Array.isArray(data?.bookings)
            ? data.bookings.filter(
                (booking: Booking) =>
                  (booking.status || "pending").toLowerCase() !== "cancelled",
              )
            : [],
        );
      })
      .catch(() => setBookings([]));
  }, []);

  const userId = user?.id;

  useEffect(() => {
    if (isPending || !userId) return;

    let cancelled = false;

    loadBookings().finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [isPending, userId, loadBookings]);

  /* Time-based greeting is derived during the client render — no state,
     no effect, and no hydration mismatch thanks to useIsClient(). */
  const isClient = useIsClient();

  const greeting = isClient
    ? new Date().getHours() < 12
      ? "Good morning"
      : new Date().getHours() < 18
        ? "Good afternoon"
        : "Good evening"
    : "Hello";

  /* Session guard is resolving or redirecting — hold the page. */
  if (isPending || !user) {
    return (
      <main className="flex min-h-[80vh] items-center justify-center bg-[#f5f5f0]">
        <LoaderCircle className="h-7 w-7 animate-spin text-neutral-400" />
      </main>
    );
  }

  const pendingCount = bookings.filter(
    (booking) => (booking.status || "pending").toLowerCase() === "pending",
  ).length;
  const confirmedCount = bookings.filter(
    (booking) => (booking.status || "pending").toLowerCase() === "confirmed",
  ).length;

  const firstName =
    user.name?.trim().split(/\s+/)[0] ||
    user.email?.split("@")[0] ||
    "there";

  const quickActions = [
    {
      name: "Add New Studio",
      description: "List a creative space",
      href: "/studios/new",
      icon: SquarePlus,
    },
    {
      name: "My Studio Listings",
      description: "Manage your spaces",
      href: "/dashboard/listings",
      icon: Building,
    },
    {
      name: "My Bookings",
      description: "Upcoming shoots",
      href: "/bookings",
      icon: CalendarCheck,
      badge: pendingCount,
    },
    {
      name: "Explore Studios",
      description: "Find your next space",
      href: "/studios",
      icon: ArrowUpRight,
    },
  ];

  return (
    <main className="min-h-[85vh] bg-[#f5f5f0] px-4 py-10 text-[#171717]">
      <div className="container-custom">
        {/* Greeting header */}
        <header className="relative overflow-hidden rounded-3xl bg-[#171717] p-8 text-white shadow-xl sm:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(213,255,63,0.22),transparent_40%)]" />

          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d5ff3f]">
              {greeting}, {firstName}
            </p>

            <h1 className="mt-4 max-w-xl text-3xl font-black tracking-tight sm:text-4xl">
              Your creative command center.
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-7 text-white/60">
              Signed in as {user.email}. Manage bookings, list your studios and
              keep your creative projects moving — all from one place.
            </p>
          </div>
        </header>

        {/* Booking stats */}
        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            {
              label: "Total bookings",
              value: bookings.length,
              icon: CalendarCheck,
            },
            {
              label: "Pending requests",
              value: pendingCount,
              icon: Clock,
            },
            {
              label: "Confirmed",
              value: confirmedCount,
              icon: CircleCheck,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-neutral-500">
                  {stat.label}
                </p>
                <stat.icon size={18} className="text-[#171717]" />
              </div>
              <p className="mt-3 text-4xl font-black tabular-nums tracking-tight">
                {loading ? <span className="text-neutral-300">—</span> : stat.value}
              </p>
            </div>
          ))}
        </section>

        {/* Quick actions */}
        <section className="mt-10">
          <h2 className="text-lg font-bold tracking-tight">Quick actions</h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                href={action.href}
                className="group flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#171717] text-[#d5ff3f]">
                    <action.icon size={20} />
                  </div>
                  {"badge" in action && action.badge ? (
                    <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#d5ff3f] px-2 text-xs font-black text-black">
                      {action.badge}
                    </span>
                  ) : null}
                </div>

                <p className="mt-4 text-sm font-bold">{action.name}</p>
                <p className="mt-1 text-xs text-neutral-500">
                  {action.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent bookings */}
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight">Recent bookings</h2>
            <Link
              href="/bookings"
              className="text-sm font-semibold text-neutral-500 transition hover:text-black"
            >
              View all
            </Link>
          </div>

          {loading ? (
            <div className="mt-4 space-y-3">
              {[1, 2, 3].map((row) => (
                <div
                  key={row}
                  className="h-16 animate-pulse rounded-2xl bg-white ring-1 ring-black/5"
                />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="mt-4 rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-black/5">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#171717] text-[#d5ff3f]">
                <CalendarCheck size={22} />
              </div>
              <p className="mt-4 text-sm font-bold">No bookings yet</p>
              <p className="mt-1 text-sm text-neutral-500">
                Explore the studios and book your first creative space.
              </p>
              <Link
                href="/studios"
                className="lime-button mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold"
              >
                Explore Studios <ArrowUpRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {bookings.slice(0, 3).map((booking) => {
                const status = statusLabel(booking.status);

                return (
                  <Link
                    key={booking.id}
                    href={`/studios/${booking.studioId}`}
                    className="flex items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 transition hover:shadow-md"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">
                        {booking.studioTitle}
                      </p>
                      <p className="mt-1 truncate text-xs text-neutral-500">
                        {booking.date ? `${booking.date} · ` : ""}
                        {booking.time ?? ""}
                        {booking.confirmationCode
                          ? ` · ${booking.confirmationCode}`
                          : ""}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${status.className}`}
                    >
                      {status.text}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
