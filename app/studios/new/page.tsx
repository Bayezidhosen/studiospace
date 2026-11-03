"use client";

import Link from "next/link";
import { Aperture, ArrowLeft, LoaderCircle, PenLine, Tag, UploadCloud } from "lucide-react";

import { useRequireSession } from "@/lib/use-require-session";
import StudioForm from "@/components/studio/studio-form";

const tips = [
  {
    step: "01",
    title: "Describe your space",
    icon: PenLine,
  },
  {
    step: "02",
    title: "Add a cover photo & amenities",
    icon: UploadCloud,
  },
  {
    step: "03",
    title: "Set pricing & publish",
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
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-3xl bg-white shadow-xl md:grid-cols-[minmax(0,380px)_1fr]">
        {/* Left: welcome panel */}
        <section className="relative hidden min-h-[650px] flex-col justify-between overflow-hidden bg-[#171717] p-10 text-white md:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(213,255,63,0.22),transparent_35%)]" />

          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold">
              <Aperture className="h-7 w-7 text-[#d5ff3f]" />
              StudioSpace
            </Link>

            <span className="mt-8 inline-block rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#d5ff3f]">
              Host on StudioSpace
            </span>

            <h1 className="mt-6 max-w-md text-4xl font-semibold leading-tight">
              Turn your space into a creator destination.
            </h1>

            <ol className="mt-10 space-y-4">
              {tips.map((item) => (
                <li key={item.step} className="flex items-center gap-3 text-sm text-white/70">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 text-[#d5ff3f]">
                    <item.icon size={15} />
                  </span>
                  {item.title}
                </li>
              ))}
            </ol>
          </div>

          <p className="relative z-10 text-sm text-white/40">
            Signed in as {user.email}
          </p>
        </section>

        {/* Right: the real listing form */}
        <section className="p-6 py-10 sm:p-12">
          <div className="mb-8">
            <Link
              href="/dashboard/listings"
              className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 transition hover:text-black"
            >
              <ArrowLeft size={15} />
              Back to my listings
            </Link>

            <h2 className="mt-5 text-3xl font-bold tracking-tight">
              List your studio
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              Fill in the details below. Your listing goes live in the
              explore page as soon as you publish.
            </p>
          </div>

          <StudioForm mode="create" />
        </section>
      </div>
    </main>
  );
}
