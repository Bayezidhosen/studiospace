"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { signOut, useSession } from "@/lib/auth-client";
import {
  Aperture,
  ArrowUpRight,
  Building,
  CalendarCheck,
  ChevronDown,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Menu,
  SquarePlus,
  X,
} from "lucide-react";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Explore Studios", href: "/studios" },
  { name: "How It Works", href: "/#how-it-works" },
  { name: "About Us", href: "/#about" },
];

/** Account destinations shared by the desktop dropdown and the mobile drawer. */
const accountMenuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Add New Studio", href: "/studios/new", icon: SquarePlus },
  { name: "My Studio Listings", href: "/dashboard/listings", icon: Building },
];

type UserLike = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

function getInitials(user: UserLike) {
  const fromName = (user.name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  if (fromName) return fromName;
  return (user.email ?? "U").trim().charAt(0).toUpperCase();
}

/** Exact match for "/", nested-path match for everything else. */
function isRouteActive(pathname: string, href: string) {
  if (href.startsWith("/#")) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Avatar with the user's photo and a beautiful initials fallback. */
function UserAvatar({
  user,
  className = "",
}: {
  user: UserLike;
  className?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const hasImage = Boolean(user.image) && !imageFailed;

  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#171717] text-[#d5ff3f] ring-1 ring-black/10 ${className}`}
    >
      {hasImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.image ?? ""}
          alt={user.name || user.email || "Profile"}
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className="font-bold tracking-tight">{getInitials(user)}</span>
      )}
    </span>
  );
}

