
"use client";

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  BadgeCheck,
  Headphones,
  Clock3,
  MapPin,
  Star,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

import HeroSlider from "@/components/home/hero-slider";
import { studios, slides, categories } from "@/lib/data/studios";

const bookingSteps = [
  {
    number: "01",
    title: "Discover Spaces",
    description:
      "Explore unique creative workspaces that match your vision and budget.",
  },
  {
    number: "02",
    title: "Select Shoot Hours",
    description: "Choose your preferred date, time and booking duration.",
  },
  {
    number: "03",
    title: "Book Instantly",
    description:
      "Send your reservation and coordinate with your studio host.",
  },
  {
    number: "04",
    title: "Create & Produce",
    description:
      "Show up, get inspired and bring your creative ideas to life.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 35 },
  visible: { opacity: 1, y: 0 },
};

/* Static first-slide shell rendered while the slider hydrates. */
function HeroFallback() {
  return (
    <section className="dark-section relative">
      <div
        className="relative flex min-h-[650px] items-center bg-cover bg-center md:min-h-[730px]"
        style={{ backgroundImage: `url(${slides[0].image})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/20" />
        <div className="container-custom relative z-10 py-28">
          <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-8xl">
            {slides[0].title}
            <br />
            <span className="text-[#d5ff3f]">{slides[0].highlight}</span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-8 text-white/70 md:text-lg">
            {slides[0].description}
          </p>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="overflow-hidden">
      {/* HERO SLIDER */}
      <Suspense fallback={<HeroFallback />}>
        <HeroSlider />
      </Suspense>

      {/* STATS */}
      <section className="border-b border-black/10 bg-white">
        <div className="container-custom grid grid-cols-2 gap-8 py-10 md:grid-cols-4">
          {[
            ["500+", "Creative Spaces"],
            ["2.5K+", "Happy Creators"],
            ["40+", "Cities Covered"],
            ["4.9/5", "Average Rating"],
          ].map(([value, label]) => (
            <div key={label} className="text-center">
              <h3 className="text-3xl font-black tracking-tight md:text-4xl">
                {value}
              </h3>
              <p className="mt-2 text-xs font-medium text-neutral-500 md:text-sm">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED STUDIOS */}
      <section className="container-custom py-24 md:py-32">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end"
        >
          <div>
            <span className="text-xs font-bold tracking-[0.2em] text-neutral-500">
              CURATED FOR CREATORS
            </span>
            <h2 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
              Spaces worth
              <br />
              <span className="text-neutral-400">creating in.</span>
            </h2>
          </div>

          <Link
            href="/studios"
            className="flex items-center gap-2 text-sm font-bold"
          >
            View All Studios <ArrowUpRight size={18} />
          </Link>
        </motion.div>

        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {studios.map((studio, index) => (
            <motion.article
              key={studio.id}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="group overflow-hidden rounded-2xl border border-black/10 bg-white transition duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={studio.image}
                  alt={studio.name}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
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

                <h3 className="mt-2 text-xl font-bold">{studio.name}</h3>

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
                    Details <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="dark-section py-24 md:py-28">
        <div className="container-custom">
          <div className="mb-12 text-center">
            <span className="text-xs font-bold tracking-[0.2em] text-[#d5ff3f]">
              FIND YOUR CREATIVE SPACE
            </span>
            <h2 className="mt-4 text-4xl font-black text-white md:text-6xl">
              Made for every
              <span className="text-[#d5ff3f]"> vision.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/50">
              Whatever you create, there is a space designed to make it happen.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {categories.map((category, index) => {
              const Icon = category.icon;

              return (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={`/studios?category=${encodeURIComponent(category.name)}`}
                    className="group relative block h-72 overflow-hidden rounded-2xl"
                  >
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      sizes="(min-width: 1024px) 20vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition duration-700 group-hover:scale-110"
                    />                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                    <div className="absolute bottom-0 p-5">
                      <Icon className="mb-5 text-[#d5ff3f]" size={26} />
                      <h3 className="text-lg font-bold text-white">
                        {category.name}
                      </h3>
                      <p className="mt-1 text-xs text-white/60">
                        {category.count}
                      </p>
                    </div>

                    <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition group-hover:bg-[#d5ff3f] group-hover:text-black">
                      <ArrowUpRight size={18} />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="container-custom py-24 md:py-32"
      >
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="text-xs font-bold tracking-[0.2em] text-neutral-500">
              SIMPLE PROCESS
            </span>
            <h2 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
              From idea to
              <br />
              <span className="text-neutral-400">creation.</span>
            </h2>

            <p className="mt-6 max-w-md text-sm leading-8 text-neutral-500">
              Booking your next creative workspace should be as easy as
              bringing your ideas to life. Four simple steps are all it takes.
            </p>

            <Link
              href="/studios"
              className="lime-button mt-8 inline-flex items-center gap-3 rounded-full px-7 py-4 text-sm font-bold"
            >
              Find Your Studio <ArrowRight size={17} />
            </Link>
          </div>

          <div className="space-y-4">
            {bookingSteps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.12 }}
                className="group flex gap-5 rounded-2xl border border-black/10 p-6 transition hover:border-black hover:bg-white"
              >
                <span className="text-3xl font-black text-neutral-300 transition group-hover:text-black">
                  {step.number}
                </span>

                <div>
                  <h3 className="text-lg font-bold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-neutral-500">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOST GUARANTEE */}
      <section id="about" className="bg-[#e9eddf] py-24 md:py-28">
        <div className="container-custom">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="text-xs font-bold tracking-[0.2em] text-neutral-500">
                THE STUDIOSPACE PROMISE
              </span>

              <h2 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
                Create with
                <br />
                <span className="text-neutral-500">confidence.</span>
              </h2>

              <p className="mt-6 max-w-lg text-sm leading-8 text-neutral-600">
                We believe every creator deserves a safe, reliable and
                inspiring space. Our platform is built to make your creative
                journey easier.
              </p>

              <div className="mt-9 space-y-5">
                {[
                  "Verified host profiles",
                  "Transparent studio pricing",
                  "Secure booking management",
                  "Dedicated creator support",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="text-green-700" size={20} />
                    <span className="text-sm font-semibold">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  icon: ShieldCheck,
                  title: "Secure Spaces",
                  text: "Confidence in every booking.",
                },
                {
                  icon: BadgeCheck,
                  title: "Verified Hosts",
                  text: "Connect with trusted owners.",
                },
                {
                  icon: Headphones,
                  title: "Creator Support",
                  text: "Help when you need it.",
                },
                {
                  icon: Clock3,
                  title: "Flexible Hours",
                  text: "Work around your schedule.",
                },
              ].map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className={`rounded-2xl bg-white p-6 ${
                      index % 2 === 1 ? "mt-8" : ""
                    }`}
                  >
                    <Icon size={30} className="text-neutral-800" />
                    <h3 className="mt-6 font-bold">{item.title}</h3>
                    <p className="mt-2 text-xs leading-6 text-neutral-500">
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="dark-section px-4 py-24 text-center md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="container-custom"
        >
          <Sparkles className="mx-auto mb-7 text-[#d5ff3f]" size={36} />

          <span className="text-xs font-bold tracking-[0.2em] text-[#d5ff3f]">
            YOUR NEXT CREATION STARTS HERE
          </span>

          <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-black leading-tight text-white md:text-7xl">
            Don&apos;t just imagine it.
            <span className="text-[#d5ff3f]"> Create it.</span>
          </h2>

          <p className="mx-auto mt-6 max-w-lg text-sm leading-8 text-white/50">
            Find your space, meet your community and make something
            extraordinary.
          </p>

          <Link
            href="/studios"
            className="lime-button mt-9 inline-flex items-center gap-3 rounded-full px-8 py-4 text-sm font-bold"
          >
            Explore All Studios <ArrowUpRight size={18} />
          </Link>
        </motion.div>
      </section>
    </main>
  );
}
