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
    <article className="px-4 md:px-14 py-14 max-w-3xl mx-auto">
      <Reveal>
        <Link
          href="/stories"
          className="inline-flex items-center gap-2 text-[13px] text-dim hover:text-accent transition-colors mb-7 no-underline"
        >
          <span aria-hidden="true">←</span>
          所有故事
        </Link>
      </Reveal>

      <Reveal>
        <header className="mb-10">
          <h1 className="font-display text-[clamp(28px,4vw,48px)] font-semibold tracking-tight mb-4 text-balance">
            {story.title}
          </h1>
          <div className="flex items-center gap-4 text-[12px] text-dim">
            <span>{formatDate(story.createdAt)}</span>
            {story.album && (
              <Link
                href={`/album/${story.album.slug}`}
                className="text-accent hover:underline"
              >
                {story.album.title}
              </Link>
            )}
          </div>
        </header>
      </Reveal>

      {story.cover && (
        <Reveal>
          <div className="relative aspect-[3/2] mb-10 overflow-hidden">
            <Image
              src={story.cover.thumbPath ?? story.cover.filePath}
              alt={story.title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </div>
        </Reveal>
      )}

      <Reveal>
        <div className="font-serif text-lg leading-relaxed text-ink/90 max-w-none">
          {story.content.split("\n").map((paragraph, i) => (
            <p key={i} className="mb-4">
              {paragraph}
            </p>
          ))}
        </div>
      </Reveal>

      {(story.album ? photos.length > 0 : photos.length > 1) && (
        <Reveal>
          <div className="mt-14 pt-10 border-t border-line">
            <div className="flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-widest text-accent mb-6 before:content-[''] before:w-7 before:h-px before:bg-accent">
              {story.album ? "Album" : "Photographs"}
            </div>
            <AlbumGallery photos={photos} />
          </div>
        </Reveal>
      )}
    </article>
  );
}
