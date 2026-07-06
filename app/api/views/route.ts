import { NextRequest, NextResponse } from "next/server";
import { createPageView } from "@/lib/db/queries";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, albumId, photoId } = body;

    if (typeof path !== "string" || !path) {
      return NextResponse.json({ error: "path is required" }, { status: 400 });
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    const userAgent = request.headers.get("user-agent") ?? null;

    await createPageView({
      path,
      albumId: typeof albumId === "string" ? albumId : undefined,
      photoId: typeof photoId === "string" ? photoId : undefined,
      ip: ip ?? undefined,
      userAgent: userAgent ?? undefined,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
