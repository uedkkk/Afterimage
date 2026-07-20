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
        className="inline-flex items-center gap-2 text-sm text-[rgba(0,0,0,0.54)] hover:text-[rgba(0,0,0,0.84)] transition-colors mb-10 no-underline"
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
          <h1 className="font-display text-[48px] font-normal leading-[1.1] mb-2 text-balance">
            {story.title}
          </h1>
          <div className="font-sans text-sm text-[rgba(0,0,0,0.54)] mb-6">
            {formatDate(story.createdAt)}
            <span className="mx-2">·</span>
            约 {readingTime} 分钟阅读
            {story.album && (
              <>
                <span className="mx-2">·</span>
                <Link
                  href={`/album/${story.album.slug}`}
                  className="text-[rgba(0,0,0,0.54)] hover:text-[rgba(0,0,0,0.84)] transition-colors no-underline"
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

      <div className="max-w-[740px] mx-auto pt-16">
        <MarkdownContent
          content={story.content}
          className="prose max-w-none"
        />
      </div>

      <div className="max-w-[680px] mx-auto text-center mt-14 mb-14">
        <div className="w-px h-8 bg-[rgba(0,0,0,0.15)] mx-auto mb-4" />
        <div className="text-[13px] font-medium uppercase tracking-[0.06em] text-[rgba(0,0,0,0.54)]">
          Fin · 光影的残像
        </div>
      </div>

      {(story.album ? photos.length > 0 : photos.length > 1) && (
        <Reveal>
          <div className="border-t border-[rgba(0,0,0,0.1)] pt-10 mt-4">
            <div className="inline-flex items-center gap-2 text-[13px] font-medium uppercase tracking-[0.04em] text-[rgba(0,0,0,0.54)] mb-6">
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
