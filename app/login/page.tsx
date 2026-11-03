
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { toast } from "sonner";
import {
  Aperture,
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const { error } = await signIn.email({
        email,
        password,
      });

      if (error) {
        toast.error(error.message || "Login failed.");
        return;
      }

      toast.success("Welcome back to StudioSpace!");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      /* Opens the Google OAuth flow; the browser is redirected away,
         so this state only keeps the button disabled until navigation. */
      setGoogleLoading(true);
      await signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch {
      toast.error("Google login failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  return (
    <main className="min-h-[85vh] bg-[#f5f5f0] px-4 py-12 text-[#171717]">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-3xl bg-white shadow-xl md:grid-cols-2">
        <section className="relative hidden min-h-162.5 flex-col justify-between overflow-hidden bg-[#171717] p-12 text-white md:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(213,255,63,0.22),transparent_35%)]" />

          <Link href="/" className="relative z-10 flex items-center gap-2 text-xl font-bold">
            <Aperture className="h-7 w-7 text-[#d5ff3f]" />
            StudioSpace
          </Link>

          <div className="relative z-10">
            <span className="mb-5 inline-block rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#d5ff3f]">
              Create without limits
            </span>

            <h1 className="max-w-md text-5xl font-semibold leading-tight">
              Your next great idea deserves a great space.
            </h1>

            <p className="mt-6 max-w-sm leading-7 text-white/60">
              Discover inspiring creative spaces, connect with hosts, and
              bring your best work to life.
            </p>
          </div>

          <p className="relative z-10 text-sm text-white/40">
            © 2026 StudioSpace. All rights reserved.
          </p>
        </section>

        <section className="flex items-center justify-center p-6 py-12 sm:p-12">
          <div className="w-full max-w-md">
            <Link href="/" className="mb-10 flex items-center gap-2 font-bold md:hidden">
              <Aperture className="h-7 w-7" />
              StudioSpace
            </Link>

            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-400">
              Welcome back
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              Sign in to your account
            </h2>

            <p className="mt-3 text-sm text-neutral-500">
              Enter your details to access your StudioSpace account.
            </p>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl border border-neutral-200 px-5 py-3.5 text-sm font-semibold transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {googleLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.9c-.58 2.96-2.25 5.47-4.73 7.16l7.65 5.93c4.46-4.12 7.16-10.2 7.16-17.56Z" />
                  <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19Z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.89l-7.65-5.93c-2.12 1.43-4.84 2.27-8.25 2.27-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
                </svg>
              )}
              Continue with Google
            </button>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-neutral-200" />
              <span className="text-xs uppercase tracking-wider text-neutral-400">
                or continue with email
              </span>
              <div className="h-px flex-1 bg-neutral-200" />
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold">
                  Email address
                </label>
                <div className="flex items-center rounded-xl border border-neutral-200 px-4 transition focus-within:border-neutral-900">
                  <Mail className="h-5 w-5 text-neutral-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent px-3 py-3.5 text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-semibold">
                  Password
                </label>
                <div className="flex items-center rounded-xl border border-neutral-200 px-4 transition focus-within:border-neutral-900">
                  <Lock className="h-5 w-5 text-neutral-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent px-3 py-3.5 text-sm outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="text-neutral-400 hover:text-neutral-800"
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d5ff3f] px-5 py-4 text-sm font-bold text-[#171717] transition hover:bg-[#c6f02e] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-neutral-500">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-bold text-neutral-900 underline underline-offset-4">
                Create account
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
