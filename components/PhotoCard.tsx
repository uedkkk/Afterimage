import Image from "next/image";
import Link from "next/link";
import type { PhotoWithTags } from "@/lib/db/queries";

export const SPANS = [
  "col-span-1 md:col-span-6 aspect-[3/2]",
  "col-span-1 md:col-span-6 aspect-[3/2]",
  "col-span-1 md:col-span-4 aspect-square",
  "col-span-1 md:col-span-4 aspect-square",
  "col-span-1 md:col-span-4 aspect-square",
  "col-span-1 md:col-span-6 aspect-[3/2]",
  "col-span-1 md:col-span-6 aspect-[3/2]",
];

interface PhotoCardProps {
  photo: PhotoWithTags;
  index: number;
}

export function PhotoCard({ photo, index }: PhotoCardProps) {
  return (
    <Link
      href={`/photo/${photo.id}`}
      className="relative block h-full w-full overflow-hidden cursor-pointer bg-dust group rounded-stadium shadow-card transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-drama"
    >
      <Image
        src={photo.filePath}
        alt={photo.title ?? photo.filename}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
      />
      <div className="absolute inset-0 p-5 md:p-7 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-b from-black/30 via-transparent to-black/70 text-white">
        <span className="self-start bg-white text-ink rounded-pill px-3 py-1 text-[12px] font-medium">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="flex justify-between items-end">
          <div className="text-[18px] md:text-[22px] font-medium tracking-[-0.01em]">
            {photo.title ?? photo.filename}
          </div>
          {photo.exif && (
            <div className="text-[13px] font-450 opacity-80">
              {typeof photo.exif.camera === "string" ? photo.exif.camera : ""}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
