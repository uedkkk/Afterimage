import { db } from "./index";
import type { Photo, Album, Category, Story, Setting, PageView } from "@/lib/generated/prisma/client";
import { unlink } from "fs/promises";
import path from "path";

async function deletePhotoFiles(photo: Photo): Promise<void> {
  const paths = [photo.filePath, photo.thumbPath].filter(Boolean) as string[];
  for (const p of paths) {
    const fsPath = path.join(process.cwd(), "public", p);
    try { await unlink(fsPath); } catch {}
  }
}

export interface PhotoWithTags extends Omit<Photo, "tags" | "exif"> {
  tags: string[];
  exif: Record<string, unknown> | null;
}

export interface CreatePhotoInput {
  title?: string;
  description?: string;
  albumId?: string;
  filename: string;
  filePath: string;
  lanPath?: string;
  width: number;
  height: number;
  fileSize: number;
  mimeType: string;
  thumbPath?: string;
  exif?: Record<string, unknown> | null;
  tags?: string[];
}

function serializePhoto<T extends Photo>(photo: T): PhotoWithTags & Omit<T, keyof Photo> {
  const { tags: _tags, exif: _exif, ...rest } = photo;
  return {
    ...rest,
    tags: JSON.parse(_tags) as string[],
    exif: _exif ? (JSON.parse(_exif) as Record<string, unknown>) : null,
  } as PhotoWithTags & Omit<T, keyof Photo>;
}

export async function createPhoto(input: CreatePhotoInput): Promise<PhotoWithTags> {
  const photo = await db.photo.create({
    data: {
      title: input.title,
      description: input.description,
      albumId: input.albumId,
      filename: input.filename,
      filePath: input.filePath,
      lanPath: input.lanPath,
      width: input.width,
      height: input.height,
      fileSize: input.fileSize,
      mimeType: input.mimeType,
      thumbPath: input.thumbPath,
      exif: input.exif ? JSON.stringify(input.exif) : null,
      tags: JSON.stringify(input.tags ?? []),
    },
  });
  return serializePhoto(photo);
}

export async function getPhotoById(id: string): Promise<PhotoWithTags | null> {
  const photo = await db.photo.findUnique({ where: { id } });
  return photo ? serializePhoto(photo) : null;
}

export async function getPhotosByAlbum(albumId: string): Promise<PhotoWithTags[]> {
  const photos = await db.photo.findMany({
    where: { albumId },
    orderBy: { sortOrder: "asc" },
  });
  return photos.map(serializePhoto);
}

