
import type { Metadata } from "next";
import Navbar from "@/components/layout/navber";
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
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
