import { NextRequest, NextResponse } from "next/server";
import { searchPhotos } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  if (!query.trim()) {
    return NextResponse.json({ photos: [] });
  }
  const photos = await searchPhotos(query);
  return NextResponse.json({ photos });
}
