import { describe, it, expect, afterAll, beforeAll } from "vitest";
import { db } from "@/lib/db";
import {
  getAllPhotosAdmin,
  getPhotoCountAdmin,
  getPhotoByIdAdmin,
  bulkAssignAlbum,
  bulkDeletePhotos,
} from "@/lib/db/queries";

afterAll(async () => {
  await db.$disconnect();
});

describe("photo admin queries", () => {
  let photoIds: string[] = [];
  let albumId: string;

  beforeAll(async () => {
    const album = await db.album.create({
      data: { title: "PhotoTestAlbum", slug: "photo-test-album" },
    });
    albumId = album.id;

    for (let i = 0; i < 3; i++) {
      const p = await db.photo.create({
        data: {
          filename: `admin-test-${i}.jpg`,
          filePath: `/uploads/optimized/admin-test-${i}.jpg`,
          width: 100,
          height: 100,
          fileSize: 1024,
          mimeType: "image/jpeg",
          tags: JSON.stringify(["test", `tag${i}`]),
        },
      });
      photoIds.push(p.id);
    }
  });

  it("getAllPhotosAdmin returns photos with album relation", async () => {
    const photos = await getAllPhotosAdmin(50, 0);
    const testPhotos = photos.filter((p) =>
      photoIds.includes(p.id)
    );
    expect(testPhotos).toHaveLength(3);
    expect(testPhotos[0]).toHaveProperty("album");
    expect(testPhotos[0].tags).toEqual(expect.arrayContaining(["test"]));
  });

  it("getPhotoCountAdmin returns total count", async () => {
    const count = await getPhotoCountAdmin();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  it("getPhotoByIdAdmin returns photo with album", async () => {
    const photo = await getPhotoByIdAdmin(photoIds[0]);
    expect(photo).not.toBeNull();
    expect(photo!.filename).toBe("admin-test-0.jpg");
    expect(photo!.album).toBeNull();
  });

  it("bulkAssignAlbum assigns album to multiple photos", async () => {
    await bulkAssignAlbum(photoIds, albumId);
    const photo = await getPhotoByIdAdmin(photoIds[0]);
    expect(photo!.album).not.toBeNull();
    expect(photo!.album!.id).toBe(albumId);
  });

  it("bulkDeletePhotos deletes multiple photos", async () => {
    await bulkDeletePhotos(photoIds);
    for (const id of photoIds) {
      const photo = await getPhotoByIdAdmin(id);
      expect(photo).toBeNull();
    }
  });

  afterAll(async () => {
    await db.album.deleteMany({ where: { id: albumId } });
  });
});
