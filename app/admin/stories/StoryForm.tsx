"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { MarkdownEditor } from "./MarkdownEditor";
import type { Story, Album } from "@/lib/generated/prisma/client";
import type { PhotoWithTags } from "@/lib/db/queries";

interface StoryFormProps {
  story?: Story;
  albums: (Album & { _count: { photos: number } })[];
  photos: (PhotoWithTags & { album: Album | null })[];
}

export function StoryForm({ story, albums, photos }: StoryFormProps) {
  const router = useRouter();
  const isEdit = !!story;

  const [title, setTitle] = useState(story?.title ?? "");
  const [slug, setSlug] = useState(story?.slug ?? "");
  const [excerpt, setExcerpt] = useState(story?.excerpt ?? "");
  const [content, setContent] = useState(story?.content ?? "");
  const [albumId, setAlbumId] = useState(story?.albumId ?? "");
  const [coverId, setCoverId] = useState(story?.coverId ?? "");
  const [published, setPublished] = useState(story?.published ?? false);
  const [saving, setSaving] = useState(false);

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
        albumId: albumId || null,
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
            Slug（留空自动生成）
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
        <label className="block text-sm text-dim mb-1">摘要 *</label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          required
          rows={2}
          className="w-full border border-faint rounded-md px-3 py-2 text-sm bg-bg text-ink"
        />
      </div>

      <div>
        <label className="block text-sm text-dim mb-1">内容 *</label>
        <MarkdownEditor value={content} onChange={setContent} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-dim mb-1">关联相册</label>
          <select
            value={albumId}
            onChange={(e) => setAlbumId(e.target.value)}
            className="w-full border border-faint rounded-md px-3 py-2 text-sm bg-bg text-ink"
          >
            <option value="">无</option>
            {albums.map((album) => (
              <option key={album.id} value={album.id}>
                {album.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-dim mb-1">封面照片</label>
          <select
            value={coverId}
            onChange={(e) => setCoverId(e.target.value)}
            className="w-full border border-faint rounded-md px-3 py-2 text-sm bg-bg text-ink"
          >
            <option value="">无封面</option>
            {photos.map((photo) => (
              <option key={photo.id} value={photo.id}>
                {photo.title || photo.filename}
              </option>
            ))}
          </select>
        </div>
      </div>

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
