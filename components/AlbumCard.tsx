import Image from "next/image";
import Link from "next/link";
import type { Album, Photo } from "@/lib/generated/prisma/client";

interface AlbumCardProps {
  album: Album & { cover: Photo | null };
}

export function AlbumCard({ album }: AlbumCardProps) {
  return (
    <Link
      href={`/album/${album.slug}`}
      className="relative overflow-hidden cursor-pointer bg-dust group block aspect-[4/3] no-underline"
    >
      {album.cover && (
        <Image
          src={album.cover.filePath}
          alt={album.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
        />
      )}
      <div className="absolute inset-0 p-5 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/70 to-transparent text-white">
        <span className="self-start text-[12px] font-semibold uppercase tracking-[0.04em] text-light-signal mb-2">
          Album
        </span>
        <h3 className="text-[20px] font-medium tracking-[-0.01em]">{album.title}</h3>
        {album.description && (
          <p className="text-white/70 text-[14px] mt-1 line-clamp-2">
            {album.description}
          </p>
        )}
      </div>
    </Link>
  );
}
