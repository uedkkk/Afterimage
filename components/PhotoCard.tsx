import Image from "next/image";
import Link from "next/link";
import type { PhotoWithTags } from "@/lib/db/queries";

export const SPANS = [
  "col-span-1 md:col-span-5 aspect-[4/5]",
  "col-span-1 md:col-span-7 aspect-[3/2]",
  "col-span-1 md:col-span-4 aspect-square",
  "col-span-1 md:col-span-4 aspect-square",
  "col-span-1 md:col-span-4 aspect-square",
  "col-span-1 md:col-span-7 aspect-[3/2]",
  "col-span-1 md:col-span-5 aspect-[4/5]",
];

interface PhotoCardProps {
  photo: PhotoWithTags;
  index: number;
}

export function PhotoCard({ photo, index }: PhotoCardProps) {
  const num = String(index + 1).padStart(2, "0");

  return (
    <Link
      href={`/photo/${photo.id}`}
      className="relative overflow-hidden cursor-pointer bg-faint group"
    >
      <Image
        src={photo.thumbPath ?? photo.filePath}
        alt={photo.title ?? photo.filename}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] grayscale-[0.1] contrast-[1.02] group-hover:scale-105 group-hover:grayscale-0"
      />
      <div className="absolute inset-0 p-4 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-b from-black/25 via-transparent to-black/65 text-white">
        <span className="text-[11px] font-semibold tracking-wider tabular-nums opacity-70">
          {num}
        </span>
        <div className="flex justify-between items-end">
          <div className="text-[17px] font-semibold tracking-tight">
            {photo.title ?? photo.filename}
          </div>
          {photo.exif && (
            <div className="font-serif italic text-[13px] opacity-80">
              {typeof photo.exif.camera === "string" ? photo.exif.camera : ""}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
