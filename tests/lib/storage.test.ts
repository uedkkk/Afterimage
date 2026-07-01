import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { saveUploadedFile } from "@/lib/storage/local";
import { scanLanDirectory, importLanFile } from "@/lib/storage/lan";

const testDir = join(process.cwd(), "tests/fixtures/storage");
const outputDir = join(process.cwd(), "tests/fixtures/storage-output");

beforeAll(() => {
  mkdirSync(testDir, { recursive: true });
  mkdirSync(outputDir, { recursive: true });
  // Create a fake "LAN" file
  writeFileSync(join(testDir, "photo1.jpg"), Buffer.alloc(1024, 0xff));
  writeFileSync(join(testDir, "photo2.png"), Buffer.alloc(512, 0x00));
  writeFileSync(join(testDir, "readme.txt"), "not an image");
});

afterAll(() => {
  rmSync(testDir, { recursive: true, force: true });
  rmSync(outputDir, { recursive: true, force: true });
});

describe("saveUploadedFile", () => {
  it("saves a file to the destination directory", async () => {
    const file = new File([Buffer.alloc(1024, 0xab)], "upload.jpg", {
      type: "image/jpeg",
    });

    const result = await saveUploadedFile(file, outputDir);
    expect(result.filename).toBe("upload.jpg");
    expect(existsSync(result.filePath)).toBe(true);
    expect(result.fileSize).toBe(1024);
    expect(result.mimeType).toBe("image/jpeg");
  });
});

describe("scanLanDirectory", () => {
  it("scans a directory and returns only image files", async () => {
    const files = await scanLanDirectory(testDir);
    expect(files.length).toBe(2);
    expect(files.some((f) => f.filename === "photo1.jpg")).toBe(true);
    expect(files.some((f) => f.filename === "photo2.png")).toBe(true);
    expect(files.some((f) => f.filename === "readme.txt")).toBe(false);
  });

  it("returns empty array for non-existent directory", async () => {
    const files = await scanLanDirectory("/nonexistent/path/12345");
    expect(files).toEqual([]);
  });
});

describe("importLanFile", () => {
  it("copies a file from LAN path to destination", async () => {
    const lanPath = join(testDir, "photo1.jpg");
    const result = await importLanFile(lanPath, outputDir);
    expect(existsSync(result.filePath)).toBe(true);
    expect(result.fileSize).toBe(1024);
  });
});
