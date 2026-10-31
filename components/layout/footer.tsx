
import Link from "next/link";
import { Aperture, Camera, Play, ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="dark-section pt-16">
      <div className="container-custom">

        <div className="grid gap-12 border-b border-white/10 pb-14 md:grid-cols-2 lg:grid-cols-4">

          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3">
              <Aperture className="text-[#d5ff3f]" size={32} />
              <span className="text-3xl font-black">
                StudioSpace.
              </span>
            </Link>

            <p className="mt-6 max-w-md text-sm leading-7 text-neutral-400">
              Discover extraordinary creative spaces.
              Connect with studio owners, book your perfect
              workspace and bring your creative vision to life.
            </p>

            <div className="mt-6 flex gap-4">
              <a href="https://instagram.com" aria-label="Instagram">
                <Camera />
              </a>
              <a href="https://youtube.com" aria-label="YouTube">
                <Play />
              </a>
              <a href="https://x.com" aria-label="X">
                <span className="text-xl font-bold">𝕏</span>
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-5 font-bold">Explore</h3>
            <div className="flex flex-col gap-4 text-sm text-neutral-400">
              <Link href="/studios">All Studios</Link>
              <Link href="/studios">Photography Studios</Link>
              <Link href="/studios">Podcast Rooms</Link>
              <Link href="/studios">Music Suites</Link>
            </div>
          </div>

          <div>
            <h3 className="mb-5 font-bold">Company</h3>
            <div className="flex flex-col gap-4 text-sm text-neutral-400">
              <Link href="/#about">About Us</Link>
              <Link href="/#how-it-works">How It Works</Link>
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
            </div>
          </div>

        </div>

        <div className="flex flex-col justify-between gap-4 py-7 text-xs text-neutral-500 sm:flex-row">
          <p>© 2026 StudioSpace. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made for creators <ArrowUpRight size={13} />
          </p>
        </div>

      </div>
    </footer>
  );
}
