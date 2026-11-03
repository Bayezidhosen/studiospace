import type { NextRequest } from "next/server";
import { io } from "next/cache";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getStudios, createStudio } from "@/lib/mongo";
import { validateStudioInput } from "@/lib/validate-studio";

export async function GET() {
  /* Always re-collect live studio data per request instead of baking the
     JSON into the static build (cacheComponents prerender opts out here). */
  await io();

  const studios = await getStudios();
  return NextResponse.json(studios);
}

/** Publish a new studio listing owned by the logged-in host. */
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return NextResponse.json(
      { error: "Please log in to publish a studio." },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const input = validateStudioInput(body);
  if (!input.ok) {
    return NextResponse.json({ error: input.error }, { status: 400 });
  }

  try {
    const studio = await createStudio(input.data, session.user.id);
    return NextResponse.json({ studio }, { status: 201 });
  } catch (error) {
    console.error("Failed to create studio:", error);
    return NextResponse.json(
      { error: "Could not save the studio. Please try again." },
      { status: 500 },
    );
  }
}
