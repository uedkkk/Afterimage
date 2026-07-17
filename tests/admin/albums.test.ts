import { describe, it, expect, afterAll } from "vitest";
import { db } from "@/lib/db";
import {
  createAlbum,
  getAllAlbumsAdmin,
  getAlbumByIdAdmin,
  updateAlbum,
  deleteAlbum,
  setAlbumCover,
  updatePhoto,
  bulkAssignAlbum,
  deletePhoto,
} from "@/lib/db/queries";

afterAll(async () => {
  await db.story.deleteMany({ where: { slug: { startsWith: "album-delete-test" } } });
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

    const photo = await db.photo.create({
      data: {
        filename: "admin-test-photo.jpg",
        filePath: "/uploads/optimized/admin-test-photo.jpg",
        width: 100,
        height: 100,
        fileSize: 1024,
        mimeType: "image/jpeg",
        albumId: created.id,
      },
    });
    await setAlbumCover(created.id, photo.id);

    const updated = await updateAlbum(created.id, {
      title: "UpdatedAlbum",
      published: true,
      sortOrder: 3,
    });
    expect(updated?.title).toBe("UpdatedAlbum");
    expect(updated?.published).toBe(true);
    expect(updated?.sortOrder).toBe(3);

    await db.photo.delete({ where: { id: photo.id } });
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

  it("refuses to delete an album associated with a story", async () => {
    const album = await createAlbum({
      title: "StoryLinkedAlbum",
      slug: "story-linked-album",
    });
    const story = await db.story.create({
      data: {
        title: "LinkedStory",
        slug: "album-delete-test-story",
        excerpt: "Test excerpt",
        content: "Test content",
        albumId: album.id,
      },
    });

    await expect(deleteAlbum(album.id)).rejects.toThrow("该相册关联了故事「LinkedStory」");

    const stillExists = await db.album.findUnique({ where: { id: album.id } });
    expect(stillExists).not.toBeNull();

    await db.story.delete({ where: { id: story.id } });
    await deleteAlbum(album.id);
  });

  it("refuses to create an album with published=true", async () => {
    await expect(
      createAlbum({ title: "PublishOnCreate", slug: "publish-on-create", published: true })
    ).rejects.toThrow("相册必须有照片和封面才能发布");
  });

  it("refuses to publish an album without photos", async () => {
    const album = await createAlbum({ title: "NoPhotoAlbum", slug: "no-photo-album" });
    await expect(updateAlbum(album.id, { published: true })).rejects.toThrow("相册没有照片，无法发布");
    const stillUnpublished = await db.album.findUnique({ where: { id: album.id } });
    expect(stillUnpublished?.published).toBe(false);
    await deleteAlbum(album.id);
  });

  it("refuses to publish an album without a cover", async () => {
    const album = await createAlbum({ title: "NoCoverAlbum", slug: "no-cover-album" });
    await db.photo.create({
      data: {
        filename: "no-cover-photo.jpg",
        filePath: "/uploads/optimized/no-cover-photo.jpg",
        width: 100,
        height: 100,
        fileSize: 1024,
        mimeType: "image/jpeg",
        albumId: album.id,
      },
    });
    await expect(updateAlbum(album.id, { published: true })).rejects.toThrow("相册没有封面，无法发布");
    const stillUnpublished = await db.album.findUnique({ where: { id: album.id } });
    expect(stillUnpublished?.published).toBe(false);
    await db.photo.deleteMany({ where: { albumId: album.id } });
    await deleteAlbum(album.id);
  });

  it("refuses to move a cover photo to another album", async () => {
    const albumA = await createAlbum({ title: "AlbumA", slug: "move-cover-album-a" });
    const albumB = await createAlbum({ title: "AlbumB", slug: "move-cover-album-b" });
    const photo = await db.photo.create({
      data: {
        filename: "move-cover.jpg",
        filePath: "/uploads/optimized/move-cover.jpg",
        width: 100,
        height: 100,
        fileSize: 1024,
        mimeType: "image/jpeg",
        albumId: albumA.id,
      },
    });
    await setAlbumCover(albumA.id, photo.id);

    await expect(updatePhoto(photo.id, { albumId: albumB.id })).rejects.toThrow(
      "该照片是相册「AlbumA」的封面，请先更换封面"
    );

    const albumAAfter = await db.album.findUnique({ where: { id: albumA.id } });
    expect(albumAAfter?.coverId).toBe(photo.id);

    await setAlbumCover(albumA.id, null);
    await db.photo.delete({ where: { id: photo.id } });
    await deleteAlbum(albumA.id);
    await deleteAlbum(albumB.id);
  });

  it("refuses to bulk-move a cover photo to another album", async () => {
    const albumA = await createAlbum({ title: "BulkAlbumA", slug: "bulk-move-cover-a" });
    const albumB = await createAlbum({ title: "BulkAlbumB", slug: "bulk-move-cover-b" });
    const photo = await db.photo.create({
      data: {
        filename: "bulk-move-cover.jpg",
        filePath: "/uploads/optimized/bulk-move-cover.jpg",
        width: 100,
        height: 100,
        fileSize: 1024,
        mimeType: "image/jpeg",
        albumId: albumA.id,
      },
    });
    await setAlbumCover(albumA.id, photo.id);

    await expect(bulkAssignAlbum([photo.id], albumB.id)).rejects.toThrow(
      "照片是相册「BulkAlbumA」的封面，请先更换封面"
    );

    const albumAAfter = await db.album.findUnique({ where: { id: albumA.id } });
    expect(albumAAfter?.coverId).toBe(photo.id);

    await setAlbumCover(albumA.id, null);
    await db.photo.delete({ where: { id: photo.id } });
    await deleteAlbum(albumA.id);
    await deleteAlbum(albumB.id);
  });

  it("refuses to delete a cover photo", async () => {
    const album = await createAlbum({ title: "CoverDeleteAlbum", slug: "cover-delete-album" });
    const photo = await db.photo.create({
      data: {
        filename: "cover-delete.jpg",
        filePath: "/uploads/optimized/cover-delete.jpg",
        width: 100,
        height: 100,
        fileSize: 1024,
        mimeType: "image/jpeg",
        albumId: album.id,
      },
    });
    await setAlbumCover(album.id, photo.id);

    await expect(deletePhoto(photo.id)).rejects.toThrow(
      "该照片是相册「CoverDeleteAlbum」的封面，请先更换封面"
    );

    const photoStillExists = await db.photo.findUnique({ where: { id: photo.id } });
    expect(photoStillExists).not.toBeNull();

    await setAlbumCover(album.id, null);
    await deletePhoto(photo.id);
    await deleteAlbum(album.id);
  });
});
