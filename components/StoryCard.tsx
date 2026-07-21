import Image from "next/image";
import Link from "next/link";
import type { StoryWithRelations } from "@/lib/db/queries";
import { formatDate, estimateReadingTime } from "@/lib/utils";

interface StoryCardProps {
  story: StoryWithRelations;
}

export function StoryCard({ story }: StoryCardProps) {
  const tag = story.album?.category?.name ?? "Story";
  const readingTime = estimateReadingTime(story.content);

  return (
    <Link
      href={`/stories/${story.slug}`}
      className="group flex flex-col gap-5 no-underline"
    >
      {story.cover && (
        <div className="relative aspect-[3/2] overflow-hidden bg-ghost">
          <Image
            src={story.cover.filePath}
            alt={story.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
          />
        </div>
      )}
      <div className="flex flex-col">
        <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-signal mb-2">
          {tag}
        </span>
        <h3 className="text-[22px] font-semibold tracking-[-0.014em] leading-[1.3] text-ink transition-opacity duration-300 group-hover:opacity-60">
          {story.title}
        </h3>
        {story.excerpt && (
          <p className="mt-2 text-[15px] leading-[1.5] text-[rgba(0,0,0,0.5)] line-clamp-2">
            {story.excerpt}
          </p>
        )}
        <div className="mt-3 flex items-center gap-1.5 text-[13px] text-[rgba(0,0,0,0.5)]">
          <time>{formatDate(story.createdAt)}</time>
          <span className="text-[rgba(0,0,0,0.4)]">—</span>
          <span>约 {readingTime} 分钟阅读</span>
        </div>
      </div>
    </Link>
  );
}
