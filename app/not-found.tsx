
import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="dark-section flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <SearchX className="mb-6 text-[#d5ff3f]" size={44} />

      <h1 className="text-5xl font-black">Page not found.</h1>

      <p className="mt-4 max-w-md text-sm leading-7 text-white/60">
        The space you are looking for does not exist or may have been moved.
      </p>

      <Link
        href="/"
        className="lime-button mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold"
      >
        <ArrowLeft size={16} />
        Back to home
      </Link>
    </main>
  );
}