const dropdownItemClass =
  "flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-medium text-neutral-700 transition-colors duration-150 hover:bg-[#171717] hover:text-white";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending: isSessionPending } = useSession();
  const user = session?.user;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [bookingCount, setBookingCount] = useState<number | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  /* Sticky header: subtle premium shadow once the page is scrolled. */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Close the account dropdown on outside clicks and Escape. */
  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  /* Booking record count collected from MongoDB once the session resolves. */
  useEffect(() => {
    if (isSessionPending) return;

    let cancelled = false;

    fetch("/api/bookings")
      .then((response) => response.json())
      .then((data) => {
        if (cancelled) return;

        if (data?.authenticated && Array.isArray(data.bookings)) {
          /* Case-insensitive, matching the API's own cancelled filter. */
          const active = data.bookings.filter(
            (booking: { status?: string }) =>
              (booking.status || "pending").toLowerCase() !== "cancelled",
          );
          setBookingCount(active.length);
        } else {
          setBookingCount(null);
        }
      })
      .catch(() => {
        /* Navbar works without booking data */
      });

    return () => {
      cancelled = true;
    };
  }, [isSessionPending]);

  /* Real sign-out through the better-auth client: clears the HTTP-only
     session cookie on the server, then returns the user to the homepage. */
  const handleLogout = async () => {
    if (signingOut) return;

    setSigningOut(true);
    try {
      const { error } = await signOut();

      if (error) {
        toast.error(error.message || "Could not sign out. Please try again.");
        return;
      }

      toast.success("Signed out successfully. See you soon!");
      setMenuOpen(false);
      setMobileOpen(false);
      setBookingCount(null);
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSigningOut(false);
    }
  };

  const bookingBadge =
    bookingCount !== null && bookingCount > 0 ? (
      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#d5ff3f] px-1.5 text-[11px] font-black text-black">
        {bookingCount}
      </span>
    ) : null;

  /* Desktop nav link with a lime underline indicator for active routes. */
  const NavItem = ({ name, href }: { name: string; href: string }) => {
    const active = isRouteActive(pathname, href);

    return (
      <Link
        href={href}
        className={`relative text-sm font-medium transition-colors duration-200 hover:text-black ${
          active ? "text-black" : "text-neutral-600"
        }`}
      >
        {name}
        <span
          aria-hidden="true"
          className={`absolute -bottom-2 left-0 h-0.5 w-full rounded-full bg-[#d5ff3f] transition-all duration-300 ${
            active ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
          }`}
        />
      </Link>
    );
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b border-black/10 bg-[#f5f5f0]/85 backdrop-blur-xl transition-shadow duration-300 ${
        scrolled ? "shadow-[0_10px_30px_-12px_rgba(0,0,0,0.25)]" : ""
      }`}
    >
      <nav className="container-custom flex h-20 items-center justify-between">

        <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#171717] text-[#d5ff3f]">
            <Aperture size={23} />
          </div>
          <span className="text-2xl font-black tracking-tight">
            Studio<span className="text-neutral-500">Space.</span>
          </span>
        </Link>

        {/* Desktop navigation with active route indicators */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <NavItem key={link.href} name={link.name} href={link.href} />
          ))}
        </div>

        {/* Desktop right cluster: bookings + auth-aware actions */}
        <div className="hidden items-center gap-3 md:flex">
          {user && (
            <Link
              href="/bookings"
              className="flex items-center gap-1.5 px-3 py-3 text-sm font-semibold text-neutral-700 transition hover:text-black"
            >
              <CalendarCheck size={15} />
              My Bookings
              {bookingBadge}
            </Link>
          )}

          {isSessionPending && (
            <span
              aria-hidden="true"
              className="h-11 w-11 animate-pulse rounded-full bg-black/10"
            />
          )}

          {user && (
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className={`flex items-center gap-2 rounded-full border bg-white/60 py-1.5 pl-1.5 pr-2.5 outline-none transition-all duration-200 hover:bg-white focus-visible:ring-2 focus-visible:ring-[#d5ff3f] ${
                  menuOpen ? "border-black/25 bg-white" : "border-black/10"
                }`}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="Open account menu"
              >
                <UserAvatar user={user} className="h-9 w-9 text-sm" />
                <ChevronDown
                  size={16}
                  className={`text-neutral-500 transition-transform duration-200 ${
                    menuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  aria-label="Account menu"
                  className="absolute right-0 top-[calc(100%+14px)] w-72 origin-top-right rounded-2xl border border-black/10 bg-white/95 p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150"
                >
                  {/* Profile header: name + email from the live session */}
                  <div className="flex items-center gap-3 px-2.5 pb-3 pt-2">
                    <UserAvatar
                      user={user}
                      className="h-11 w-11 text-base ring-2 ring-[#d5ff3f]/50"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-neutral-900">
                        {user.name || "StudioSpace User"}
                      </p>
                      <p className="truncate text-xs text-neutral-500">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="-mx-1.5 my-1 h-px bg-black/5" />

                  {accountMenuItems.map((item) => {
                    const active = isRouteActive(pathname, item.href);

                    return (
                      <Link
                        key={item.href}
                        role="menuitem"
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className={dropdownItemClass}
                      >
                        <item.icon size={17} className="shrink-0 opacity-60" />
                        {item.name}
                        {active && (
                          <span
                            aria-hidden="true"
                            className="ml-auto h-1.5 w-1.5 rounded-full bg-[#d5ff3f]"
                          />
                        )}
                      </Link>
                    );
                  })}

                  <Link
                    role="menuitem"
                    href="/bookings"
                    onClick={() => setMenuOpen(false)}
                    className={dropdownItemClass}
                  >
                    <CalendarCheck size={17} className="shrink-0 opacity-60" />
                    My Bookings
                    {bookingBadge && <span className="ml-auto">{bookingBadge}</span>}
                  </Link>

                  <div className="-mx-1.5 my-1 h-px bg-black/5" />

                  {/* Real sign-out via the better-auth client */}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    disabled={signingOut}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-medium text-red-500 transition-colors duration-150 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {signingOut ? (
                      <LoaderCircle
                        size={17}
                        className="shrink-0 animate-spin"
                      />
                    ) : (
                      <LogOut size={17} className="shrink-0" />
                    )}
                    {signingOut ? "Signing out..." : "Logout"}
                  </button>
                </div>
              )}
            </div>
          )}

          {!isSessionPending && !user && (
            <>
              <Link
                href="/login"
                className="px-4 py-3 text-sm font-semibold"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="lime-button flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold"
              >
                Register <ArrowUpRight size={17} />
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileOpen((open) => !open)}
          className="rounded-full border border-black/10 p-2 md:hidden"
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Mobile navigation drawer */}
      {mobileOpen && (
        <div className="border-t border-black/10 bg-[#f5f5f0]/95 p-5 backdrop-blur-xl duration-200 md:hidden animate-in fade-in-0 slide-in-from-top-1">
          <div className="flex flex-col gap-1.5">
            {user && (
              <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-black/5">
                <UserAvatar user={user} className="h-12 w-12 text-lg" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-neutral-900">
                    {user.name || "StudioSpace User"}
                  </p>
                  <p className="truncate text-xs text-neutral-500">
                    {user.email}
                  </p>
                </div>
              </div>
            )}

            {navLinks.map((link) => {
              const active = isRouteActive(pathname, link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                    active
                      ? "bg-black/5 text-black"
                      : "text-neutral-600 hover:bg-black/5 hover:text-black"
                  }`}
                >
                  {link.name}
                  {active && (
                    <span
                      aria-hidden="true"
                      className="ml-auto h-1.5 w-1.5 rounded-full bg-[#d5ff3f]"
                    />
                  )}
                </Link>
              );
            })}

            {accountMenuItems.map((item) => {
              const active = isRouteActive(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                    active
                      ? "bg-black/5 text-black"
                      : "text-neutral-600 hover:bg-black/5 hover:text-black"
                  }`}
                >
                  <item.icon
                    size={17}
                    className={active ? "text-black" : "opacity-50"}
                  />
                  {item.name}
                  {active && (
                    <span
                      aria-hidden="true"
                      className="ml-auto h-1.5 w-1.5 rounded-full bg-[#d5ff3f]"
                    />
                  )}
                </Link>
              );
            })}

            {user ? (
              <>
                <Link
                  href="/bookings"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                    isRouteActive(pathname, "/bookings")
                      ? "bg-black/5 text-black"
                      : "text-neutral-600 hover:bg-black/5 hover:text-black"
                  }`}
                >
                  <CalendarCheck size={17} className="opacity-50" />
                  My Bookings
                  {bookingBadge && <span className="ml-auto">{bookingBadge}</span>}
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={signingOut}
                  className="mt-2 flex items-center gap-3 rounded-xl border border-red-200 px-3 py-3 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {signingOut ? (
                    <LoaderCircle size={17} className="animate-spin" />
                  ) : (
                    <LogOut size={17} />
                  )}
                  {signingOut ? "Signing out..." : "Logout"}
                </button>
              </>
            ) : (
              !isSessionPending && (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center rounded-xl px-3 py-3 text-sm font-semibold text-neutral-700 transition-colors hover:bg-black/5 hover:text-black"
                  >
                    Login
                  </Link>

                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="lime-button mt-2 rounded-xl px-5 py-3 text-center font-bold"
                  >
                    Get Started
                  </Link>
                </>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
}
