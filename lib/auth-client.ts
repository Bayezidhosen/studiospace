
import { createAuthClient } from "better-auth/react";

/* No baseURL: all Better Auth calls are same-origin relative to the site
   itself, and better-auth infers window.location.origin automatically.
   A hardcoded localhost fallback broke authentication whenever
   NEXT_PUBLIC_APP_URL was not configured on the hosting provider. */
export const authClient = createAuthClient();

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;
