import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import {
  deleteStudio,
  getStudioRecordById,
  updateStudio,
} from "@/lib/mongo";
import { validateStudioInput } from "@/lib/validate-studio";

type Params = { params: Promise<{ id: string }> };

/** Resolve the session and verify the record belongs to that user.
 *  Returns NextResponse only on failure; null means "proceed". */
async function requireOwnedStudio(
  req: NextRequest,
  id: string,
): Promise<
  | { ok: true; userId: string }
  | { ok: false; response: NextResponse }
> {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Please log in to manage your listings." },
        { status: 401 },
      ),
    };
  }

  const studio = await getStudioRecordById(id);

  if (!studio) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Studio not found." },
        { status: 404 },
      ),
    };
  }

  /* Ownership check: the id alone is never trusted. */
  if (studio.ownerId !== session.user.id) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "You can only manage your own listings." },
        { status: 403 },
      ),
    };
  }

  return { ok: true, userId: session.user.id };
}

/** Public single-studio record (also used by the owner's edit page). */
export async function GET(
  req: NextRequest,
  { params }: Params,
) {
  const { id } = await params;

  if (id.length > 200) {
    return NextResponse.json({ error: "Invalid studio id." }, { status: 400 });
  }

  try {
    const studio = await getStudioRecordById(id);

    if (!studio) {
      return NextResponse.json(
        { error: "Studio not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ studio });
  } catch (error) {
    console.error("Failed to load studio:", error);
    return NextResponse.json(
      { error: "Could not load the studio. Please try again." },
      { status: 500 },
    );
  }
}

/** Update an owned studio listing. */
export async function PATCH(
  req: NextRequest,
  { params }: Params,
) {
  const { id } = await params;
  const guard = await requireOwnedStudio(req, id);
  if (!guard.ok) return guard.response;

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
    const studio = await updateStudio(id, guard.userId, input.data);

    if (!studio) {
      return NextResponse.json(
        { error: "Studio not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ studio });
  } catch (error) {
    console.error("Failed to update studio:", error);
    return NextResponse.json(
      { error: "Could not update the studio. Please try again." },
      { status: 500 },
    );
  }
}

/** Delete an owned studio listing. */
export async function DELETE(
  req: NextRequest,
  { params }: Params,
) {
  const { id } = await params;
  const guard = await requireOwnedStudio(req, id);
  if (!guard.ok) return guard.response;

  try {
    const deleted = await deleteStudio(id, guard.userId);

    if (!deleted) {
      return NextResponse.json(
        { error: "Studio not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Failed to delete studio:", error);
    return NextResponse.json(
      { error: "Could not delete the studio. Please try again." },
      { status: 500 },
    );
  }
}
