import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPhotoWithAlbum } from "@/lib/db/queries";
import { ExifPanel } from "@/components/ExifPanel";
import { Reveal } from "@/components/Reveal";
import { ViewTracker } from "@/components/ViewTracker";
import { formatDate } from "@/lib/utils";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PhotoPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getPhotoWithAlbum(id);

  if (!result) notFound();

  const { photo, album, story } = result;

  return (
    <div className="px-6 md:px-12 py-12 max-w-5xl mx-auto">
      <ViewTracker path={`/photo/${id}`} photoId={photo.id} albumId={album?.id} />
      <Reveal>
        {album && (
          <Link
            href={`/album/${album.slug}`}
            className="inline-flex items-center gap-2 text-[13px] text-slate hover:text-ink transition-colors mb-7 no-underline"
          >
            <span aria-hidden="true">←</span>
            {album.title}
          </Link>
        )}
      </Reveal>

      <Reveal>
        <div className="relative w-full mb-7 overflow-hidden">
          <Image
            src={photo.filePath}
            alt={photo.title ?? photo.filename}
            width={photo.width}
            height={photo.height}
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="w-full h-auto"
            priority
          />
        </div>
      </Reveal>

      <Reveal>
        <div className="flex justify-between items-end mb-7">
          <div>
            <h1 className="text-[28px] font-medium tracking-[-0.02em] mb-1">
              {photo.title ?? photo.filename}
            </h1>
            {photo.description && (
              <p className="text-slate text-[16px]">{photo.description}</p>
            )}
            {story && (
              <Link
                href={`/stories/${story.slug}`}
                className="inline-flex items-center gap-2 text-[13px] text-slate hover:text-ink transition-colors mt-3 no-underline"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-light-signal" />
                幕后故事：{story.title}
              </Link>
            )}
          </div>
          <div className="text-[13px] text-slate text-right">
            <div>{formatDate(photo.createdAt)}</div>
            <div className="tabular-nums">
              {photo.width} × {photo.height}
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <ExifPanel exif={photo.exif} />
      </Reveal>
    </div>
  );
}
