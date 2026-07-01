"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { PhotoWithTags } from "@/lib/db/queries";

interface SearchResultsProps {
  initialResults: PhotoWithTags[];
  query: string;
}

export function SearchResults({ initialResults, query: initialQuery }: SearchResultsProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState(initialResults);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (value: string) => {
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`);
      const data = await res.json();
      setResults(data.photos ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-10 pb-7 border-b border-line">
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="搜索作品…"
          autoFocus
          className="w-full font-display text-[clamp(24px,3vw,36px)] font-semibold tracking-tight bg-transparent border-none outline-none placeholder:text-faint"
        />
        <p className="text-[12px] text-dim mt-2">
          {loading ? "搜索中…" : `${results.length} 个结果`}
        </p>
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {results.map((photo) => (
            <Link
              key={photo.id}
              href={`/photo/${photo.id}`}
              className="relative aspect-square overflow-hidden bg-faint group block"
            >
              <Image
                src={photo.thumbPath ?? photo.filePath}
                alt={photo.title ?? photo.filename}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 p-3 flex items-end opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/60 to-transparent">
                <span className="text-white text-sm font-medium">
                  {photo.title ?? photo.filename}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        !loading && query && (
          <p className="font-serif italic text-dim text-lg">
            未找到匹配的作品…
          </p>
        )
      )}
    </div>
  );
}
