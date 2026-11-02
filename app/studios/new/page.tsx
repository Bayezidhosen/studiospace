"use client";

import Link from "next/link";
import { Image, PenLine, Tag, LoaderCircle } from "lucide-react";

import { useRequireSession } from "@/lib/use-require-session";

const steps = [
  {
    step: "01",
    title: "Describe your space",
    description:
      "Add the studio name, category, location and what makes your space special for creators.",
    icon: PenLine,
  },
  {
    step: "02",
    title: "Upload photos & amenities",
    description:
      "Show off the space with high-quality photos and list the equipment and amenities available.",
    icon: Image,
  },
  {
    step: "03",
    title: "Set pricing & publish",
    description:
      "Choose your hourly rate and security deposit, review the details and publish your listing.",
    icon: Tag,
  },
];

export default function AddNewStudioPage() {
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
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-3xl bg-white shadow-xl md:grid-cols-2">
        {/* Left: welcome panel */}
        <section className="relative hidden min-h-[650px] flex-col justify-between overflow-hidden bg-[#171717] p-12 text-white md:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(213,255,63,0.22),transparent_35%)]" />

          <div className="relative z-10">
            <span className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#d5ff3f]">
              Host on StudioSpace
            </span>

            <h1 className="mt-6 max-w-md text-5xl font-semibold leading-tight">
              Turn your space into a creator destination.
            </h1>

            <p className="mt-6 max-w-sm leading-7 text-white/60">
              Photography studios, podcast rooms, music suites — list your
              space and welcome creators from day one.
            </p>
          </div>

          <p className="relative z-10 text-sm text-white/40">
            © 2026 StudioSpace. All rights reserved.
          </p>
        </section>

        {/* Right: listing flow preview */}
        <section className="flex items-center justify-center p-6 py-12 sm:p-12">
          <div className="w-full max-w-md">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-400">
              Add New Studio
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              Studio onboarding is on its way
            </h2>

            <p className="mt-3 text-sm leading-6 text-neutral-500">
              We&apos;re finalising the upload flow so you can publish your
              first listing with confidence. Here&apos;s what it will look
              like:
            </p>

            <ol className="mt-8 space-y-4">
              {steps.map((item) => (
                <li
                  key={item.step}
                  className="flex gap-4 rounded-2xl border border-neutral-200 p-4 transition-colors hover:border-neutral-900"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#171717] text-[#d5ff3f]">
                    <item.icon size={18} />
                  </div>
                  <div>
                    <p className="flex items-center gap-2 text-sm font-bold">
                      {item.title}
                      <span className="text-xs font-black text-neutral-300">
                        {item.step}
                      </span>
                    </p>
                    <p className="mt-1 text-xs leading-5 text-neutral-500">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <Link
              href="/dashboard"
              className="mt-8 flex w-full items-center justify-center rounded-xl bg-[#d5ff3f] px-5 py-4 text-sm font-bold text-[#171717] transition hover:bg-[#c6f02e]"
            >
              Back to Dashboard
            </Link>

            <p className="mt-4 text-center text-xs text-neutral-400">
              Signed in as {user.email}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
