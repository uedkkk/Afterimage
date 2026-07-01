import { notFound } from "next/navigation";
import { getAlbumWithPhotos } from "@/lib/db/queries";
import { AlbumGallery } from "@/components/AlbumGallery";
import { Reveal } from "@/components/Reveal";
import { formatDate } from "@/lib/utils";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AlbumPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getAlbumWithPhotos(slug);

  if (!result) notFound();

  const { album, photos } = result;

  return (
    <div className="px-14 py-14">
      <Reveal>
        <header className="mb-10 pb-7 border-b border-line">
          {album.category && (
            <div className="flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-widest text-accent mb-3 before:content-[''] before:w-7 before:h-px before:bg-accent">
              {album.category.name}
            </div>
          )}
          <h1 className="font-display text-[clamp(28px,4vw,48px)] font-semibold tracking-tight mb-3">
            {album.title}
          </h1>
          {album.description && (
            <p className="font-serif text-lg italic text-dim max-w-xl leading-relaxed">
              {album.description}
            </p>
          )}
          <div className="flex gap-6 mt-5 text-[12px] text-dim">
            <span>{photos.length} 张照片</span>
            <span>{formatDate(album.createdAt)}</span>
          </div>
        </header>
      </Reveal>

      <AlbumGallery photos={photos} />
    </div>
  );
}
