import Link from "next/link";
import { getAllStoriesAdmin } from "@/lib/db/queries";
import { EmptyState } from "@/components/admin/EmptyState";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StoriesPage() {
  const stories = await getAllStoriesAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium">故事管理</h1>
        <p className="text-dim mt-1 text-sm">共 {stories.length} 篇故事</p>
        <Link
          href="/admin/stories/new"
          className="inline-block mt-3 bg-ink text-bg px-4 py-2 rounded-md text-sm no-underline hover:bg-dim"
        >
          新建故事
        </Link>
      </div>

      {stories.length === 0 ? (
        <EmptyState
          title="暂无故事"
          description="写第一篇故事吧"
          action={
            <Link
              href="/admin/stories/new"
              className="bg-ink text-bg px-4 py-2 rounded-md text-sm no-underline"
            >
              新建故事
            </Link>
          }
        />
      ) : (
        <div className="rounded-lg border border-faint bg-paper divide-y divide-faint">
          {stories.map((story) => (
            <Link
              key={story.id}
              href={`/admin/stories/${story.id}`}
              className="flex items-start justify-between px-4 py-3 no-underline hover:bg-dust/20"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-ink">{story.title}</span>
                  {story.album && (
                    <span className="text-xs text-dim bg-faint/30 px-2 py-0.5 rounded">
                      相册: {story.album.title}
                    </span>
                  )}
                  {story.photos.length > 0 && (
                    <span className="text-xs text-dim bg-faint/30 px-2 py-0.5 rounded">
                      {story.photos.length} 张照片
                    </span>
                  )}
                  {!story.album && story.photos.length === 0 && (
                    <span className="text-xs text-dim border border-faint px-2 py-0.5 rounded">
                      无关联
                    </span>
                  )}
                  <span
                    className={
                      story.published
                        ? "text-xs text-bg bg-ink px-2 py-0.5 rounded"
                        : "text-xs text-dim border border-faint px-2 py-0.5 rounded"
                    }
                  >
                    {story.published ? "已发布" : "草稿"}
                  </span>
                </div>
                <p className="text-sm text-dim mt-1 truncate">
                  {story.excerpt}
                </p>
              </div>
              <span className="text-xs text-dim ml-4 shrink-0">
                {formatDate(story.createdAt)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
