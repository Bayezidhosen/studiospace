"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useSession } from "@/lib/auth-client";

/**
 * Client-side session guard shared by authenticated pages
 * (dashboard, studio creation, listings). Reuses the better-auth
 * session already configured in this project — no new auth system.
 *
 * While the session resolves the page shows its own loading state.
 * Unauthenticated visitors are redirected to /login.
 */
export function useRequireSession() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const user = session?.user ?? null;

  useEffect(() => {
    if (!isPending && !user) {
      router.replace("/login");
    }
  }, [isPending, user, router]);

  return { user, isPending };
}
