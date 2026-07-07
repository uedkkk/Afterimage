"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/admin/EmptyState";
import type { PhotoWithTags } from "@/lib/db/queries";

interface AlbumPhotosManagerProps {
  albumId: string;
  photos: PhotoWithTags[];
}

export function AlbumPhotosManager({
  albumId,
  photos,
}: AlbumPhotosManagerProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function setCover(photoId: string) {
    setError(null);
    const res = await fetch("/api/admin/albums/cover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ albumId, photoId }),
    });
    if (!res.ok) {
      setError("操作失败");
      return;
    }
    router.refresh();
  }

  async function removeFromAlbum(photoId: string) {
    setError(null);
    const res = await fetch("/api/admin/photos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: photoId, albumId: null }),
    });
    if (!res.ok) {
      setError("操作失败");
      return;
    }
    router.refresh();
  }

  if (photos.length === 0) {
    return <EmptyState title="暂无照片" description="上传照片后可在此管理" />;
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-signal">{error}</p>
      )}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="relative group aspect-square rounded-button overflow-hidden bg-faint"
        >
          {photo.thumbPath && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo.thumbPath}
              alt={photo.title || photo.filename}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-ink/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
            <button
              onClick={() => setCover(photo.id)}
              className="text-xs text-bg bg-ink/80 px-2 py-1 rounded hover:bg-ink"
            >
              设为封面
            </button>
            <button
              onClick={() => removeFromAlbum(photo.id)}
              className="text-xs text-bg bg-signal/80 px-2 py-1 rounded hover:bg-signal"
            >
              移除
            </button>
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}
