import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../lib/generated/prisma/client";
import sharp from "sharp";
import { readdir, stat } from "fs/promises";
import path from "path";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

const OPTIMIZED_DIR = path.join(process.cwd(), "public/uploads/optimized");
const THUMBNAILS_DIR = path.join(process.cwd(), "public/uploads/thumbnails");
const ORIGINALS_DIR = path.join(process.cwd(), "public/uploads/originals");

async function main() {
  const optimizedFiles = (await readdir(OPTIMIZED_DIR))
    .filter((f) => f !== ".gitkeep")
    .sort();
  const thumbnailFiles = (await readdir(THUMBNAILS_DIR))
    .filter((f) => f !== ".gitkeep");
  const originalFiles = (await readdir(ORIGINALS_DIR))
    .filter((f) => f !== ".gitkeep")
    .sort();

  console.log(`Found ${optimizedFiles.length} optimized, ${thumbnailFiles.length} thumbnails, ${originalFiles.length} originals`);

  let recovered = 0;
  for (let i = 0; i < optimizedFiles.length; i++) {
    const filename = optimizedFiles[i];
    const optimizedPath = path.join(OPTIMIZED_DIR, filename);
    const thumbPath = path.join(THUMBNAILS_DIR, filename);

    const thumbExists = thumbnailFiles.includes(filename);

    const metadata = await sharp(optimizedPath).metadata();
    const fileStat = await stat(optimizedPath);

    const webOptimized = `/uploads/optimized/${filename}`;
    const webThumb = thumbExists ? `/uploads/thumbnails/${filename}` : null;

    const originalFilename = i < originalFiles.length ? originalFiles[i] : filename;

    await db.photo.create({
      data: {
        filename: originalFilename,
        filePath: webOptimized,
        thumbPath: webThumb,
        width: metadata.width ?? 0,
        height: metadata.height ?? 0,
        fileSize: fileStat.size,
        mimeType: "image/webp",
        tags: "[]",
        exif: null,
      },
    });
    recovered++;
    console.log(`  [${recovered}] ${originalFilename} -> ${filename} (${metadata.width}x${metadata.height})`);
  }

  console.log(`\nRecovered ${recovered} photo records.`);
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
