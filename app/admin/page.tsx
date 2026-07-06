import Link from "next/link";
import { StatCard } from "@/components/admin/StatCard";
import { EmptyState } from "@/components/admin/EmptyState";
import { getDashboardStats, getPopularPhotos, getAlbumViewStats } from "@/lib/db/queries";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [stats, popularPhotos, albumStats] = await Promise.all([
    getDashboardStats(),
    getPopularPhotos(5),
    getAlbumViewStats(5),
  ]);

  const maxViews = Math.max(...stats.recentViews.map((v) => v.count), 1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">仪表盘</h1>
        <p className="text-dim mt-1 text-sm">站点数据概览</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="照片总数" value={stats.totalPhotos} />
        <StatCard label="相册总数" value={stats.totalAlbums} hint={`已发布 ${stats.publishedAlbums}`} />
        <StatCard label="故事总数" value={stats.totalStories} />
        <StatCard label="总浏览量" value={stats.totalViews} />
      </div>

      <div className="rounded-lg border border-faint bg-paper p-5">
        <h2 className="text-sm font-semibold text-ink mb-4">近 30 天浏览量</h2>
        <div className="flex items-end gap-1 h-40">
          {stats.recentViews.map((v) => (
            <div
              key={v.date}
              className="flex-1 flex flex-col items-center justify-end h-full group relative"
            >
              {v.count > 0 && (
                <span className="text-[10px] text-dim mb-0.5 tabular-nums">{v.count}</span>
              )}
              <div
                className="w-full rounded-t bg-ink/20 group-hover:bg-ink/40 transition-colors"
                style={{ height: `${(v.count / maxViews) * 100}%`, minHeight: v.count > 0 ? "4px" : "0" }}
                title={`${v.date}: ${v.count} 次浏览`}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-dim">
          <span>{formatDate(stats.recentViews[0]?.date ?? new Date())}</span>
          <span>今天</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-faint bg-paper p-5">
          <h2 className="text-sm font-semibold text-ink mb-4">热门照片</h2>
          {popularPhotos.length === 0 ? (
            <EmptyState title="暂无浏览数据" description="还没有照片被浏览" />
          ) : (
            <ol className="space-y-2">
              {popularPhotos.map((item, i) => (
                <li key={item.photo.id}>
                  <Link
                    href={`/admin/photos/${item.photo.id}`}
                    className="flex items-center justify-between px-2 py-2 rounded-md hover:bg-faint no-underline"
                  >
                    <span className="text-sm text-ink truncate">
                      <span className="text-dim mr-2">{i + 1}.</span>
                      {item.photo.title || item.photo.filename}
                    </span>
                    <span className="text-xs text-dim ml-2 shrink-0">{item.views} 次浏览</span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="rounded-lg border border-faint bg-paper p-5">
          <h2 className="text-sm font-semibold text-ink mb-4">相册浏览统计</h2>
          {albumStats.length === 0 ? (
            <EmptyState title="暂无浏览数据" description="还没有相册被浏览" />
          ) : (
            <ol className="space-y-2">
              {albumStats.map((item, i) => (
                <li key={item.album.id}>
                  <Link
                    href={`/admin/albums/${item.album.id}`}
                    className="flex items-center justify-between px-2 py-2 rounded-md hover:bg-faint no-underline"
                  >
                    <span className="text-sm text-ink truncate">
                      <span className="text-dim mr-2">{i + 1}.</span>
                      {item.album.title}
                    </span>
                    <span className="text-xs text-dim ml-2 shrink-0">{item.views} 次浏览</span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
