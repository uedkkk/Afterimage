import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPhotoWithAlbum } from "@/lib/db/queries";
import { ExifPanel } from "@/components/ExifPanel";
import { Reveal } from "@/components/Reveal";
import { formatDate } from "@/lib/utils";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PhotoPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getPhotoWithAlbum(id);

  if (!result) notFound();

  const { photo, album } = result;

  return (
    <div className="px-4 md:px-14 py-14 max-w-5xl mx-auto">
      <Reveal>
        {album && (
          <Link
            href={`/album/${album.slug}`}
            className="inline-block text-[12px] text-dim hover:text-accent transition-colors mb-7 no-underline"
          >
            {album.title}
          </Link>
        )}
      </Reveal>

      <Reveal>
        <div className="relative w-full mb-7">
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
            <h1 className="font-display text-2xl font-semibold tracking-tight mb-1">
              {photo.title ?? photo.filename}
            </h1>
            {photo.description && (
              <p className="font-serif italic text-dim">{photo.description}</p>
            )}
          </div>
          <div className="text-[12px] text-dim text-right">
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