export async function getAllPhotos(limit = 100, offset = 0): Promise<PhotoWithTags[]> {
  const photos = await db.photo.findMany({
    where: {
      OR: [{ albumId: null }, { album: { published: true } }],
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });
  return photos.map(serializePhoto);
}

export async function getPhotoCount(): Promise<number> {
  return db.photo.count({
    where: {
      OR: [{ albumId: null }, { album: { published: true } }],
    },
  });
}

export async function searchPhotos(query: string): Promise<PhotoWithTags[]> {
  const photos = await db.photo.findMany({
    where: {
      AND: [
        {
          OR: [{ albumId: null }, { album: { published: true } }],
        },
        {
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
            { filename: { contains: query } },
            { tags: { contains: query } },
          ],
        },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return photos.map(serializePhoto);
}

export async function updatePhoto(
  id: string,
  data: Partial<CreatePhotoInput>
): Promise<PhotoWithTags | null> {
  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.albumId !== undefined) updateData.albumId = data.albumId;
  if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags);
  if (data.exif !== undefined) updateData.exif = data.exif ? JSON.stringify(data.exif) : null;
  if (data.thumbPath !== undefined) updateData.thumbPath = data.thumbPath;

  if (data.albumId !== undefined) {
    const oldPhoto = await db.photo.findUnique({ where: { id }, select: { albumId: true } });
    const oldAlbumId = oldPhoto?.albumId ?? null;
    const newAlbumId = data.albumId ?? null;

    if (oldAlbumId !== newAlbumId && oldAlbumId !== null) {
      await db.story.updateMany({
        where: { coverId: id, albumId: oldAlbumId },
        data: { coverId: null },
      });
    }
  }

  const photo = await db.photo.update({ where: { id }, data: updateData });
  return serializePhoto(photo);
}

export async function deletePhoto(id: string): Promise<void> {
  const photo = await db.photo.findUnique({ where: { id } });
  if (photo) {
    await deletePhotoFiles(photo);
  }
  await db.photo.delete({ where: { id } });
}

export async function getAllPhotosAdmin(
  limit = 50,
  offset = 0
): Promise<(PhotoWithTags & { album: Album | null; story: Story | null })[]> {
  const photos = await db.photo.findMany({
    include: { album: true, story: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });
  return photos.map(serializePhoto);
}

export async function getPhotoCountAdmin(): Promise<number> {
  return db.photo.count();
}

export async function getPhotoByIdAdmin(
  id: string
): Promise<(PhotoWithTags & { album: Album | null; story: Story | null }) | null> {
  const photo = await db.photo.findUnique({
    where: { id },
    include: { album: true, story: true },
  });
  if (!photo) return null;
  return serializePhoto(photo);
}

export async function bulkAssignAlbum(
  photoIds: string[],
  albumId: string | null
): Promise<void> {
  const photos = await db.photo.findMany({
    where: { id: { in: photoIds } },
    select: { id: true, albumId: true },
  });

  for (const photo of photos) {
    const oldAlbumId = photo.albumId ?? null;
    if (oldAlbumId !== albumId && oldAlbumId !== null) {
      await db.story.updateMany({
        where: { coverId: photo.id, albumId: oldAlbumId },
        data: { coverId: null },
      });
    }
  }

  await db.photo.updateMany({
    where: { id: { in: photoIds } },
    data: { albumId },
  });
}

export async function bulkDeletePhotos(photoIds: string[]): Promise<void> {
  const photos = await db.photo.findMany({ where: { id: { in: photoIds } } });
  for (const photo of photos) {
    await deletePhotoFiles(photo);
  }
  await db.photo.deleteMany({ where: { id: { in: photoIds } } });
}

export async function createAlbum(input: {
  title: string;
  slug: string;
  description?: string;
  categoryId?: string;
  published?: boolean;
}): Promise<Album> {
  return db.album.create({
    data: {
      title: input.title,
      slug: input.slug,
      description: input.description,
      categoryId: input.categoryId,
      published: input.published ?? false,
    },
  });
}

export async function getAlbumBySlug(slug: string): Promise<Album | null> {
  return db.album.findUnique({ where: { slug }, include: { category: true } });
}

export async function getPublishedAlbums(): Promise<(Album & { category: Category | null; cover: Photo | null })[]> {
  return db.album.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    include: { category: true, cover: true },
  });
}

export async function getAlbumWithPhotos(slug: string): Promise<{
  album: Album & { category: Category | null; cover: Photo | null };
  photos: PhotoWithTags[];
  story: Story | null;
} | null> {
  const album = await db.album.findUnique({
    where: { slug, published: true },
    include: { category: true, cover: true },
  });
  if (!album) return null;

  const photos = await getPhotosByAlbum(album.id);

  const story = await db.story.findFirst({
    where: { albumId: album.id, published: true },
  });

  return { album, photos, story };
}

export async function getAlbumsByCategory(
  categoryId: string
): Promise<(Album & { cover: Photo | null })[]> {
  return db.album.findMany({
    where: { categoryId, published: true },
    orderBy: { sortOrder: "asc" },
    include: { cover: true },
  });
}

export async function getAllAlbumsAdmin(): Promise<
  (Album & {
    cover: Photo | null;
    category: Category | null;
    _count: { photos: number };
  })[]
> {
  return db.album.findMany({
    include: { cover: true, category: true, _count: { select: { photos: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAlbumByIdAdmin(
  id: string
): Promise<{
  album: Album & { cover: Photo | null; category: Category | null };
  photos: PhotoWithTags[];
} | null> {
  const album = await db.album.findUnique({
    where: { id },
    include: { cover: true, category: true },
  });
  if (!album) return null;
  const photos = await getPhotosByAlbum(id);
  return { album, photos };
}

export async function updateAlbum(
  id: string,
  data: {
    title?: string;
    slug?: string;
    description?: string;
    categoryId?: string | null;
    published?: boolean;
    sortOrder?: number;
  }
): Promise<Album | null> {
  return db.album.update({ where: { id }, data });
}

export async function deleteAlbum(id: string): Promise<void> {
  await db.album.delete({ where: { id } });
}

export async function setAlbumCover(
  albumId: string,
  photoId: string | null
): Promise<void> {
  await db.album.update({ where: { id: albumId }, data: { coverId: photoId } });
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return db.category.findUnique({ where: { slug } });
}

export async function getPhotoWithAlbum(id: string): Promise<{
  photo: PhotoWithTags;
  album: Album | null;
  story: Story | null;
} | null> {
  const photo = await getPhotoById(id);
  if (!photo) return null;

  let album: Album | null = null;
  if (photo.albumId) {
    album = await db.album.findUnique({ where: { id: photo.albumId } });
  }

  let story: Story | null = null;
  if (photo.storyId) {
    story = await db.story.findFirst({
      where: { id: photo.storyId, published: true },
    });
  } else if (album) {
    story = await db.story.findFirst({
      where: { albumId: album.id, published: true },
    });
  }

  return { photo, album, story };
}

export async function getAllCategories(): Promise<Category[]> {
  return db.category.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function createCategory(name: string, slug: string): Promise<Category> {
  return db.category.create({ data: { name, slug } });
}

export async function getAllCategoriesAdmin(): Promise<
  (Category & { _count: { albums: number } })[]
> {
  return db.category.findMany({
    include: { _count: { select: { albums: true } } },
    orderBy: { sortOrder: "asc" },
  });
}

export async function updateCategory(
  id: string,
  data: { name?: string; slug?: string; sortOrder?: number }
): Promise<Category | null> {
  return db.category.update({ where: { id }, data });
}

export async function deleteCategory(id: string): Promise<void> {
  await db.category.delete({ where: { id } });
}

export type StoryWithRelations = Story & {
  cover: Photo | null;
  album: Album | null;
  photos: Photo[];
};

export async function getPublishedStories(): Promise<StoryWithRelations[]> {
  return db.story.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    include: { cover: true, album: true, photos: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function getStoryBySlug(
  slug: string
): Promise<StoryWithRelations | null> {
  return db.story.findUnique({
    where: { slug },
    include: { cover: true, album: true, photos: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function getAllStoriesAdmin(): Promise<StoryWithRelations[]> {
  return db.story.findMany({
    include: { cover: true, album: true, photos: { orderBy: { sortOrder: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getStoryByIdAdmin(
  id: string
): Promise<StoryWithRelations | null> {
  return db.story.findUnique({
    where: { id },
    include: { cover: true, album: true, photos: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function createStory(input: {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverId?: string | null;
  albumId?: string | null;
  photoIds?: string[];
  published?: boolean;
}): Promise<Story> {
  const { photoIds, ...storyData } = input;

  if (photoIds && photoIds.length > 0 && storyData.albumId) {
    throw new Error("不能同时关联照片和相册");
  }

  return db.$transaction(async (tx) => {
    const story = await tx.story.create({ data: storyData });

    if (photoIds && photoIds.length > 0) {
      await tx.photo.updateMany({
        where: { id: { in: photoIds } },
        data: { storyId: story.id },
      });
    }

    return story;
  });
}

export async function updateStory(
  id: string,
  data: {
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    coverId?: string | null;
    albumId?: string | null;
    photoIds?: string[];
    published?: boolean;
  }
): Promise<Story | null> {
  const { photoIds, ...storyData } = data;

  if (photoIds && photoIds.length > 0 && storyData.albumId) {
    throw new Error("不能同时关联照片和相册");
  }

  return db.$transaction(async (tx) => {
    const story = await tx.story.update({ where: { id }, data: storyData });

    if (photoIds !== undefined) {
      await tx.photo.updateMany({
        where: { storyId: id },
        data: { storyId: null },
      });

      if (photoIds.length > 0) {
        await tx.photo.updateMany({
          where: { id: { in: photoIds } },
          data: { storyId: id },
        });
      }
    }

    return story;
  });
}

export async function setStoryPhotos(
  storyId: string,
  photoIds: string[]
): Promise<void> {
  await db.$transaction(async (tx) => {
    await tx.photo.updateMany({
      where: { storyId },
      data: { storyId: null },
    });

    if (photoIds.length > 0) {
      await tx.photo.updateMany({
        where: { id: { in: photoIds } },
        data: { storyId },
      });
    }
  });
}

export async function getStoryWithPhotos(
  slug: string
): Promise<{ story: StoryWithRelations; photos: PhotoWithTags[] } | null> {
  const story = await getStoryBySlug(slug);
  if (!story) return null;

  let photos: PhotoWithTags[];
  if (story.albumId) {
    photos = await getPhotosByAlbum(story.albumId);
  } else {
    photos = story.photos.map(serializePhoto);
  }

  return { story, photos };
}

export async function deleteStory(id: string): Promise<void> {
  await db.story.delete({ where: { id } });
}

export async function createPageView(input: {
  path: string;
  albumId?: string;
  photoId?: string;
  ip?: string;
  userAgent?: string;
}): Promise<PageView> {
  return db.pageView.create({ data: input });
}

export async function getSetting(key: string): Promise<string | null> {
  const setting = await db.setting.findUnique({ where: { id: key } });
  return setting?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<Setting> {
  return db.setting.upsert({
    where: { id: key },
    update: { value },
    create: { id: key, value },
  });
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const settings = await db.setting.findMany();
  return Object.fromEntries(settings.map((s) => [s.id, s.value]));
}

export interface DashboardStats {
  totalPhotos: number;
  totalAlbums: number;
  totalStories: number;
  totalViews: number;
  publishedAlbums: number;
  recentViews: { date: string; count: number }[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [totalPhotos, totalAlbums, totalStories, publishedAlbums, totalViews, recentPageViews] =
    await Promise.all([
      db.photo.count(),
      db.album.count(),
      db.story.count(),
      db.album.count({ where: { published: true } }),
      db.pageView.count(),
      db.pageView.findMany({
        where: { createdAt: { gte: new Date(Date.now() - 30 * 86400000) } },
        select: { createdAt: true },
      }),
    ]);
  const viewMap = new Map<string, number>();
  for (const pv of recentPageViews) {
    const key = pv.createdAt.toISOString().slice(0, 10);
    viewMap.set(key, (viewMap.get(key) || 0) + 1);
  }
  const recentViews = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(Date.now() - (29 - i) * 86400000);
    const key = d.toISOString().slice(0, 10);
    return { date: key, count: viewMap.get(key) || 0 };
  });
  return { totalPhotos, totalAlbums, totalStories, totalViews, publishedAlbums, recentViews };
}

export interface PopularPhoto {
  photo: PhotoWithTags;
  views: number;
}

export async function getPopularPhotos(limit = 10): Promise<PopularPhoto[]> {
  const results = await db.pageView.groupBy({
    by: ["photoId"],
    where: { photoId: { not: null } },
    _count: { photoId: true },
    orderBy: { _count: { photoId: "desc" } },
    take: limit,
  });
  const photos = await Promise.all(
    results
      .filter((r) => r.photoId)
      .map(async (r) => {
        const photo = await getPhotoById(r.photoId!);
        return photo ? { photo, views: r._count.photoId } : null;
      })
  );
  return photos.filter((p): p is PopularPhoto => p !== null);
}

export interface AlbumViewStat {
  album: Album;
  views: number;
}

export async function getAlbumViewStats(limit = 10): Promise<AlbumViewStat[]> {
  const results = await db.pageView.groupBy({
    by: ["albumId"],
    where: { albumId: { not: null } },
    _count: { albumId: true },
    orderBy: { _count: { albumId: "desc" } },
    take: limit,
  });
  const stats = await Promise.all(
    results
      .filter((r) => r.albumId)
      .map(async (r) => {
        const album = await db.album.findUnique({ where: { id: r.albumId! } });
        return album ? { album, views: r._count.albumId } : null;
      })
  );
  return stats.filter((s): s is AlbumViewStat => s !== null);
}
