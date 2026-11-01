import { NextResponse } from "next/server";

import { getStudios } from "@/lib/mongo";

export async function GET() {
  const studios = await getStudios();
  return NextResponse.json(studios);
}
