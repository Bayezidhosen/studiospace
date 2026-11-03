import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getStudiosByOwner } from "@/lib/mongo";

/**
 * List studio records owned by the logged-in host. Ownership is resolved
 * from the server session (never sent by the client), so a user can only
 * ever receive their own listings.
 */
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return NextResponse.json(
      { error: "Please log in to see your listings." },
      { status: 401 },
    );
  }

  try {
    const studios = await getStudiosByOwner(session.user.id);
    return NextResponse.json({ studios });
  } catch (error) {
    console.error("Failed to load owned studios:", error);
    return NextResponse.json(
      { error: "Could not load your listings. Please try again." },
      { status: 500 },
    );
  }
}
