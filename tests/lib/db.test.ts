import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/lib/db";
import {
  createPhoto,
  getPhotoById,
  updatePhoto,
  deletePhoto,
  getAlbumBySlug,
  getAllCategories,
  setSetting,
  getSetting,
} from "@/lib/db/queries";

const testCategoryId = "test-cat-id";
const testAlbumId = "test-album-id";

beforeAll(async () => {
  await db.photo.deleteMany({});
  await db.album.deleteMany({});
  await db.category.deleteMany({});
  await db.setting.deleteMany({ where: { id: { startsWith: "test." } } });

  await db.category.create({
    data: { id: testCategoryId, name: "Test Travel", slug: "test-travel" },
  });

  await db.album.create({
    data: {
      id: testAlbumId,
      title: "Test Album",
      slug: "test-album",
      categoryId: testCategoryId,
      published: true,
    },
  });
});

afterAll(async () => {
  await db.photo.deleteMany({});
  await db.album.deleteMany({});
  await db.category.deleteMany({});
  await db.setting.deleteMany({ where: { id: { startsWith: "test." } } });
  await db.$disconnect();
});

describe("photo queries", () => {
  it("creates a photo with tags and exif", async () => {
    const photo = await createPhoto({
      filename: "test.jpg",
      filePath: "/uploads/test.jpg",
      width: 1920,
      height: 1080,
      fileSize: 1024000,
      mimeType: "image/jpeg",
      tags: ["travel", "japan"],
      exif: { camera: "Sony A7R2", lens: "35mm" },
    });

    expect(photo.id).toBeDefined();
    expect(photo.tags).toEqual(["travel", "japan"]);
    expect(photo.exif).toEqual({ camera: "Sony A7R2", lens: "35mm" });
  });

  it("retrieves a photo by id with parsed tags", async () => {
    const created = await createPhoto({
      filename: "test2.jpg",
      filePath: "/uploads/test2.jpg",
      width: 800,
      height: 600,
      fileSize: 500000,
      mimeType: "image/jpeg",
      tags: ["street"],
    });

    const found = await getPhotoById(created.id);
    expect(found).not.toBeNull();
    expect(found!.tags).toEqual(["street"]);
    expect(found!.exif).toBeNull();
  });

  it("updates photo tags", async () => {
    const created = await createPhoto({
      filename: "test3.jpg",
      filePath: "/uploads/test3.jpg",
      width: 800,
      height: 600,
      fileSize: 500000,
      mimeType: "image/jpeg",
      tags: ["old"],
    });

    const updated = await updatePhoto(created.id, { tags: ["new", "updated"] });
    expect(updated!.tags).toEqual(["new", "updated"]);
  });

  it("deletes a photo", async () => {
    const created = await createPhoto({
      filename: "test4.jpg",
      filePath: "/uploads/test4.jpg",
      width: 800,
      height: 600,
      fileSize: 500000,
      mimeType: "image/jpeg",
    });

    await deletePhoto(created.id);
    const found = await getPhotoById(created.id);
    expect(found).toBeNull();
  });
});

describe("album queries", () => {
  it("retrieves album by slug", async () => {
    const album = await getAlbumBySlug("test-album");
    expect(album).not.toBeNull();
    expect(album!.title).toBe("Test Album");
  });
});

describe("category queries", () => {
  it("lists all categories", async () => {
    const categories = await getAllCategories();
    expect(categories.length).toBeGreaterThan(0);
    expect(categories.some((c) => c.slug === "test-travel")).toBe(true);
  });
});

describe("setting queries", () => {
  it("sets and gets a setting", async () => {
    await setSetting("test.key", "test-value");
    const value = await getSetting("test.key");
    expect(value).toBe("test-value");
  });
});
