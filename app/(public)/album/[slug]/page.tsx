import { notFound } from "next/navigation";
import Link from "next/link";
import { getAlbumWithPhotos } from "@/lib/db/queries";
import { AlbumGallery } from "@/components/AlbumGallery";
import { Reveal } from "@/components/Reveal";
import { ViewTracker } from "@/components/ViewTracker";
import { formatDate } from "@/lib/utils";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AlbumPage({ params }: PageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const result = await getAlbumWithPhotos(decodedSlug);

  if (!result) notFound();

  const { album, photos, story } = result;

  return (
    <div className="max-w-[1320px] mx-auto px-6 md:px-12 py-12">
      <ViewTracker path={`/album/${decodedSlug}`} albumId={album.id} />
      <Reveal>
        <header className="pb-6 border-b border-[rgba(0,0,0,0.08)] mb-11">
          {album.category && (
            <div className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.04em] text-slate mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-light-signal" />
              {album.category.name}
            </div>
          )}
          <h1 className="text-[clamp(28px,4vw,48px)] font-medium tracking-[-0.02em] leading-[1.1] mb-3">
            {album.title}
          </h1>
          {album.description && (
            <p className="text-[17px] text-slate max-w-xl leading-relaxed">
              {album.description}
            </p>
          )}
          <div className="flex gap-6 mt-5 text-[13px] text-slate">
            <span>{photos.length} 张照片</span>
            <span>{formatDate(album.createdAt)}</span>
            {story && (
              <Link
                href={`/stories/${story.slug}`}
                className="text-ink hover:text-charcoal transition-colors no-underline"
              >
                {story.title} →
              </Link>
            )}
          </div>
        </header>
      </Reveal>

      <AlbumGallery photos={photos} />
    </div>
  );
}
