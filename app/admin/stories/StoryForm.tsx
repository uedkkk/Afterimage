"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { MarkdownEditor } from "./MarkdownEditor";
import type { Album } from "@/lib/generated/prisma/client";
import type { PhotoWithTags, StoryWithRelations } from "@/lib/db/queries";

type AssociationMode = "none" | "photos" | "album";

interface StoryFormProps {
  story?: StoryWithRelations;
  albums: (Album & { _count: { photos: number } })[];
  photos: (PhotoWithTags & { album: Album | null; story: { id: string; title: string } | null })[];
}

export function StoryForm({ story, albums, photos }: StoryFormProps) {
  const router = useRouter();
  const isEdit = !!story;

  const [title, setTitle] = useState(story?.title ?? "");
  const [slug, setSlug] = useState(story?.slug ?? "");
  const [excerpt, setExcerpt] = useState(story?.excerpt ?? "");
  const [content, setContent] = useState(story?.content ?? "");
  const [published, setPublished] = useState(story?.published ?? false);
  const [saving, setSaving] = useState(false);

  const initialMode: AssociationMode = story?.albumId
    ? "album"
    : story && story.photos.length > 0
      ? "photos"
      : "none";

  const [mode, setMode] = useState<AssociationMode>(initialMode);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>(
    story?.photos.map((p) => p.id) ?? []
  );
  const [albumId, setAlbumId] = useState(story?.albumId ?? "");
  const [coverId, setCoverId] = useState(story?.coverId ?? "");
  const [photoAlbumFilter, setPhotoAlbumFilter] = useState("");

  const filteredPhotos = useMemo(() => {
    if (!photoAlbumFilter) return photos;
    return photos.filter((p) => p.albumId === photoAlbumFilter);
  }, [photos, photoAlbumFilter]);

  const availableCoverPhotos = useMemo(() => {
    if (mode === "photos") {
      return photos.filter((p) => selectedPhotoIds.includes(p.id));
    }
    if (mode === "album" && albumId) {
      return photos.filter((p) => p.albumId === albumId);
    }
    return [];
  }, [mode, selectedPhotoIds, albumId, photos]);

  function handleModeChange(newMode: AssociationMode) {
    setMode(newMode);
    if (newMode === "none") {
      setSelectedPhotoIds([]);
      setAlbumId("");
      setCoverId("");
    } else if (newMode === "photos") {
      setAlbumId("");
      if (coverId && !selectedPhotoIds.includes(coverId)) {
        setCoverId("");
      }
    } else if (newMode === "album") {
      setSelectedPhotoIds([]);
      if (coverId) {
        const stillAvailable = photos.some(
          (p) => p.id === coverId && p.albumId === albumId
        );
        if (!stillAvailable) setCoverId("");
      }
    }
  }

  function togglePhoto(photoId: string) {
    setSelectedPhotoIds((prev) => {
      const next = prev.includes(photoId)
        ? prev.filter((id) => id !== photoId)
        : [...prev, photoId];
      if (coverId && !next.includes(coverId)) {
        setCoverId("");
      }
      return next;
    });
  }

  function handleAlbumChange(newAlbumId: string) {
    setAlbumId(newAlbumId);
    if (coverId) {
      const stillAvailable = photos.some(
        (p) => p.id === coverId && p.albumId === newAlbumId
      );
      if (!stillAvailable) setCoverId("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...(isEdit ? { id: story!.id } : {}),
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim(),
        content,
        albumId: mode === "album" && albumId ? albumId : null,
        photoIds: mode === "photos" ? selectedPhotoIds : [],
        coverId: coverId || null,
        published,
      };
      const res = await fetch("/api/admin/stories", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        if (isEdit) {
          router.refresh();
        } else {
          router.push("/admin/stories");
        }
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    await fetch("/api/admin/stories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: story!.id }),
    });
    router.push("/admin/stories");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-4xl">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-dim mb-1">标题 *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border border-faint rounded-md px-3 py-2 text-sm bg-bg text-ink"
          />
        </div>
        <div>
          <label className="block text-sm text-dim mb-1">
            链接别名（留空自动生成）
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full border border-faint rounded-md px-3 py-2 text-sm bg-bg text-ink"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-dim mb-1">
          摘要 *<span className="text-dim/60 ml-1">（{excerpt.length}/100）</span>
        </label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value.slice(0, 100))}
          required
          rows={2}
          maxLength={100}
          className="w-full border border-faint rounded-md px-3 py-2 text-sm bg-bg text-ink"
        />
      </div>

      <div>
        <label className="block text-sm text-dim mb-1">内容 *</label>
        <MarkdownEditor value={content} onChange={setContent} />
      </div>

      <div>
        <label className="block text-sm text-dim mb-2">关联模式</label>
        <div className="flex gap-2">
          {([
            { value: "none", label: "无关联" },
            { value: "photos", label: "关联照片" },
            { value: "album", label: "关联相册" },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleModeChange(opt.value)}
              className={
                mode === opt.value
                  ? "px-3 py-1.5 rounded-md text-sm bg-ink text-bg"
                  : "px-3 py-1.5 rounded-md text-sm border border-faint text-dim hover:text-ink"
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {mode === "album" && (
        <div>
          <label className="block text-sm text-dim mb-1">关联相册</label>
          <select
            value={albumId}
            onChange={(e) => handleAlbumChange(e.target.value)}
            className="w-full border border-faint rounded-md px-3 py-2 text-sm bg-bg text-ink"
          >
            <option value="">选择相册</option>
            {albums.map((album) => (
              <option key={album.id} value={album.id}>
                {album.title}（{album._count.photos} 张照片）
              </option>
            ))}
          </select>
        </div>
      )}

      {mode === "photos" && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-dim">
              选择照片（已选 {selectedPhotoIds.length} 张）
            </label>
            <select
              value={photoAlbumFilter}
              onChange={(e) => setPhotoAlbumFilter(e.target.value)}
              className="border border-faint rounded-md px-2 py-1 text-sm bg-bg text-ink"
            >
              <option value="">全部照片</option>
              {albums.map((album) => (
                <option key={album.id} value={album.id}>
                  {album.title}
                </option>
              ))}
            </select>
          </div>
          <div className="max-h-80 overflow-y-auto border border-faint rounded-md p-2 grid grid-cols-4 sm:grid-cols-6 gap-2">
            {filteredPhotos.map((photo) => {
              const selected = selectedPhotoIds.includes(photo.id);
              return (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => togglePhoto(photo.id)}
                    className={
                      selected
                        ? "relative aspect-square overflow-hidden ring-2 ring-accent rounded"
                        : "relative aspect-square overflow-hidden rounded opacity-60 hover:opacity-100"
                    }
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.thumbPath ?? photo.filePath}
                      alt={photo.title ?? photo.filename}
                      className="w-full h-full object-cover"
                    />
                  {selected && (
                    <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-accent rounded-full flex items-center justify-center text-white text-[10px]">
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {availableCoverPhotos.length > 0 && (
        <div>
          <label className="block text-sm text-dim mb-1">
            封面照片{coverId ? "" : "（未选择）"}
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCoverId("")}
              className={
                !coverId
                  ? "relative w-20 h-20 rounded ring-2 ring-accent flex items-center justify-center text-xs text-dim bg-faint"
                  : "relative w-20 h-20 rounded border border-faint flex items-center justify-center text-xs text-dim bg-faint hover:text-ink"
              }
            >
              无
            </button>
            {availableCoverPhotos.map((photo) => {
              const selected = coverId === photo.id;
              return (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setCoverId(photo.id)}
                  title={photo.title || photo.filename}
                  className={
                    selected
                      ? "relative w-20 h-20 overflow-hidden rounded ring-2 ring-accent"
                      : "relative w-20 h-20 overflow-hidden rounded opacity-60 hover:opacity-100"
                  }
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.thumbPath ?? photo.filePath}
                    alt={photo.title ?? photo.filename}
                    className="w-full h-full object-cover"
                  />
                  {selected && (
                    <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-accent rounded-full flex items-center justify-center text-white text-[10px]">
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="w-4 h-4"
        />
        <span className="text-sm text-ink">发布</span>
      </label>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-ink text-bg px-4 py-2 rounded-md text-sm hover:bg-dim disabled:opacity-50"
        >
          {saving ? "..." : isEdit ? "保存" : "创建"}
        </button>
        {isEdit && (
          <ConfirmDialog
            trigger={
              <span className="text-sm text-accent hover:opacity-80 cursor-pointer">
                删除故事
              </span>
            }
            title="删除故事"
            description={`确定要删除「${story!.title}」吗？此操作不可撤销。`}
            confirmLabel="删除"
            variant="danger"
            onConfirm={handleDelete}
          />
        )}
      </div>
    </form>
  );
}
