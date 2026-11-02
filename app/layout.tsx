
import type { Metadata } from "next";
import { Suspense } from "react";
import { Toaster } from "sonner";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudioSpace | Creative Spaces for Creators",
  description:
    "Discover and book premium photography studios, podcast rooms, music suites and creative workspaces.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased">
        <Suspense
          fallback={
            <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f5f5f0]/85 backdrop-blur-xl">
              <nav className="container-custom flex h-20 items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="h-10 w-10 rounded-full bg-black/10" />
                  <span className="text-2xl font-black tracking-tight">
                    Studio<span className="text-neutral-500">Space.</span>
                  </span>
                </span>
                <span className="h-11 w-11 rounded-full bg-black/10" />
              </nav>
            </header>
          }
        >
          <Navbar />
        </Suspense>
        <main>{children}</main>
        <Footer />
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
