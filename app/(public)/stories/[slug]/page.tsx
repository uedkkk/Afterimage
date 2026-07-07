import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getStoryWithPhotos } from "@/lib/db/queries";
import { Reveal } from "@/components/Reveal";
import { AlbumGallery } from "@/components/AlbumGallery";
import { formatDate } from "@/lib/utils";

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

  return (
    <article className="px-6 md:px-12 py-12 max-w-3xl mx-auto">
      <Reveal>
        <Link
          href="/stories"
          className="inline-flex items-center gap-2 text-[13px] font-450 text-slate hover:text-ink transition-colors mb-7 no-underline"
        >
          <span aria-hidden="true">←</span>
          所有故事
        </Link>
      </Reveal>

      <Reveal>
        <header className="mb-10">
          <h1 className="text-[clamp(28px,4vw,48px)] font-medium tracking-[-0.02em] mb-4 text-balance">
            {story.title}
          </h1>
          <div className="flex items-center gap-4 text-[13px] font-450 text-slate">
            <span>{formatDate(story.createdAt)}</span>
            {story.album && (
              <Link
                href={`/album/${story.album.slug}`}
                className="text-ink hover:text-charcoal transition-colors no-underline"
              >
                {story.album.title} →
              </Link>
            )}
          </div>
        </header>
      </Reveal>

      {story.cover && (
        <Reveal>
          <div className="relative w-full mb-10 rounded-stadium overflow-hidden shadow-card">
            <Image
              src={story.cover.thumbPath ?? story.cover.filePath}
              alt={story.title}
              width={story.cover.width}
              height={story.cover.height}
              sizes="(max-width: 768px) 100vw, 768px"
              className="w-full h-auto"
              priority
            />
          </div>
        </Reveal>
      )}

      <Reveal>
        <div className="text-[17px] leading-relaxed text-ink/90 max-w-none">
          {story.content.split("\n").map((paragraph, i) => (
            <p key={i} className="mb-4">
              {paragraph}
            </p>
          ))}
        </div>
      </Reveal>

      {(story.album ? photos.length > 0 : photos.length > 1) && (
        <Reveal>
          <div className="mt-14 pt-10 border-t border-ink">
            <div className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.04em] text-slate mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-light-signal" />
              {story.album ? "Album" : "Photographs"}
            </div>
            <AlbumGallery photos={photos} />
          </div>
        </Reveal>
      )}
    </article>
  );
}
