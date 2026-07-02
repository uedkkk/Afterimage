import { describe, it, expect, afterAll } from "vitest";
import { db } from "@/lib/db";
import {
  createAlbum,
  getAllAlbumsAdmin,
  getAlbumByIdAdmin,
  updateAlbum,
  deleteAlbum,
  setAlbumCover,
} from "@/lib/db/queries";

afterAll(async () => {
  await db.$disconnect();
});

describe("album admin queries", () => {
  it("creates, gets, updates, and deletes an album", async () => {
    const created = await createAlbum({
      title: "AdminTestAlbum",
      slug: "admin-test-album",
      description: "Test description",
    });
    expect(created.title).toBe("AdminTestAlbum");

    const all = await getAllAlbumsAdmin();
    const found = all.find((a) => a.id === created.id);
    expect(found).toBeDefined();
    expect(found?._count.photos).toBe(0);
    expect(found?.cover).toBeNull();
    expect(found?.category).toBeNull();

    const byId = await getAlbumByIdAdmin(created.id);
    expect(byId).not.toBeNull();
    expect(byId!.album.title).toBe("AdminTestAlbum");
    expect(byId!.photos).toEqual([]);

    const updated = await updateAlbum(created.id, {
      title: "UpdatedAlbum",
      published: true,
      sortOrder: 3,
    });
    expect(updated?.title).toBe("UpdatedAlbum");
    expect(updated?.published).toBe(true);
    expect(updated?.sortOrder).toBe(3);

    await deleteAlbum(created.id);
    const deleted = await db.album.findUnique({
      where: { id: created.id },
    });
    expect(deleted).toBeNull();
  });

  it("setAlbumCover sets and clears cover", async () => {
    const album = await createAlbum({
      title: "CoverTestAlbum",
      slug: "cover-test-album",
    });
    const photo = await db.photo.create({
      data: {
        filename: "cover-test.jpg",
        filePath: "/uploads/optimized/cover-test.jpg",
        width: 100,
        height: 100,
        fileSize: 1024,
        mimeType: "image/jpeg",
        albumId: album.id,
      },
    });

    await setAlbumCover(album.id, photo.id);
    const withCover = await db.album.findUnique({
      where: { id: album.id },
    });
    expect(withCover?.coverId).toBe(photo.id);

    await setAlbumCover(album.id, null);
    const noCover = await db.album.findUnique({
      where: { id: album.id },
    });
    expect(noCover?.coverId).toBeNull();

    await db.photo.delete({ where: { id: photo.id } });
    await deleteAlbum(album.id);
  });
});
