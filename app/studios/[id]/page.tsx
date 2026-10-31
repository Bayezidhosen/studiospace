
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  MapPin,
  ShieldCheck,
  Star,
} from "lucide-react";

import BookButton from "@/components/studio/book-button";
import { studios } from "@/lib/data/studios";

type Params = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return studios.map((studio) => ({ id: studio.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const studio = studios.find((item) => item.id === id);

  if (!studio) return {};

  return {
    title: `${studio.name} | StudioSpace`,
    description: studio.description,
  };
}

export default async function StudioDetailPage({ params }: Params) {
  const { id } = await params;
  const studio = studios.find((item) => item.id === id);

  if (!studio) {
    notFound();
  }

  return (
    <main className="bg-[#f5f5f0]">
      <section className="container-custom py-10">
        <Link
          href="/studios"
          className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 transition hover:text-black"
        >
          <ArrowLeft size={16} />
          Back to all studios
        </Link>
      </section>

      <section className="container-custom pb-24">
        <div className="grid gap-10 lg:grid-cols-5">
          {/* GALLERY & DETAILS */}
          <div className="lg:col-span-3">
            <div className="relative h-96 overflow-hidden rounded-3xl">
              <Image
                src={studio.image}
                alt={studio.name}
                fill
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="object-cover"
              />

              <span className="absolute left-5 top-5 rounded-full bg-[#d5ff3f] px-4 py-2 text-[10px] font-black tracking-wider text-black">
                {studio.tag}
              </span>

              <div className="absolute bottom-5 right-5 flex items-center gap-1 rounded-full bg-white px-4 py-2 text-sm font-bold">
                <Star size={15} className="fill-yellow-400 text-yellow-400" />
                {studio.rating}
              </div>
            </div>

            <div className="mt-8 rounded-3xl bg-white p-8">
              <span className="text-xs font-bold text-neutral-500">
                {studio.category}
              </span>

              <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
                {studio.name}
              </h1>

              <p className="mt-3 flex items-center gap-2 text-sm text-neutral-500">
                <MapPin size={16} />
                {studio.location}
              </p>

              <p className="mt-6 leading-8 text-neutral-600">
                {studio.description}
              </p>

              <h2 className="mt-10 text-lg font-bold">What&apos;s included</h2>

              <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                {studio.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 rounded-2xl border border-black/10 p-4 text-sm font-semibold"
                  >
                    <CheckCircle2
                      size={18}
                      className="shrink-0 text-green-700"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* BOOKING CARD */}
          <div className="lg:col-span-2">
            <div className="sticky top-28 rounded-3xl border border-black/10 bg-white p-8 shadow-lg">
              <p className="text-4xl font-black">
                ${studio.price}
                <span className="text-base font-normal text-neutral-500">
                  {" "}/ hour
                </span>
              </p>

              <div className="mt-6 space-y-3 border-y border-black/10 py-6 text-sm">
                <p className="flex items-center gap-3 text-neutral-600">
                  <Clock3 size={16} className="text-neutral-400" />
                  Flexible daily &amp; hourly slots
                </p>
                <p className="flex items-center gap-3 text-neutral-600">
                  <ShieldCheck size={16} className="text-neutral-400" />
                  Secure booking management
                </p>
                <p className="flex items-center gap-3 text-neutral-600">
                  <BadgeCheck size={16} className="text-neutral-400" />
                  Verified studio host
                </p>
              </div>

              <div className="mt-6">
                <BookButton studioName={studio.name} />
              </div>

              <p className="mt-4 text-center text-xs text-neutral-500">
                You will coordinate directly with the host after booking.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
