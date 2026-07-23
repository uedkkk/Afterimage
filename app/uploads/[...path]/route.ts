import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

const CONTENT_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".avif": "image/avif",
  ".gif": "image/gif",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  const safePath = path
    .join(process.cwd(), "public", "uploads", ...segments)
    .replace(/\\/g, "/");

  const resolvedPublic = path.resolve(process.cwd(), "public", "uploads");
  const resolvedFile = path.resolve(safePath);

  if (!resolvedFile.startsWith(resolvedPublic)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    await stat(resolvedFile);
    const buffer = await readFile(resolvedFile);
    const ext = path.extname(resolvedFile).toLowerCase();
    const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
}
