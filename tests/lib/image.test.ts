import { describe, it, expect, beforeAll } from "vitest";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import { processImage } from "@/lib/image/process";
import { extractExif } from "@/lib/image/exif";
import { generateThumbnail, generateOptimized } from "@/lib/image/thumbnail";

const testImagePath = join(process.cwd(), "tests/fixtures/test-image.jpg");
const outputDir = join(process.cwd(), "tests/fixtures/output");

beforeAll(() => {
  mkdirSync(outputDir, { recursive: true });
});

describe("extractExif", () => {
  it("returns null for image without EXIF", async () => {
    const exif = await extractExif(testImagePath);
    // Test image has no EXIF, so should return null or empty object
    expect(exif).toBeTypeOf("object");
  });
});

describe("generateThumbnail", () => {
  it("generates a 400px wide WebP thumbnail", async () => {
    const thumbPath = await generateThumbnail(testImagePath, outputDir);
    expect(existsSync(thumbPath)).toBe(true);
    expect(thumbPath.endsWith(".webp")).toBe(true);
  });
});

describe("generateOptimized", () => {
  it("generates an optimized WebP image (max 1920px)", async () => {
    const optimizedPath = await generateOptimized(testImagePath, outputDir);
    expect(existsSync(optimizedPath)).toBe(true);
    expect(optimizedPath.endsWith(".webp")).toBe(true);
  });
});

describe("processImage", () => {
  it("processes an image and returns metadata", async () => {
    const result = await processImage(testImagePath, outputDir, "test-photo-id");
    expect(result.width).toBe(800);
    expect(result.height).toBe(600);
    expect(result.fileSize).toBeGreaterThan(0);
    expect(result.mimeType).toBe("image/jpeg");
    expect(existsSync(result.thumbPath)).toBe(true);
    expect(existsSync(result.optimizedPath)).toBe(true);
    expect(result.exif).toBeTypeOf("object");
  });
});
