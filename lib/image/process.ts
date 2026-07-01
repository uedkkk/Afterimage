import sharp from "sharp";
import { statSync } from "fs";
import { join } from "path";
import { mkdirSync } from "fs";
import { extractExif, type ExifData } from "./exif";
import { generateThumbnail, generateOptimized } from "./thumbnail";

export interface ProcessedImage {
  width: number;
  height: number;
  fileSize: number;
  mimeType: string;
  thumbPath: string;
  optimizedPath: string;
  exif: ExifData | null;
}

export async function processImage(
  filePath: string,
  outputDir: string,
  id: string
): Promise<ProcessedImage> {
  const thumbDir = join(outputDir, "thumbnails");
  const optimizedDir = join(outputDir, "optimized");

  mkdirSync(thumbDir, { recursive: true });
  mkdirSync(optimizedDir, { recursive: true });

  const metadata = await sharp(filePath).metadata();
  const stats = statSync(filePath);

  const thumbPath = await generateThumbnail(filePath, thumbDir, id);
  const optimizedPath = await generateOptimized(filePath, optimizedDir, id);
  const exif = await extractExif(filePath);

  const mimeType =
    metadata.format === "jpeg"
      ? "image/jpeg"
      : metadata.format === "png"
        ? "image/png"
        : metadata.format === "webp"
          ? "image/webp"
          : "image/jpeg";

  return {
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
    fileSize: stats.size,
    mimeType,
    thumbPath,
    optimizedPath,
    exif,
  };
}
