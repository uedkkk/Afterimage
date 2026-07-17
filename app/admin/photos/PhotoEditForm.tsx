"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import type { PhotoWithTags } from "@/lib/db/queries";
import type { Album, Story } from "@/lib/generated/prisma/client";

type PhotoWithRelations = PhotoWithTags & { album: Album | null; story: Story | null };

interface PhotoEditFormProps {
  photo: PhotoWithRelations;
  albums: (Album & { _count: { photos: number } })[];
}

export function PhotoEditForm({ photo, albums }: PhotoEditFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(photo.title ?? "");
  const [description, setDescription] = useState(photo.description ?? "");
  const [albumId, setAlbumId] = useState(photo.albumId ?? "");
  const [tags, setTags] = useState(photo.tags.join(", "));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function showSuccess(msg: string) {
    setSuccess(msg);
    setError(null);
    setTimeout(() => setSuccess(null), 3000);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/photos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: photo.id,
          title: title.trim() || null,
          description: description.trim() || null,
          albumId: albumId || null,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "操作失败");
        return;
      }
      showSuccess("已保存");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const res = await fetch("/api/admin/photos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: photo.id }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "操作失败");
    }
    router.push("/admin/photos");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="text-sm text-signal">{error}</p>
      )}
      {success && (
        <p className="text-sm text-green-600">{success}</p>
      )}
      <div>
        <label className="block text-sm text-dim mb-1">标题</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-faint rounded-md px-3 py-2 text-sm bg-bg text-ink"
        />
      </div>

      <div>
        <label className="block text-sm text-dim mb-1">描述</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full border border-faint rounded-md px-3 py-2 text-sm bg-bg text-ink"
        />
      </div>

      <div>
        <label className="block text-sm text-dim mb-1">相册</label>
        <select
          value={albumId}
          onChange={(e) => setAlbumId(e.target.value)}
          className="w-full border border-faint rounded-md px-3 py-2 text-sm bg-bg text-ink"
        >
          <option value="">无相册</option>
          {albums.map((album) => (
            <option key={album.id} value={album.id}>
              {album.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-dim mb-1">故事</label>
        <div className="w-full border border-faint rounded-md px-3 py-2 text-sm bg-bg text-dim">
          {photo.story ? photo.story.title : "—（请在故事编辑中关联）"}
        </div>
      </div>

      <div>
        <label className="block text-sm text-dim mb-1">
          标签（逗号分隔）
        </label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full border border-faint rounded-md px-3 py-2 text-sm bg-bg text-ink"
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-ink text-bg px-4 py-2 rounded-md text-sm hover:bg-dim disabled:opacity-50"
        >
          {saving ? "..." : "保存"}
        </button>
        <ConfirmDialog
          trigger={
            <span className="text-sm text-signal hover:opacity-80 cursor-pointer">
              删除照片
            </span>
          }
          title="删除照片"
          description="确定要删除这张照片吗？此操作不可撤销。"
          confirmLabel="删除"
          variant="danger"
          onConfirm={handleDelete}
        />
      </div>
    </form>
  );
}
