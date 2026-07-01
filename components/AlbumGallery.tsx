"use client";

import { useState } from "react";
import Image from "next/image";
import type { PhotoWithTags } from "@/lib/db/queries";
import { Lightbox } from "./Lightbox";

interface AlbumGalleryProps {
  photos: PhotoWithTags[];
}

export function AlbumGallery({ photos }: AlbumGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-3.5">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            onClick={() => setLightboxIndex(index)}
            className="break-inside-avoid mb-3.5 relative overflow-hidden cursor-pointer group block w-full"
          >
            <Image
              src={photo.thumbPath ?? photo.filePath}
              alt={photo.title ?? photo.filename}
              width={photo.width}
              height={photo.height}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="w-full block transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] brightness-[0.9] saturate-[0.9] group-hover:scale-105 group-hover:brightness-100 group-hover:saturate-100"
            />
            <div className="absolute inset-0 p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/70 to-transparent">
              <div className="text-white font-display text-base font-semibold">
                {photo.title ?? photo.filename}
              </div>
              {photo.exif && typeof photo.exif.camera === "string" && (
                <div className="text-white/70 font-serif italic text-xs mt-0.5">
                  {photo.exif.camera}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
