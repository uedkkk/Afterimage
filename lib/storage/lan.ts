import { readdirSync, statSync, copyFileSync, existsSync, readFileSync, mkdirSync } from "fs";
import { join, extname, basename } from "path";
import type { SavedFile } from "./local";

export interface ScannedFile {
  path: string;
  filename: string;
  size: number;
  mimeType: string;
}

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".raw"];

function getMimeType(ext: string): string {
  const map: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".raw": "image/raw",
  };
  return map[ext.toLowerCase()] ?? "application/octet-stream";
}

export async function scanLanDirectory(dirPath: string): Promise<ScannedFile[]> {
  if (!existsSync(dirPath)) {
    return [];
  }

  const results: ScannedFile[] = [];

  function scan(dir: string) {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        scan(fullPath);
      } else {
        const ext = extname(entry).toLowerCase();
        if (IMAGE_EXTENSIONS.includes(ext)) {
          results.push({
            path: fullPath,
            filename: entry,
            size: stat.size,
            mimeType: getMimeType(ext),
          });
        }
      }
    }
  }

  scan(dirPath);
  return results;
}

export async function importLanFile(
  lanPath: string,
  destDir: string
): Promise<SavedFile> {
  if (!existsSync(lanPath)) {
    throw new Error(`File not found: ${lanPath}`);
  }

  mkdirSync(destDir, { recursive: true });
  const filename = basename(lanPath);
  const destPath = join(destDir, filename);
  copyFileSync(lanPath, destPath);

  const stat = statSync(lanPath);
  const ext = extname(lanPath).toLowerCase();

  return {
    filename,
    filePath: destPath,
    fileSize: stat.size,
    mimeType: getMimeType(ext),
  };
}

export async function readLanFile(lanPath: string): Promise<Buffer> {
  if (!existsSync(lanPath)) {
    throw new Error(`File not found: ${lanPath}`);
  }
  return readFileSync(lanPath);
}
