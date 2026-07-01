import { db } from "./index";
import type { Photo, Album, Category, Story, Setting, PageView } from "@/lib/generated/prisma/client";

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

function serializePhoto(photo: Photo): PhotoWithTags {
  return {
    ...photo,
    tags: JSON.parse(photo.tags) as string[],
    exif: photo.exif ? (JSON.parse(photo.exif) as Record<string, unknown>) : null,
  };
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
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });
  return photos.map(serializePhoto);
}

export async function searchPhotos(query: string): Promise<PhotoWithTags[]> {
  const photos = await db.photo.findMany({
    where: {
      OR: [
        { title: { contains: query } },
        { description: { contains: query } },
        { filename: { contains: query } },
        { tags: { contains: query } },
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

  const photo = await db.photo.update({ where: { id }, data: updateData });
  return serializePhoto(photo);
}

export async function deletePhoto(id: string): Promise<void> {
  await db.photo.delete({ where: { id } });
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

export async function getPublishedAlbums(): Promise<Album[]> {
  return db.album.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    include: { category: true, cover: true },
  });
}

export async function getAlbumWithPhotos(slug: string): Promise<{
  album: Album & { category: Category | null; cover: Photo | null };
  photos: PhotoWithTags[];
} | null> {
  const album = await db.album.findUnique({
    where: { slug },
    include: { category: true, cover: true },
  });
  if (!album) return null;

  const photos = await getPhotosByAlbum(album.id);
  return { album, photos };
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

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return db.category.findUnique({ where: { slug } });
}

export async function getPhotoWithAlbum(id: string): Promise<{
  photo: PhotoWithTags;
  album: Album | null;
} | null> {
  const photo = await getPhotoById(id);
  if (!photo) return null;

  let album: Album | null = null;
  if (photo.albumId) {
    album = await db.album.findUnique({ where: { id: photo.albumId } });
  }

  return { photo, album };
}

export async function getAllCategories(): Promise<Category[]> {
  return db.category.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function createCategory(name: string, slug: string): Promise<Category> {
  return db.category.create({ data: { name, slug } });
}

export async function getPublishedStories(): Promise<
  (Story & { cover: Photo | null; album: Album | null })[]
> {
  return db.story.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    include: { cover: true, album: true },
  });
}

export async function getStoryBySlug(
  slug: string
): Promise<(Story & { cover: Photo | null; album: Album | null }) | null> {
  return db.story.findUnique({
    where: { slug },
    include: { cover: true, album: true },
  });
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
