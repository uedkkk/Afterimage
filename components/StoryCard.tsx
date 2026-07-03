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
        <div className="relative aspect-[3/2] overflow-hidden bg-faint mb-4">
          <Image
            src={story.cover.thumbPath ?? story.cover.filePath}
            alt={story.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
          />
        </div>
      ) : (
        <p className="font-serif text-sm leading-relaxed text-ink/70 mb-4 line-clamp-6">
          {story.content.split("\n").filter(Boolean).slice(0, 3).join(" ")}
        </p>
      )}
      <h3 className="font-display text-xl font-semibold tracking-tight mb-1.5 group-hover:text-accent transition-colors">
        {story.title}
      </h3>
      <p className="font-serif italic text-dim text-sm leading-relaxed mb-2 line-clamp-4">
        {story.excerpt}
      </p>
      <div className="text-[12px] text-dim">{formatDate(story.createdAt)}</div>
    </Link>
  );
}
