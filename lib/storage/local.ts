import { mkdirSync, writeFileSync } from "fs";
import { join, extname } from "path";
import { createHash } from "crypto";

export interface SavedFile {
  filename: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
}

export async function saveUploadedFile(
  file: File,
  destDir: string
): Promise<SavedFile> {
  mkdirSync(destDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = extname(file.name) || `.${file.type.split("/")[1] ?? "jpg"}`;
  const hash = createHash("sha256").update(buffer).digest("hex").slice(0, 16);
  const filename = `${hash}${ext}`;
  const filePath = join(destDir, filename);

  writeFileSync(filePath, buffer);

  return {
    filename: file.name,
    filePath,
    fileSize: buffer.length,
    mimeType: file.type || "image/jpeg",
  };
}
