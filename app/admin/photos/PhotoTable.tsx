"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmptyState } from "@/components/admin/EmptyState";
import { formatDate } from "@/lib/utils";
import type { PhotoWithTags } from "@/lib/db/queries";
import type { Album, Story } from "@/lib/generated/prisma/client";

type PhotoWithRelations = PhotoWithTags & { album: Album | null; story: Story | null };

interface PhotoTableProps {
  photos: PhotoWithRelations[];
  albums: (Album & { _count: { photos: number } })[];
}

export function PhotoTable({ photos, albums }: PhotoTableProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAlbum, setBulkAlbum] = useState("");

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === photos.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(photos.map((p) => p.id)));
    }
  }

  async function handleBulkAssign() {
    if (!bulkAlbum || selected.size === 0) return;
    const res = await fetch("/api/admin/photos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        photoIds: Array.from(selected),
        albumId: bulkAlbum || null,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "操作失败");
      return;
    }
    setSelected(new Set());
    setBulkAlbum("");
    router.refresh();
  }

  async function handleBulkDelete() {
    const res = await fetch("/api/admin/photos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoIds: Array.from(selected) }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "操作失败");
    }
    setSelected(new Set());
    router.refresh();
  }

  if (photos.length === 0) {
    return <EmptyState title="暂无照片" description="上传第一张照片吧" />;
  }

  return (
    <div className="space-y-3">
      {selected.size > 0 && (
        <div className="flex items-center gap-3 bg-paper border border-faint rounded-lg px-4 py-3">
          <span className="text-sm text-dim">已选 {selected.size} 张</span>
          <select
            value={bulkAlbum}
            onChange={(e) => setBulkAlbum(e.target.value)}
            className="border border-faint rounded-md px-2 py-1 text-sm bg-bg text-ink"
          >
            <option value="">选择相册...</option>
            {albums.map((album) => (
              <option key={album.id} value={album.id}>
                {album.title}
              </option>
            ))}
          </select>
          <button
            onClick={handleBulkAssign}
            disabled={!bulkAlbum}
            className="bg-ink text-bg px-3 py-1 rounded-md text-sm disabled:opacity-50"
          >
            分配相册
          </button>
          <ConfirmDialog
            trigger={
              <span className="text-sm text-signal hover:opacity-80 cursor-pointer">
                删除
              </span>
            }
            title="批量删除照片"
            description={`确定要删除选中的 ${selected.size} 张照片吗？此操作不可撤销。`}
            confirmLabel="删除"
            variant="danger"
            onConfirm={handleBulkDelete}
          />
        </div>
      )}

      <div className="rounded-lg border border-faint bg-paper overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-faint">
              <th className="px-3 py-2 text-left w-10">
                <input
                  type="checkbox"
                  checked={selected.size === photos.length && photos.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4"
                />
              </th>
              <th className="px-3 py-2 text-left text-sm text-dim">预览</th>
              <th className="px-3 py-2 text-left text-sm text-dim">标题/文件名</th>
              <th className="px-3 py-2 text-left text-sm text-dim">相册</th>
              <th className="px-3 py-2 text-left text-sm text-dim">故事</th>
              <th className="px-3 py-2 text-left text-sm text-dim">日期</th>
              <th className="px-3 py-2 text-left text-sm text-dim">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-faint">
            {photos.map((photo) => (
              <tr key={photo.id} className="hover:bg-dust/20">
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selected.has(photo.id)}
                    onChange={() => toggleSelect(photo.id)}
                    className="w-4 h-4"
                  />
                </td>
                <td className="px-3 py-2">
                  <div className="w-12 h-12 rounded-md overflow-hidden bg-faint">
                    {photo.thumbPath && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photo.thumbPath}
                        alt={photo.title || photo.filename}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </td>
                <td className="px-3 py-2">
                  <span className="text-sm text-ink">
                    {photo.title || photo.filename}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <span className="text-sm text-dim">
                    {photo.album?.title ?? "—"}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <span className="text-sm text-dim">
                    {photo.story?.title ?? "—"}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <span className="text-xs text-dim">
                    {formatDate(photo.createdAt)}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <Link
                    href={`/admin/photos/${photo.id}`}
                    className="text-sm text-dim hover:text-ink"
                  >
                    编辑
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
