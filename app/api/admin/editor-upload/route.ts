import { NextRequest, NextResponse } from "next/server";
import path from "path";
import crypto from "crypto";
import { getSession } from "@/lib/auth/session";
import { saveUploadedFile } from "@/lib/storage";

const EDITOR_DIR = path.join(process.cwd(), "public/uploads/editor");

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
  "video/mp4",
  "video/webm",
  "audio/mp3",
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "audio/m4a",
];

function toWebPath(fsPath: string): string {
  return fsPath
    .replace(path.join(process.cwd(), "public"), "")
    .replace(/\\/g, "/");
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const files = formData.getAll("files");

  const results: { url: string; fileName: string }[] = [];
  const errors: { fileName: string; message: string }[] = [];

  for (const file of files) {
    if (!(file instanceof File)) continue;
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      errors.push({
        fileName: file.name,
        message: `不支持的文件类型: ${file.type}`,
      });
      continue;
    }
    try {
      const saved = await saveUploadedFile(file, EDITOR_DIR);
      const webPath = toWebPath(saved.filePath);
      results.push({ url: webPath, fileName: saved.filename });
    } catch (err) {
      errors.push({
        fileName: file.name,
        message: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return NextResponse.json({ results, errors });
}
