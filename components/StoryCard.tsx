import Image from "next/image";
import Link from "next/link";
import type { StoryWithRelations } from "@/lib/db/queries";
import { formatDate } from "@/lib/utils";

interface StoryCardProps {
  story: StoryWithRelations;
}

export function StoryCard({ story }: StoryCardProps) {
  return (
    <Link
      href={`/stories/${story.slug}`}
      className="group block no-underline"
    >
      {story.cover ? (
        <div className="relative aspect-[3/4] overflow-hidden bg-dust mb-5 rounded-stadium shadow-card transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1.5 group-hover:shadow-drama">
          <Image
            src={story.cover.thumbPath ?? story.cover.filePath}
            alt={story.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
          />
          <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/80 to-transparent">
            <span className="self-start bg-white text-ink rounded-pill px-3 py-1 text-[11px] font-medium mb-3">
              Story
            </span>
            <h3 className="text-white text-[22px] font-medium tracking-[-0.01em] leading-[1.2] mb-1.5">
              {story.title}
            </h3>
            <p className="text-white/70 text-[14px] font-450 leading-[1.5] line-clamp-2">
              {story.excerpt}
            </p>
          </div>
        </div>
      ) : (
        <div className="relative aspect-[3/4] overflow-hidden bg-lifted mb-5 rounded-stadium shadow-card p-6 flex flex-col justify-between transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1.5 group-hover:shadow-drama">
          <span className="self-start bg-ink text-canvas rounded-pill px-3 py-1 text-[11px] font-medium">
            Story
          </span>
          <div>
            <h3 className="text-ink text-[22px] font-medium tracking-[-0.01em] leading-[1.2] mb-1.5">
              {story.title}
            </h3>
            <p className="text-slate text-[14px] font-450 leading-[1.5] line-clamp-4">
              {story.excerpt}
            </p>
          </div>
        </div>
      )}
      <div className="text-[13px] font-450 text-slate px-1">{formatDate(story.createdAt)}</div>
    </Link>
  );
}
