import sharp from "sharp";
import { join, extname } from "path";
import { mkdirSync } from "fs";

export async function generateThumbnail(
  filePath: string,
  outputDir: string,
  name?: string
): Promise<string> {
  mkdirSync(outputDir, { recursive: true });
  const baseName =
    name ?? filePath.replace(extname(filePath), "").split("/").pop();
  const outputPath = join(outputDir, `${baseName}.webp`);

  await sharp(filePath)
    .resize(400, undefined, { withoutEnlargement: true })
    .webp({ quality: 75 })
    .toFile(outputPath);

  return outputPath;
}

export async function generateOptimized(
  filePath: string,
  outputDir: string,
  name?: string
): Promise<string> {
  mkdirSync(outputDir, { recursive: true });
  const baseName =
    name ?? filePath.replace(extname(filePath), "").split("/").pop();
  const outputPath = join(outputDir, `${baseName}.webp`);

  await sharp(filePath)
    .resize(1920, undefined, { withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(outputPath);

  return outputPath;
}
