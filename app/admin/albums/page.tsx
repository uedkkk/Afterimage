import Link from "next/link";
import { getAllAlbumsAdmin } from "@/lib/db/queries";
import { EmptyState } from "@/components/admin/EmptyState";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AlbumsPage() {
  const albums = await getAllAlbumsAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">相册管理</h1>
          <p className="text-dim mt-1 text-sm">共 {albums.length} 个相册</p>
        </div>
        <Link
          href="/admin/albums/new"
          className="bg-ink text-bg px-4 py-2 rounded-md text-sm no-underline hover:bg-dim"
        >
          新建相册
        </Link>
      </div>

      {albums.length === 0 ? (
        <EmptyState
          title="暂无相册"
          description="创建第一个相册吧"
          action={
            <Link
              href="/admin/albums/new"
              className="bg-ink text-bg px-4 py-2 rounded-md text-sm no-underline"
            >
              新建相册
            </Link>
          }
        />
      ) : (
        <div className="grid gap-3">
          {albums.map((album) => (
            <Link
              key={album.id}
              href={`/admin/albums/${album.id}`}
              className="flex items-center gap-4 rounded-lg border border-faint bg-paper p-4 no-underline hover:bg-faint/30 transition-colors"
            >
              <div className="w-16 h-16 rounded-md overflow-hidden bg-faint shrink-0">
                {album.cover?.thumbPath ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={album.cover.thumbPath}
                    alt={album.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-dim text-xs">
                    无封面
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-ink truncate">
                    {album.title}
                  </span>
                  {album.category && (
                    <span className="text-xs text-dim bg-faint/30 px-2 py-0.5 rounded">
                      {album.category.name}
                    </span>
                  )}
                  <span
                    className={
                      album.published
                        ? "text-xs text-bg bg-ink px-2 py-0.5 rounded"
                        : "text-xs text-dim border border-faint px-2 py-0.5 rounded"
                    }
                  >
                    {album.published ? "已发布" : "草稿"}
                  </span>
                </div>
                <p className="text-xs text-dim mt-1">
                  {album._count.photos} 张照片 · {formatDate(album.createdAt)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
