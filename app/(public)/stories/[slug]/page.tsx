import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import "@/lib/kg-content.css";
import { getStoryWithPhotos, getRelatedStories } from "@/lib/db/queries";
import { Reveal } from "@/components/Reveal";
import { AlbumGallery } from "@/components/AlbumGallery";
import { StoryCard } from "@/components/StoryCard";
import { MarkdownContent } from "@/components/MarkdownContent";
import { KgToggleScript } from "@/components/KgToggleScript";
import { isLexicalContent } from "@/lib/editor-utils";
import { renderLexicalToHtml } from "@/lib/lexical-render";
import { renderMarkdown } from "@/lib/markdown";
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
  const tag = story.album?.category?.name ?? "Story";

  const related = await getRelatedStories(story.slug, 3);

  return (
    <article className="max-w-[1120px] mx-auto px-6 md:px-12 py-12">
      {/* Header — narrow, centered */}
      <Reveal>
        <header className="max-w-[720px] mx-auto">
          <Link
            href={story.album?.category ? `/category/${story.album.category.slug}` : "/stories"}
            className="inline-block text-[13px] font-semibold uppercase tracking-[0.01em] text-signal mb-4 no-underline transition-opacity hover:opacity-70"
          >
            {tag}
          </Link>
          <h1 className="font-display text-[clamp(36px,4.5vw,52px)] font-normal leading-[1.1] tracking-[-0.022em] text-balance">
            {story.title}
          </h1>
          {story.excerpt && (
            <p className="font-serif italic text-[clamp(18px,2vw,24px)] leading-[1.4] text-[rgba(0,0,0,0.6)] mt-4 max-w-[680px]">
              {story.excerpt}
            </p>
          )}
          <div className="flex items-center gap-2 mt-6 text-[14px] text-[rgba(0,0,0,0.5)]">
            <time>{formatDate(story.createdAt)}</time>
            <span className="text-[rgba(0,0,0,0.4)]">—</span>
            <span>约 {readingTime} 分钟阅读</span>
            {story.album && (
              <>
                <span className="text-[rgba(0,0,0,0.4)]">·</span>
                <Link
                  href={`/album/${story.album.slug}`}
                  className="text-signal no-underline transition-opacity hover:opacity-70"
                >
                  {story.album.title} →
                </Link>
              </>
            )}
          </div>
        </header>
      </Reveal>

      {/* Wide cover image — breaks beyond text column */}
      {story.cover && (
        <Reveal>
          <figure className="max-w-[1000px] mx-auto mt-12 overflow-hidden">
            <div className="relative aspect-[16/9] overflow-hidden">
              <Image
                src={story.cover.filePath}
                alt={story.title}
                fill
                sizes="(max-width: 768px) 100vw, 1000px"
                className="object-cover"
                priority
              />
            </div>
          </figure>
        </Reveal>
      )}

      {/* Content — kg-content-wide grid for wide/full width support */}
      <div className="mt-16">
        {isLexicalContent(story.content) ? (
          <>
            <div
              className="kg-content-wide"
              dangerouslySetInnerHTML={{
                __html: await renderLexicalToHtml(story.content),
              }}
            />
            <KgToggleScript />
          </>
        ) : (
          <div className="max-w-[720px] mx-auto">
            <MarkdownContent
              content={story.content}
              className="prose max-w-none"
            />
          </div>
        )}
      </div>

      {/* Article footer ornament */}
      <div className="max-w-[720px] mx-auto text-center mt-14 mb-14">
        <div className="w-px h-8 bg-[rgba(0,0,0,0.15)] mx-auto mb-4" />
        <div className="text-[13px] font-medium uppercase tracking-[0.06em] text-[rgba(0,0,0,0.5)]">
          Fin · 光影的残像
        </div>
      </div>

      {/* Photo gallery (if story has photos) */}
      {(story.album ? photos.length > 0 : photos.length > 1) && (
        <Reveal>
          <div className="border-t border-[rgba(0,0,0,0.08)] pt-11 mt-4">
            <div className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.04em] text-[rgba(0,0,0,0.5)] mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-signal" />
              {story.album ? "Album" : "Photographs"}
            </div>
            <AlbumGallery photos={photos} />
          </div>
        </Reveal>
      )}

      {/* Read more — related stories */}
      {related.length > 0 && (
        <section className="border-t border-[rgba(0,0,0,0.08)] mt-20 pt-11">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.04em] text-slate mb-8 pb-3 border-b border-[rgba(0,0,0,0.08)]">
            Read more
          </h2>
          <div className="story-grid">
            {related.map((s, i) => (
              <Reveal key={s.id} delay={i * 50}>
                <StoryCard story={s} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
