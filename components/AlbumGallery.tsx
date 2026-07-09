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
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-5">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            onClick={() => setLightboxIndex(index)}
            className="break-inside-avoid mb-5 relative overflow-hidden cursor-pointer group block w-full rounded-stadium shadow-card transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-drama"
          >
            <Image
              src={photo.filePath}
              alt={photo.title ?? photo.filename}
              width={photo.width}
              height={photo.height}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="w-full block transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
            />
            <div className="absolute inset-0 p-5 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/70 to-transparent">
              <span className="self-start bg-white text-ink rounded-pill px-3 py-1 text-[12px] font-medium mb-2">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="text-white text-[16px] font-medium tracking-[-0.01em]">
                {photo.title ?? photo.filename}
              </div>
              {photo.exif && typeof photo.exif.camera === "string" && (
                <div className="text-white/70 text-[13px] font-450 mt-0.5">
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
