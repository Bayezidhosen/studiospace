"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Building,
  LoaderCircle,
  SquarePlus,
} from "lucide-react";

import { useRequireSession } from "@/lib/use-require-session";

export default function MyStudioListingsPage() {
  const { user, isPending } = useRequireSession();

  /* Session guard is resolving or redirecting — hold the page. */
  if (isPending || !user) {
    return (
      <main className="flex min-h-[80vh] items-center justify-center bg-[#f5f5f0]">
        <LoaderCircle className="h-7 w-7 animate-spin text-neutral-400" />
      </main>
    );
  }

  return (
    <main className="min-h-[85vh] bg-[#f5f5f0] px-4 py-12 text-[#171717]">
      <div className="container-custom">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-400">
              Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              My Studio Listings
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              Manage the creative spaces you host on StudioSpace.
            </p>
          </div>

          <Link
            href="/studios/new"
            className="lime-button inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold"
          >
            <SquarePlus size={17} />
            Add New Studio
          </Link>
        </header>

        {/* Empty state: listing management lands with studio onboarding */}
        <section className="mt-10 rounded-3xl bg-white p-12 text-center shadow-sm ring-1 ring-black/5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#171717] text-[#d5ff3f]">
            <Building size={26} />
          </div>

          <h2 className="mt-5 text-xl font-bold tracking-tight">
            No listings yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
            Once studio onboarding is live, every space you publish will appear
            here with its bookings, ratings and earnings — all in one place.
          </p>

          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/studios/new"
              className="lime-button inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold"
            >
              <SquarePlus size={16} />
              Add Your First Studio
            </Link>

            <Link
              href="/studios"
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-bold transition hover:bg-neutral-50"
            >
              Explore Studios <ArrowUpRight size={16} />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
