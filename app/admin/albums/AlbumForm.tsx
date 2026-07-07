"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import type { Album, Category } from "@/lib/generated/prisma/client";

interface AlbumFormProps {
  album?: Album;
  categories: Category[];
}

export function AlbumForm({ album, categories }: AlbumFormProps) {
  const router = useRouter();
  const isEdit = !!album;

  const [title, setTitle] = useState(album?.title ?? "");
  const [slug, setSlug] = useState(album?.slug ?? "");
  const [description, setDescription] = useState(album?.description ?? "");
  const [categoryId, setCategoryId] = useState(album?.categoryId ?? "");
  const [published, setPublished] = useState(album?.published ?? false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...(isEdit ? { id: album!.id } : {}),
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim(),
        categoryId: categoryId || null,
        published,
      };
      const res = await fetch("/api/admin/albums", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        if (isEdit) {
          router.refresh();
        } else {
          router.push("/admin/albums");
        }
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await fetch("/api/admin/albums", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: album!.id }),
      });
      router.push("/admin/albums");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div>
        <label className="block text-sm text-dim mb-1">标题 *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full border border-faint rounded-button px-3 py-2 text-sm bg-bg text-ink"
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
          className="w-full border border-faint rounded-button px-3 py-2 text-sm bg-bg text-ink"
        />
      </div>

      <div>
        <label className="block text-sm text-dim mb-1">描述</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full border border-faint rounded-button px-3 py-2 text-sm bg-bg text-ink"
        />
      </div>

      <div>
        <label className="block text-sm text-dim mb-1">分类</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full border border-faint rounded-button px-3 py-2 text-sm bg-bg text-ink"
        >
          <option value="">无分类</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
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
          className="bg-ink text-bg px-4 py-2 rounded-button text-sm hover:bg-dim disabled:opacity-50"
        >
          {saving ? "..." : isEdit ? "保存" : "创建"}
        </button>
        {isEdit && (
          <ConfirmDialog
            trigger={
              <span className="text-sm text-signal hover:opacity-80 cursor-pointer">
                {deleting ? "..." : "删除相册"}
              </span>
            }
            title="删除相册"
            description={`确定要删除「${album!.title}」吗？此操作不可撤销。`}
            confirmLabel="删除"
            variant="danger"
            onConfirm={handleDelete}
          />
        )}
      </div>
    </form>
  );
}
