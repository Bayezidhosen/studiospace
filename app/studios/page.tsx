
import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { io } from "next/cache";
import { ArrowUpRight, MapPin, SearchX, Star } from "lucide-react";

import { categories, studios as fallbackStudios, type Studio } from "@/lib/data/studios";
import { getStudios } from "@/lib/mongo";
import { isOptimizableImage } from "@/lib/image";

export const metadata: Metadata = {
  title: "Explore Studios | StudioSpace",
  description:
    "Browse every creative studio on StudioSpace. Filter by photo studios, sound stages, podcast rooms and more.",
};

const normalize = (value: string) =>
  value
    .toLowerCase()
    .split(/[\s-]+/)
    .map((word) => word.replace(/s$/, ""))
    .filter(Boolean)
    .join(" ");

function StudioCard({ studio }: { studio: Studio }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-black/10 bg-white transition duration-300 hover:-translate-y-2 hover:shadow-xl">
      <div className="relative h-64 overflow-hidden">
        <Image
          src={studio.image}
          alt={studio.name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          unoptimized={!isOptimizableImage(studio.image)}
          className="object-cover transition duration-700 group-hover:scale-110"
        />

        <span className="absolute left-4 top-4 rounded-full bg-[#d5ff3f] px-3 py-2 text-[10px] font-black tracking-wider text-black">
          {studio.tag}
        </span>

        <div className="absolute bottom-4 right-4 flex items-center gap-1 rounded-full bg-white px-3 py-2 text-xs font-bold">
          <Star size={14} className="fill-yellow-400 text-yellow-400" />
          {studio.rating}
        </div>
      </div>

      <div className="p-6">
        <span className="text-xs font-bold text-neutral-500">
          {studio.category}
        </span>

        <h2 className="mt-2 text-xl font-bold">{studio.name}</h2>

        <p className="mt-3 flex items-center gap-2 text-sm text-neutral-500">
          <MapPin size={15} />
          {studio.location}
        </p>

        <div className="mt-6 flex items-center justify-between border-t border-black/10 pt-5">
          <p className="text-xl font-black">
            ${studio.price}
            <span className="text-xs font-normal text-neutral-500">
              {" "}/ hr
            </span>
          </p>

          <Link
            href={`/studios/${studio.id}`}
            className="flex items-center gap-2 rounded-full bg-[#171717] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#d5ff3f] hover:text-black"
          >
            Details <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ---------- Results (depends on searchParams, streams in) ---------- */

async function StudioResults({
  searchParamsParams,
}: {
  searchParamsParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParamsParams;

  /* Keep the MongoDB read strictly at request time: without io() the
     prerender pass during `next build` tries to resolve this promise and
     Atlas injection happens on the build machine (which baked the static
     fallback into the shell and made builds flaky). */
  await io();

  const studios = await getStudios();

  const activeQuery = category?.trim() || "";
  const activeCategory = categories.find(
    (item) => normalize(item.name) === normalize(activeQuery),
  );

  let filtered = studios;
  if (activeCategory) {
    filtered = studios.filter(
      (studio) =>
        normalize(studio.category) === normalize(activeCategory.name),
    );
  }

  const showingNotice = activeCategory && filtered.length === 0;
  if (showingNotice) {
    filtered = studios;
  }

  return (
    <>
      {/* FILTER CHIPS */}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/studios"
          className={`rounded-full border px-5 py-2.5 text-sm font-bold transition ${
            activeCategory
              ? "border-black/10 bg-white text-neutral-600 hover:border-black"
              : "border-black bg-[#171717] text-white"
          }`}
        >
          All Spaces
        </Link>

        {categories.map((item) => {
          const isActive =
            activeCategory && item.name === activeCategory.name;

          return (
            <Link
              key={item.name}
              href={`/studios?category=${encodeURIComponent(item.name)}`}
              className={`rounded-full border px-5 py-2.5 text-sm font-bold transition ${
                isActive
                  ? "border-black bg-[#171717] text-white"
                  : "border-black/10 bg-white text-neutral-600 hover:border-black"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </div>

      {showingNotice && (
        <p className="mt-5 flex items-center gap-2 text-sm text-neutral-500">
          <SearchX size={16} />
          No spaces match “{activeCategory.name}” yet — showing everything
          we have.
        </p>
      )}

      <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((studio) => (
          <StudioCard key={studio.id} studio={studio} />
        ))}
      </div>
    </>
  );
}

function ResultsFallback() {
  return (
    <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
      {fallbackStudios.map((studio) => (
        <StudioCard key={studio.id} studio={studio} />
      ))}
    </div>
  );
}

/* ---------- Page shell (static, prerenderable) ---------- */

export default function StudiosPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  return (
    <main className="bg-[#f5f5f0]">
      {/* HEADER */}
      <section className="dark-section py-20 text-center md:py-24">
        <div className="container-custom">
          <span className="text-xs font-bold tracking-[0.2em] text-[#d5ff3f]">
            EVERY SPACE, ONE PLACE
          </span>
          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
            Explore studios.
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-white/50">
            Hand-picked creative workspaces ready for your next shoot,
            session or idea.
          </p>
        </div>
      </section>

      {/* RESULTS */}
      <section className="container-custom py-10 pb-24">
        <Suspense fallback={<ResultsFallback />}>
          <StudioResults searchParamsParams={searchParams} />
        </Suspense>
      </section>
    </main>
  );
}
