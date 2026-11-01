"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Aperture,
  Menu,
  X,
  ArrowUpRight,
  CalendarCheck,
} from "lucide-react";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Explore Studios", href: "/studios" },
  { name: "How It Works", href: "/#how-it-works" },
  { name: "About Us", href: "/#about" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [bookingCount, setBookingCount] = useState<number | null>(null);

  /* Booking record count collected from MongoDB for the logged-in user. */
  useEffect(() => {
    let cancelled = false;

    fetch("/api/bookings")
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled && data?.authenticated && Array.isArray(data.bookings)) {
          const active = data.bookings.filter(
            (booking: { status?: string }) =>
              booking.status && booking.status !== "cancelled"
          );
          setBookingCount(active.length);
        }
      })
      .catch(() => {
        /* Navbar works without booking data */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const BookingLabel = () => (
    <span className="flex items-center gap-1.5">
      <CalendarCheck size={15} />
      My Bookings
      {bookingCount !== null && bookingCount > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#d5ff3f] px-1.5 text-[11px] font-black text-black">
          {bookingCount}
        </span>
      )}
    </span>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f5f5f0]/90 backdrop-blur-xl">
      <nav className="container-custom flex h-20 items-center justify-between">

        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#171717] text-[#d5ff3f]">
            <Aperture size={23} />
          </div>
          <span className="text-2xl font-black tracking-tight">
            Studio<span className="text-neutral-500">Space.</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-neutral-600 transition hover:text-black"
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/bookings"
            className="flex items-center px-3 py-3 text-sm font-semibold text-neutral-700 transition hover:text-black"
          >
            <BookingLabel />
          </Link>

          <Link
            href="/login"
            className="px-4 py-3 text-sm font-semibold"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="lime-button flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold"
          >
            Get Started <ArrowUpRight size={17} />
          </Link>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="rounded-full border border-black/10 p-2 md:hidden"
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          {open ? <X /> : <Menu />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-black/10 bg-[#f5f5f0] p-5 md:hidden">
          <div className="flex flex-col gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="font-medium"
              >
                {link.name}
              </Link>
            ))}

            <Link
              href="/bookings"
              onClick={() => setOpen(false)}
              className="flex font-semibold"
            >
              <BookingLabel />
            </Link>

            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="font-semibold"
            >
              Login
            </Link>

            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="lime-button rounded-full px-5 py-3 text-center font-bold"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
