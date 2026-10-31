
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Swiper as SwiperType } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";

import { slides } from "@/lib/data/studios";

const fadeUp = {
  hidden: { opacity: 0, y: 35 },
  visible: { opacity: 1, y: 0 },
};

export default function HeroSlider() {
  const [activeSlide, setActiveSlide] = useState(0);

  return (
    <section className="dark-section relative">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{ clickable: true }}
        loop
        onSwiper={(swiper: SwiperType) =>
          setActiveSlide(swiper.realIndex)
        }
        onSlideChange={(swiper: SwiperType) =>
          setActiveSlide(swiper.realIndex)
        }
        className="home-hero"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div
              className="relative flex min-h-[650px] items-center bg-cover bg-center md:min-h-[730px]"
              style={{
                backgroundImage: `url(${slide.image})`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/20" />
              <div className="container-custom relative z-10 py-28">
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  transition={{ duration: 0.8 }}
                  className="max-w-3xl"
                >
                  <div className="mb-7 flex items-center gap-3">
                    <span className="h-[2px] w-10 bg-[#d5ff3f]" />
                    <span className="text-xs font-bold tracking-[0.25em] text-[#d5ff3f]">
                      {slide.eyebrow}
                    </span>
                  </div>

                  <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-8xl">
                    {slide.title}
                    <br />
                    <span className="text-[#d5ff3f]">
                      {slide.highlight}
                    </span>
                  </h1>

                  <p className="mt-7 max-w-xl text-base leading-8 text-white/70 md:text-lg">
                    {slide.description}
                  </p>

                  <div className="mt-10 flex flex-wrap gap-4">
                    <Link
                      href="/studios"
                      className="lime-button flex items-center gap-3 rounded-full px-7 py-4 text-sm font-bold"
                    >
                      Explore Studios <ArrowUpRight size={18} />
                    </Link>

                    <Link
                      href="/register"
                      className="rounded-full border border-white/40 px-7 py-4 text-sm font-bold text-white transition hover:bg-white hover:text-black"
                    >
                      Host Your Space
                    </Link>
                  </div>
                </motion.div>
              </div>

              <div className="absolute bottom-12 right-10 z-10 hidden text-right text-white/60 md:block">
                <p className="text-xs tracking-widest">
                  CREATIVITY STARTS HERE
                </p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {String(activeSlide + 1).padStart(2, "0")} /{" "}
                  {String(slides.length).padStart(2, "0")}
                </p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="absolute bottom-0 left-0 z-20 h-1 w-full bg-white/10">
        <div
          className="h-full bg-[#d5ff3f] transition-all duration-500"
          style={{
            width: `${100 / slides.length}%`,
            marginLeft: `${(activeSlide * 100) / slides.length}%`,
          }}
        />
      </div>
    </section>
  );
}
