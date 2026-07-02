import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import path from "path";
import crypto from "crypto";
import { unlink, writeFile } from "fs/promises";
import { getSession } from "@/lib/auth/session";
import { saveUploadedFile } from "@/lib/storage";
import { scanLanDirectory, importLanFile, listDirectories } from "@/lib/storage/lan";
import {
  listWebDAVDirectories,
  scanWebDAVDirectory,
  readWebDAVFile,
  type WebDAVConfig,
} from "@/lib/storage/webdav";
import { processImage } from "@/lib/image/process";
import { createPhoto } from "@/lib/db/queries";

const ORIGINALS_DIR = path.join(process.cwd(), "public/uploads/originals");
const UPLOADS_DIR = path.join(process.cwd(), "public/uploads");

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "avif"];

function toWebPath(fsPath: string): string {
  return fsPath.replace(path.join(process.cwd(), "public"), "").replace(/\\/g, "/");
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dirPath = request.nextUrl.searchParams.get("path");
  if (!dirPath) {
    return NextResponse.json(
      { error: "缺少 path 参数" },
      { status: 400 }
    );
  }

  const mode = request.nextUrl.searchParams.get("mode");
  const source = request.nextUrl.searchParams.get("source");

  // WebDAV source
  if (source === "webdav") {
    const config: WebDAVConfig = {
      url: request.nextUrl.searchParams.get("webdavUrl") ?? "",
      username: request.nextUrl.searchParams.get("webdavUser") ?? undefined,
      password: request.nextUrl.searchParams.get("webdavPass") ?? undefined,
    };
    if (!config.url) {
      return NextResponse.json({ error: "缺少 WebDAV URL" }, { status: 400 });
    }

    try {
      if (mode === "browse") {
        const dirs = await listWebDAVDirectories(config, dirPath);
        return NextResponse.json({ dirs });
      }
      const files = await scanWebDAVDirectory(config, dirPath);
      return NextResponse.json({ files });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "WebDAV 请求失败" },
        { status: 500 }
      );
    }
  }

  // Local filesystem source
  if (mode === "browse") {
    const dirs = await listDirectories(dirPath);
    return NextResponse.json({ dirs });
  }

  const files = await scanLanDirectory(dirPath);
  return NextResponse.json({ files });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    return handleFileUpload(request);
  }

  return handleLanImport(request);
}

