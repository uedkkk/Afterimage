"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmptyState } from "@/components/admin/EmptyState";
import type { Category } from "@/lib/generated/prisma/client";

type CategoryWithCount = Category & { _count: { albums: number } };

interface CategoryManagerProps {
  initialCategories: CategoryWithCount[];
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editSortOrder, setEditSortOrder] = useState(0);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        setNewName("");
        router.refresh();
      }
    } finally {
      setCreating(false);
    }
  }

  function startEdit(cat: CategoryWithCount) {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditSlug(cat.slug);
    setEditSortOrder(cat.sortOrder);
  }

  async function handleSaveEdit() {
    if (!editingId) return;
    const res = await fetch("/api/admin/categories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingId,
        name: editName.trim(),
        slug: editSlug.trim(),
        sortOrder: editSortOrder,
      }),
    });
    if (res.ok) {
      setEditingId(null);
      router.refresh();
    }
  }

  async function handleDelete(id: string) {
    await fetch("/api/admin/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setCategories((prev) => prev.filter((c) => c.id !== id));
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="分类名称"
          className="flex-1 border border-faint rounded-md px-3 py-2 text-sm bg-bg text-ink"
        />
        <button
          type="submit"
          disabled={creating}
          className="bg-ink text-bg px-4 py-2 rounded-md text-sm hover:bg-dim disabled:opacity-50"
        >
          {creating ? "..." : "添加"}
        </button>
      </form>

      {categories.length === 0 ? (
        <EmptyState title="暂无分类" description="添加第一个分类吧" />
      ) : (
        <div className="rounded-lg border border-faint bg-paper divide-y divide-faint">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between px-4 py-3"
            >
              {editingId === cat.id ? (
                <div className="flex items-center gap-2 flex-1 flex-wrap">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="名称"
                    className="border border-faint rounded-md px-2 py-1 text-sm bg-bg text-ink w-32"
                  />
                  <input
                    type="text"
                    value={editSlug}
                    onChange={(e) => setEditSlug(e.target.value)}
                    placeholder="slug"
                    className="border border-faint rounded-md px-2 py-1 text-sm bg-bg text-ink w-32"
                  />
                  <input
                    type="number"
                    value={editSortOrder}
                    onChange={(e) => setEditSortOrder(Number(e.target.value))}
                    placeholder="排序"
                    className="border border-faint rounded-md px-2 py-1 text-sm bg-bg text-ink w-20"
                  />
                  <button
                    onClick={handleSaveEdit}
                    className="bg-ink text-bg px-3 py-1 rounded-md text-sm"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="border border-faint text-dim px-3 py-1 rounded-md text-sm"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-ink">
                      {cat.name}
                    </span>
                    <span className="text-xs text-dim">/{cat.slug}</span>
                    <span className="text-xs text-faint bg-faint/30 px-2 py-0.5 rounded">
                      {cat._count.albums} 个相册
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(cat)}
                      className="text-sm text-dim hover:text-ink"
                    >
                      编辑
                    </button>
                    <ConfirmDialog
                      trigger={
                        <span className="text-sm text-signal hover:opacity-80 cursor-pointer">
                          删除
                        </span>
                      }
                      title="删除分类"
                      description={`确定要删除「${cat.name}」吗？`}
                      confirmLabel="删除"
                      variant="danger"
                      onConfirm={() => handleDelete(cat.id)}
                    />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
