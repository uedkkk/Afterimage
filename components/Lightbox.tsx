"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import type { PhotoWithTags } from "@/lib/db/queries";

interface LightboxProps {
  photos: PhotoWithTags[];
  initialIndex: number;
  onClose: () => void;
}

export function Lightbox({ photos, initialIndex, onClose }: LightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const [showExif, setShowExif] = useState(false);

  const photo = photos[index];

  const goNext = useCallback(() => {
    setIndex((i) => (i + 1) % photos.length);
  }, [photos.length]);

  const goPrev = useCallback(() => {
    setIndex((i) => (i - 1 + photos.length) % photos.length);
  }, [photos.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "i" || e.key === "I") setShowExif((s) => !s);
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose, goNext, goPrev]);

  if (!photo) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="图片浏览"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="关闭"
        className="absolute top-5 right-5 text-white/60 hover:text-white text-2xl z-10 w-10 h-10 flex items-center justify-center"
      >
        ✕
      </button>

      {/* Prev button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          goPrev();
        }}
        aria-label="上一张"
        className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-3xl z-10 w-12 h-12 flex items-center justify-center"
      >
        ‹
      </button>

      {/* Image */}
      <div
        className="relative max-w-[90vw] max-h-[85vh] w-full h-full"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={photo.filePath}
          alt={photo.title ?? photo.filename}
          fill
          sizes="90vw"
          className="object-contain"
          priority
        />
      </div>

      {/* Next button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          goNext();
        }}
        aria-label="下一张"
        className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-3xl z-10 w-12 h-12 flex items-center justify-center"
      >
        ›
      </button>

      {/* Bottom info bar */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex justify-between items-end">
          <div className="text-white">
            <h3 className="font-display text-lg font-medium mb-1">
              {photo.title ?? photo.filename}
            </h3>
            <p className="text-white/50 text-sm font-serif italic">
              {String(index + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
            </p>
          </div>
          {photo.exif && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowExif((s) => !s);
              }}
              className="text-white/60 hover:text-white text-sm border border-white/20 px-3 py-1.5 hover:border-white/50 transition-colors"
            >
              {showExif ? "隐藏 EXIF" : "EXIF 信息"}
            </button>
          )}
        </div>

        {/* EXIF panel */}
        {showExif && photo.exif && (
          <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-4 text-sm">
            {Object.entries(photo.exif).map(([key, value]) => (
              <div key={key}>
                <div className="text-white/40 text-xs uppercase tracking-wider mb-0.5">
                  {key}
                </div>
                <div className="text-white/80">{String(value)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