async function handleFileUpload(request: NextRequest) {
  const formData = await request.formData();
  const files = formData.getAll("files");
  const albumId = (formData.get("albumId") as string) || undefined;

  const results: { success: boolean; filename: string; error?: string }[] = [];

  for (const file of files) {
    if (!(file instanceof File)) continue;
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      results.push({
        success: false,
        filename: file.name,
        error: "不支持的文件类型",
      });
      continue;
    }
    try {
      const saved = await saveUploadedFile(file, ORIGINALS_DIR);
      try {
        const id = crypto.randomUUID();
        const processed = await processImage(saved.filePath, UPLOADS_DIR, id);

        const webThumbPath = toWebPath(processed.thumbPath);
        const webOptimizedPath = toWebPath(processed.optimizedPath);

        await createPhoto({
          filename: saved.filename,
          filePath: webOptimizedPath,
          width: processed.width,
          height: processed.height,
          fileSize: processed.fileSize,
          mimeType: processed.mimeType,
          thumbPath: webThumbPath,
          exif: processed.exif as Record<string, unknown> | null,
          albumId,
        });

        results.push({ success: true, filename: saved.filename });
      } catch (processingErr) {
        try { await unlink(saved.filePath); } catch {}
        throw processingErr;
      }
    } catch (err) {
      results.push({
        success: false,
        filename: file.name,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  revalidatePath("/");
  revalidatePath("/album/[slug]");
  revalidatePath("/photo/[id]");

  const successCount = results.filter((r) => r.success).length;
  const errors = results.filter((r) => !r.success);

  return NextResponse.json({
    success: errors.length === 0,
    count: successCount,
    errors,
  });
}

async function handleLanImport(request: NextRequest) {
  let body: {
    lanPath?: string;
    albumId?: string;
    mode?: "copy" | "reference";
    source?: "local" | "webdav";
    webdavUrl?: string;
    webdavUser?: string;
    webdavPass?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  const lanPath = body.lanPath?.trim();
  if (!lanPath) {
    return NextResponse.json(
      { error: "缺少 lanPath 参数" },
      { status: 400 }
    );
  }

  const mode = body.mode ?? "copy";
  const albumId = body.albumId || undefined;
  const source = body.source ?? "local";

  // WebDAV import — always copy mode (download to local)
  if (source === "webdav") {
    const config: WebDAVConfig = {
      url: body.webdavUrl ?? "",
      username: body.webdavUser,
      password: body.webdavPass,
    };
    if (!config.url) {
      return NextResponse.json(
        { error: "缺少 WebDAV URL" },
        { status: 400 }
      );
    }

    try {
      const buffer = await readWebDAVFile(config, lanPath);
      const filename = lanPath.split("/").pop() ?? "webdav-file";
      const tempPath = path.join(ORIGINALS_DIR, filename);
      await writeFile(tempPath, buffer);

      const id = crypto.randomUUID();
      const processed = await processImage(tempPath, UPLOADS_DIR, id);

      const webThumbPath = toWebPath(processed.thumbPath);
      const webOptimizedPath = toWebPath(processed.optimizedPath);

      await createPhoto({
        filename,
        filePath: webOptimizedPath,
        width: processed.width,
        height: processed.height,
        fileSize: processed.fileSize,
        mimeType: processed.mimeType,
        thumbPath: webThumbPath,
        exif: processed.exif as Record<string, unknown> | null,
        albumId,
      });

      revalidatePath("/");
      revalidatePath("/album/[slug]");
      revalidatePath("/photo/[id]");

      return NextResponse.json({ success: true, count: 1, errors: [] });
    } catch (err) {
      return NextResponse.json(
        {
          success: false,
          count: 0,
          errors: [
            {
              filename: lanPath.split("/").pop() ?? lanPath,
              error: err instanceof Error ? err.message : "Unknown error",
            },
          ],
        },
        { status: 500 }
      );
    }
  }

  // Local filesystem import
  try {
    if (mode === "copy") {
      const saved = await importLanFile(lanPath, ORIGINALS_DIR);
      const id = crypto.randomUUID();
      const processed = await processImage(saved.filePath, UPLOADS_DIR, id);

      const webThumbPath = toWebPath(processed.thumbPath);
      const webOptimizedPath = toWebPath(processed.optimizedPath);

      await createPhoto({
        filename: saved.filename,
        filePath: webOptimizedPath,
        width: processed.width,
        height: processed.height,
        fileSize: processed.fileSize,
        mimeType: processed.mimeType,
        thumbPath: webThumbPath,
        exif: processed.exif as Record<string, unknown> | null,
        albumId,
      });
    } else {
      const id = crypto.randomUUID();
      const processed = await processImage(lanPath, UPLOADS_DIR, id);

      const webThumbPath = toWebPath(processed.thumbPath);
      const webOptimizedPath = toWebPath(processed.optimizedPath);

      await createPhoto({
        filename: path.basename(lanPath),
        filePath: webOptimizedPath,
        lanPath,
        width: processed.width,
        height: processed.height,
        fileSize: processed.fileSize,
        mimeType: processed.mimeType,
        thumbPath: webThumbPath,
        exif: processed.exif as Record<string, unknown> | null,
        albumId,
      });
    }

    revalidatePath("/");
    revalidatePath("/album/[slug]");
    revalidatePath("/photo/[id]");

    return NextResponse.json({ success: true, count: 1, errors: [] });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        count: 0,
        errors: [
          {
            filename: path.basename(lanPath),
            error: err instanceof Error ? err.message : "Unknown error",
          },
        ],
      },
      { status: 500 }
    );
  }
}
