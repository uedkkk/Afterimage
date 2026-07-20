import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getStoryWithPhotos } from "@/lib/db/queries";
import { Reveal } from "@/components/Reveal";
import { AlbumGallery } from "@/components/AlbumGallery";
import { MarkdownContent } from "@/components/MarkdownContent";
import { formatDate, estimateReadingTime } from "@/lib/utils";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function StoryPage({ params }: PageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const result = await getStoryWithPhotos(decodedSlug);

  if (!result) notFound();
  const { story, photos } = result;
  const readingTime = estimateReadingTime(story.content);

  return (
    <article className="max-w-[1200px] mx-auto px-6 md:px-12 py-12">
      <Link
        href="/stories"
        className="inline-flex items-center gap-2 text-sm text-warm-muted hover:text-ink transition-colors mb-10 no-underline"
      >
        <span aria-hidden="true">←</span>
        所有故事
      </Link>

      <Reveal>
        <header className="mb-12">
          <div className="inline-flex items-center gap-2 text-[13px] font-medium uppercase tracking-[0.04em] text-warm-muted mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-signal" />
            Story
          </div>
          <h1 className="font-display text-[clamp(36px,6vw,52px)] font-semibold tracking-[-0.02em] leading-[1.15] mb-5 text-balance">
            {story.title}
          </h1>
          <div className="flex items-center gap-3 text-sm text-warm-muted">
            <span>{formatDate(story.createdAt)}</span>
            <span className="text-hairline">·</span>
            <span>约 {readingTime} 分钟阅读</span>
            {story.album && (
              <>
                <span className="text-hairline">·</span>
                <Link
                  href={`/album/${story.album.slug}`}
                  className="text-warm-muted hover:text-signal transition-colors no-underline"
                >
                  {story.album.title} →
                </Link>
              </>
            )}
          </div>
        </header>
      </Reveal>

      {story.cover && (
        <Reveal>
          <div className="relative w-full mb-0 rounded-[4px] overflow-hidden">
            <Image
              src={story.cover.filePath}
              alt={story.title}
              width={story.cover.width}
              height={story.cover.height}
              sizes="(max-width: 768px) 100vw, 1200px"
              className="w-full h-auto"
              priority
            />
          </div>
        </Reveal>
      )}

      <div className="max-w-[680px] mx-auto pt-16">
        <MarkdownContent
          content={story.content}
          className="prose max-w-none"
        />
      </div>

      <div className="max-w-[680px] mx-auto text-center mt-14 mb-14">
        <div className="w-px h-8 bg-hairline mx-auto mb-4" />
        <div className="text-[13px] font-medium uppercase tracking-[0.06em] text-warm-muted">
          Fin · 光影的残像
        </div>
      </div>

      {(story.album ? photos.length > 0 : photos.length > 1) && (
        <Reveal>
          <div className="border-t border-hairline pt-10 mt-4">
            <div className="inline-flex items-center gap-2 text-[13px] font-medium uppercase tracking-[0.04em] text-warm-muted mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-signal" />
              {story.album ? "Album" : "Photographs"}
            </div>
            <AlbumGallery photos={photos} />
          </div>
        </Reveal>
      )}
    </article>
  );
}
