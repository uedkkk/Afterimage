# Afterimage Phase 2: Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build all public-facing frontend pages — homepage, albums, photos, stories, about, search — with the Swiss Minimalism design language from the approved mockup.

**Architecture:** Next.js App Router with a `(public)` route group. Server Components for data fetching with ISR (5-min revalidation). Client Components for interactivity (lightbox, search, filters). Tailwind CSS matching the `design-b-v2.html` mockup. Space Grotesk + Instrument Serif fonts already configured in Phase 1.

**Tech Stack:** Next.js 15 App Router, React 19 Server/Client Components, Tailwind CSS v3, Prisma 7

## Global Constraints

- Swiss Minimalism design: warm paper `#f4f2ed` bg, near-black `#0e0e0e` text, accent `#a64b2a`
- Fonts: Space Grotesk (display) + Instrument Serif (italic accents) — already loaded
- No Inter, Roboto, Arial, system-ui fonts
- CSS custom properties already in globals.css from Phase 1
- `prefers-reduced-motion` honored
- All images need explicit `width` and `height`
- Semantic HTML (`<button>`, `<a>`, `<article>`, `<nav>`, `<footer>`)
- SSG + ISR: `export const revalidate = 300` (5 minutes)
- Paper texture overlay already in globals.css
- Existing query layer: `lib/db/queries.ts` (createPhoto, getPhotoById, getPhotosByAlbum, getAllPhotos, getPublishedAlbums, getAlbumBySlug, getAlbumsByCategory, getAllCategories, getPublishedStories, getStoryBySlug, createPageView, getSetting, getAllSettings)
- Prisma client imported from `@/lib/db`

---

### Task 1: Shared Layout Components

**Files:**
- Create: `components/Nav.tsx`, `components/Footer.tsx`, `components/IndexBar.tsx`, `components/Reveal.tsx`
- Create: `app/(public)/layout.tsx`
- Move: `app/page.tsx` → `app/(public)/page.tsx` (placeholder for now, replaced in Task 2)
- Create: `lib/utils.ts`

**Interfaces:**
- Produces: `<Nav />` — sticky nav bar with logo, center links, search button
- Produces: `<Footer />` — three-column footer
- Produces: `<IndexBar />` — info bar with site stats
- Produces: `<Reveal>` — client component wrapper for scroll-triggered fade-in
- Produces: `cn(...classes: (string | undefined | false)[])` — class name utility in `lib/utils.ts`

- [ ] **Step 1: Create utility functions**

Create `lib/utils.ts`:

```typescript
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
```

- [ ] **Step 2: Create Reveal component**

Create `components/Reveal.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] transition-transform",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Create Nav component**

Create `components/Nav.tsx`:

```tsx
import Link from "next/link";

export function Nav() {
  return (
    <nav className="sticky top-0 z-50 bg-bg/88 backdrop-blur-md border-b border-line h-14 px-14 flex items-center justify-between">
      <Link
        href="/"
        className="font-display text-[17px] font-semibold tracking-tight no-underline text-ink flex items-center gap-1.5"
      >
        After
        <em className="font-serif italic font-normal text-accent">image</em>
      </Link>
      <div className="flex gap-0 absolute left-1/2 -translate-x-1/2">
        <Link
          href="/"
          className="text-ink no-underline text-[13px] font-medium px-4 py-1 transition-colors relative group"
        >
          作品
          <span className="absolute -bottom-0.5 left-4 right-4 h-px bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        </Link>
        <Link
          href="/stories"
          className="text-ink no-underline text-[13px] font-medium px-4 py-1 transition-colors relative group"
        >
          故事
          <span className="absolute -bottom-0.5 left-4 right-4 h-px bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        </Link>
        <Link
          href="/about"
          className="text-ink no-underline text-[13px] font-medium px-4 py-1 transition-colors relative group"
        >
          关于
          <span className="absolute -bottom-0.5 left-4 right-4 h-px bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        </Link>
      </div>
      <div className="flex items-center gap-2.5">
        <Link
          href="/search"
          className="border border-faint px-2.5 py-1.5 text-[12px] text-dim hover:border-ink hover:text-ink transition-colors flex items-center gap-1.5 no-underline"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          搜索
        </Link>
      </div>
    </nav>
  );
}
```

- [ ] **Step 4: Create IndexBar component**

Create `components/IndexBar.tsx`:

```tsx
import { getAllPhotos, getPublishedAlbums, getAllSettings } from "@/lib/db/queries";

export async function IndexBar() {
  const [albums, photos, settings] = await Promise.all([
    getPublishedAlbums(),
    getAllPhotos(9999, 0),
    getAllSettings(),
  ]);

  const title = settings["site.title"] ?? "Afterimage";

  return (
    <div className="flex border-b border-line text-[11px] font-medium uppercase tracking-wider">
      <div className="px-5 py-2 border-r border-faint flex items-center gap-1.5 first:pl-14">
        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
        {title}
      </div>
      <div className="px-5 py-2 border-r border-faint">
        {photos.length} Works · {albums.length} Albums
      </div>
      <div className="px-5 py-2 ml-auto">
        Travel · Street · Portrait
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create Footer component**

Create `components/Footer.tsx`:

```tsx
import { getAllSettings } from "@/lib/db/queries";

export async function Footer() {
  const settings = await getAllSettings();
  const title = settings["site.title"] ?? "Afterimage";

  return (
    <footer className="border-t border-line px-14 py-14 grid grid-cols-[1fr_auto_1fr] items-center gap-7">
      <div className="text-[12px] text-dim">
        © {new Date().getFullYear()} {title}
      </div>
      <div className="font-display text-2xl font-semibold tracking-tight text-center">
        After
        <em className="font-serif italic font-normal text-accent">image</em>
      </div>
      <div className="text-[12px] text-dim text-right">
        <a href="https://instagram.com" className="hover:text-accent transition-colors" target="_blank" rel="noopener noreferrer">Instagram</a>
        {" · "}
        <a href="https://github.com" className="hover:text-accent transition-colors" target="_blank" rel="noopener noreferrer">GitHub</a>
      </div>
    </footer>
  );
}
```

- [ ] **Step 6: Create public layout**

Create `app/(public)/layout.tsx`:

```tsx
import type { ReactNode } from "react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { IndexBar } from "@/components/IndexBar";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Nav />
      <IndexBar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 7: Move homepage to public route group**

Move `app/page.tsx` to `app/(public)/page.tsx` as a temporary placeholder:

```tsx
export default function Home() {
  return (
    <div className="p-14">
      <h1 className="font-display text-6xl font-bold tracking-tight">
        光影的<br />
        <em className="font-serif font-normal italic text-accent">残像</em>
      </h1>
    </div>
  );
}
```

Delete the old `app/page.tsx`.

- [ ] **Step 8: Verify dev server**

```bash
npm run dev
```

Expected: Site loads with Nav, IndexBar, placeholder homepage, Footer.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add shared layout components (Nav, Footer, IndexBar, Reveal)"
```

---

### Task 2: Homepage

**Files:**
- Modify: `app/(public)/page.tsx`
- Create: `components/PhotoGrid.tsx`, `components/PhotoCard.tsx`

**Interfaces:**
- Produces: `<PhotoGrid photos={PhotoWithTags[]} />` — asymmetric 12-column grid
- Produces: `<PhotoCard photo={PhotoWithTags} index={number} />` — card with hover overlay

- [ ] **Step 1: Create PhotoCard component**

Create `components/PhotoCard.tsx`:

```tsx
import Image from "next/image";
import Link from "next/link";
import type { PhotoWithTags } from "@/lib/db/queries";
import { cn } from "@/lib/utils";

const SPANS = [
  "col-span-5 aspect-[4/5]",
  "col-span-7 aspect-[3/2]",
  "col-span-4 aspect-square",
  "col-span-4 aspect-square",
  "col-span-4 aspect-square",
  "col-span-7 aspect-[3/2]",
  "col-span-5 aspect-[4/5]",
];

interface PhotoCardProps {
  photo: PhotoWithTags;
  index: number;
}

export function PhotoCard({ photo, index }: PhotoCardProps) {
  const span = SPANS[index % SPANS.length];
  const num = String(index + 1).padStart(2, "0");

  return (
    <Link
      href={`/photo/${photo.id}`}
      className={cn(
        "relative overflow-hidden cursor-pointer bg-faint group",
        span
      )}
    >
      <Image
        src={photo.thumbPath ?? photo.filePath}
        alt={photo.title ?? photo.filename}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] grayscale-[0.1] contrast-[1.02] group-hover:scale-105 group-hover:grayscale-0"
      />
      <div className="absolute inset-0 p-4.5 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-b from-black/25 via-transparent to-black/65 text-white">
        <span className="text-[11px] font-semibold tracking-wider tabular-nums opacity-70">
          {num} / {String(index + 1).padStart(3, "0")}
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
```

- [ ] **Step 2: Create PhotoGrid component**

Create `components/PhotoGrid.tsx`:

```tsx
import type { PhotoWithTags } from "@/lib/db/queries";
import { PhotoCard } from "./PhotoCard";
import { Reveal } from "./Reveal";

interface PhotoGridProps {
  photos: PhotoWithTags[];
}

export function PhotoGrid({ photos }: PhotoGridProps) {
  return (
    <div className="grid grid-cols-12 gap-3.5">
      {photos.map((photo, index) => (
        <Reveal key={photo.id} delay={index * 50}>
          <PhotoCard photo={photo} index={index} />
        </Reveal>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create homepage**

Replace `app/(public)/page.tsx`:

```tsx
import { getAllPhotos, getPublishedAlbums, getAllSettings } from "@/lib/db/queries";
import { PhotoGrid } from "@/components/PhotoGrid";
import { Reveal } from "@/components/Reveal";
import Link from "next/link";

export const revalidate = 300;

export default async function Home() {
  const [photos, albums, settings] = await Promise.all([
    getAllPhotos(7, 0),
    getPublishedAlbums(),
    getAllSettings(),
  ]);

  const title = settings["site.title"] ?? "Afterimage";
  const description = settings["site.description"] ?? "摄影作品展示与管理系统";

  return (
    <>
      {/* Hero — compact text intro */}
      <section className="grid grid-cols-[1.4fr_1fr] items-end gap-28 px-14 pt-14 pb-7 border-b border-line">
        <div>
          <div className="flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-widest text-accent mb-3.5 before:content-[''] before:w-7 before:h-px before:bg-accent">
            Featured · 2024
          </div>
          <h1 className="font-display text-[clamp(40px,6vw,84px)] font-bold leading-[0.92] tracking-tight">
            光影的
            <br />
            <em className="font-serif italic font-normal text-accent tracking-tight">
              残像
            </em>
          </h1>
        </div>
        <div className="flex flex-col gap-7 pb-2">
          <p className="font-serif text-[17px] italic text-dim leading-relaxed">
            {description}
          </p>
          <Link
            href="#gallery"
            className="inline-flex items-center gap-2 text-[13px] font-medium no-underline text-ink hover:gap-3.5 hover:text-accent transition-all"
          >
            浏览全部作品
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {/* Gallery */}
      <section className="px-14 pt-28 pb-14" id="gallery">
        <Reveal>
          <div className="flex justify-between items-end mb-14 pb-7 border-b border-line">
            <div className="flex items-baseline gap-4">
              <h2 className="font-display text-[clamp(24px,3vw,36px)] font-semibold tracking-tight">
                作品集
              </h2>
              <span className="font-serif italic text-base text-dim">
                — 共 {photos.length} 张
              </span>
            </div>
          </div>
        </Reveal>
        <PhotoGrid photos={photos} />
      </section>
    </>
  );
}
```

- [ ] **Step 4: Verify dev server**

```bash
npm run dev
```

Expected: Homepage shows compact hero + gallery grid (may be empty if no photos in DB).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add homepage with compact hero and asymmetric photo grid"
```

---

### Task 3: Lightbox Component

**Files:**
- Create: `components/Lightbox.tsx`

**Interfaces:**
- Produces: `<Lightbox photos={PhotoWithTags[]} initialIndex={number} onClose={() => void} />` — client component, fullscreen image viewer with keyboard navigation

- [ ] **Step 1: Create Lightbox component**

Create `components/Lightbox.tsx`:

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add Lightbox component with keyboard navigation and EXIF panel"
```

---

### Task 4: Album Detail Page

**Files:**
- Create: `app/(public)/album/[slug]/page.tsx`
- Create: `components/AlbumGallery.tsx` — client component wrapping masonry + lightbox
- Create: `lib/db/queries.ts` (modify — add `getAlbumWithPhotos`)

**Interfaces:**
- Produces: `<AlbumGallery photos={PhotoWithTags[]} />` — client component with masonry + lightbox trigger

- [ ] **Step 1: Add query for album with photos**

Add to `lib/db/queries.ts`:

```typescript
export async function getAlbumWithPhotos(slug: string): Promise<{
  album: Album & { category: Category | null; cover: Photo | null };
  photos: PhotoWithTags[];
} | null> {
  const album = await db.album.findUnique({
    where: { slug },
    include: { category: true, cover: true },
  });
  if (!album) return null;

  const photos = await getPhotosByAlbum(album.id);
  return { album, photos };
}
```

- [ ] **Step 2: Create AlbumGallery client component**

Create `components/AlbumGallery.tsx`:

```tsx
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
              className="w-full block transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] brightness-90 saturate-90 group-hover:scale-105 group-hover:brightness-100 group-hover:saturate-100"
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
```

- [ ] **Step 3: Create album detail page**

Create `app/(public)/album/[slug]/page.tsx`:

```tsx
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
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add album detail page with masonry layout and lightbox"
```

---

### Task 5: Category Page and Photo Detail Page

**Files:**
- Create: `app/(public)/category/[slug]/page.tsx`
- Create: `app/(public)/photo/[id]/page.tsx`
- Create: `components/AlbumCard.tsx`
- Create: `components/ExifPanel.tsx`
- Modify: `lib/db/queries.ts` — add `getCategoryBySlug`, `getPhotoWithAlbum`

- [ ] **Step 1: Add queries**

Add to `lib/db/queries.ts`:

```typescript
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return db.category.findUnique({ where: { slug } });
}

export async function getPhotoWithAlbum(id: string): Promise<{
  photo: PhotoWithTags;
  album: Album | null;
} | null> {
  const photo = await getPhotoById(id);
  if (!photo) return null;

  let album: Album | null = null;
  if (photo.albumId) {
    album = await db.album.findUnique({ where: { id: photo.albumId } });
  }

  return { photo, album };
}
```

Also update the existing `getAlbumsByCategory` to include the cover relation:

```typescript
export async function getAlbumsByCategory(categoryId: string): Promise<(Album & { cover: Photo | null })[]> {
  return db.album.findMany({
    where: { categoryId, published: true },
    orderBy: { sortOrder: "asc" },
    include: { cover: true },
  });
}
```

- [ ] **Step 2: Create AlbumCard component**

Create `components/AlbumCard.tsx`:

```tsx
import Image from "next/image";
import Link from "next/link";
import type { Album, Photo } from "@prisma/client";

interface AlbumCardProps {
  album: Album & { cover: Photo | null };
}

export function AlbumCard({ album }: AlbumCardProps) {
  return (
    <Link
      href={`/album/${album.slug}`}
      className="relative overflow-hidden cursor-pointer bg-faint group block aspect-[4/3]"
    >
      {album.cover && (
        <Image
          src={album.cover.thumbPath ?? album.cover.filePath}
          alt={album.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 p-4.5 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/70 to-transparent text-white">
        <h3 className="font-display text-lg font-semibold">{album.title}</h3>
        {album.description && (
          <p className="text-white/70 text-sm font-serif italic mt-0.5 line-clamp-2">
            {album.description}
          </p>
        )}
      </div>
    </Link>
  );
}
```

- [ ] **Step 3: Create category page**

Create `app/(public)/category/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { getCategoryBySlug, getAlbumsByCategory } from "@/lib/db/queries";
import { AlbumCard } from "@/components/AlbumCard";
import { Reveal } from "@/components/Reveal";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) notFound();

  const albums = await getAlbumsByCategory(category.id);

  return (
    <div className="px-14 py-14">
      <Reveal>
        <header className="mb-10 pb-7 border-b border-line">
          <div className="flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-widest text-accent mb-3 before:content-[''] before:w-7 before:h-px before:bg-accent">
            Category
          </div>
          <h1 className="font-display text-[clamp(28px,4vw,48px)] font-semibold tracking-tight">
            {category.name}
          </h1>
        </header>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {albums.map((album, index) => (
          <Reveal key={album.id} delay={index * 50}>
            <AlbumCard album={album} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create ExifPanel component**

Create `components/ExifPanel.tsx`:

```tsx
import type { ExifData } from "@/lib/image/exif";

interface ExifPanelProps {
  exif: ExifData | Record<string, unknown> | null;
}

const EXIF_LABELS: Record<string, string> = {
  camera: "相机",
  lens: "镜头",
  aperture: "光圈",
  shutter: "快门",
  iso: "ISO",
  focalLength: "焦距",
  takenAt: "拍摄时间",
};

export function ExifPanel({ exif }: ExifPanelProps) {
  if (!exif || Object.keys(exif).length === 0) return null;

  return (
    <div className="border-t border-faint pt-7 mt-7">
      <h3 className="text-[11px] font-medium uppercase tracking-widest text-dim mb-4">
        EXIF 信息
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {Object.entries(exif).map(([key, value]) => (
          <div key={key}>
            <div className="text-[11px] uppercase tracking-wider text-dim mb-0.5">
              {EXIF_LABELS[key] ?? key}
            </div>
            <div className="text-sm font-medium">{String(value)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create photo detail page**

Create `app/(public)/photo/[id]/page.tsx`:

```tsx
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
    <div className="px-14 py-14 max-w-5xl mx-auto">
      <Reveal>
        <Link
          href={album ? `/album/${album.slug}` : "/"}
          className="inline-flex items-center gap-2 text-[13px] text-dim hover:text-accent transition-colors mb-7 no-underline"
        >
          <span aria-hidden="true">←</span>
          {album ? album.title : "返回首页"}
        </Link>
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
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add category page, photo detail page, AlbumCard and ExifPanel components"
```

---

### Task 6: Stories Pages

**Files:**
- Create: `app/(public)/stories/page.tsx`
- Create: `app/(public)/stories/[slug]/page.tsx`
- Create: `components/StoryCard.tsx`

- [ ] **Step 1: Create StoryCard component**

Create `components/StoryCard.tsx`:

```tsx
import Image from "next/image";
import Link from "next/link";
import type { Story, Photo, Album } from "@prisma/client";
import { formatDate } from "@/lib/utils";

interface StoryCardProps {
  story: Story & { cover: Photo | null; album: Album | null };
}

export function StoryCard({ story }: StoryCardProps) {
  return (
    <Link
      href={`/stories/${story.slug}`}
      className="group block no-underline"
    >
      {story.cover && (
        <div className="relative aspect-[3/2] overflow-hidden bg-faint mb-4">
          <Image
            src={story.cover.thumbPath ?? story.cover.filePath}
            alt={story.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
          />
        </div>
      )}
      <h3 className="font-display text-xl font-semibold tracking-tight mb-1.5 group-hover:text-accent transition-colors">
        {story.title}
      </h3>
      <p className="font-serif italic text-dim text-sm leading-relaxed mb-2 line-clamp-2">
        {story.excerpt}
      </p>
      <div className="text-[12px] text-dim">{formatDate(story.createdAt)}</div>
    </Link>
  );
}
```

- [ ] **Step 2: Create stories list page**

Create `app/(public)/stories/page.tsx`:

```tsx
import { getPublishedStories } from "@/lib/db/queries";
import { StoryCard } from "@/components/StoryCard";
import { Reveal } from "@/components/Reveal";

export const revalidate = 300;

export default async function StoriesPage() {
  const stories = await getPublishedStories();

  return (
    <div className="px-14 py-14">
      <Reveal>
        <header className="mb-10 pb-7 border-b border-line">
          <div className="flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-widest text-accent mb-3 before:content-[''] before:w-7 before:h-px before:bg-accent">
            Stories
          </div>
          <h1 className="font-display text-[clamp(28px,4vw,48px)] font-semibold tracking-tight">
            照片故事
          </h1>
        </header>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
        {stories.map((story, index) => (
          <Reveal key={story.id} delay={index * 50}>
            <StoryCard story={story as any} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create story detail page**

Create `app/(public)/stories/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getStoryBySlug } from "@/lib/db/queries";
import { Reveal } from "@/components/Reveal";
import { formatDate } from "@/lib/utils";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function StoryPage({ params }: PageProps) {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);

  if (!story) notFound();

  return (
    <article className="px-14 py-14 max-w-3xl mx-auto">
      <Reveal>
        <Link
          href="/stories"
          className="inline-flex items-center gap-2 text-[13px] text-dim hover:text-accent transition-colors mb-7 no-underline"
        >
          <span aria-hidden="true">←</span>
          所有故事
        </Link>
      </Reveal>

      <Reveal>
        <header className="mb-10">
          <h1 className="font-display text-[clamp(28px,4vw,48px)] font-semibold tracking-tight mb-4 text-wrap-balance">
            {story.title}
          </h1>
          <div className="flex items-center gap-4 text-[12px] text-dim">
            <span>{formatDate(story.createdAt)}</span>
            {story.album && (
              <Link
                href={`/album/${story.album.slug}`}
                className="text-accent hover:underline"
              >
                {story.album.title}
              </Link>
            )}
          </div>
        </header>
      </Reveal>

      {story.cover && (
        <Reveal>
          <div className="relative aspect-[3/2] mb-10 overflow-hidden">
            <Image
              src={story.cover.thumbPath ?? story.cover.filePath}
              alt={story.title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </div>
        </Reveal>
      )}

      <Reveal>
        <div className="font-serif text-lg leading-relaxed text-ink/90 prose prose-neutral max-w-none">
          {story.content.split("\n").map((paragraph, i) => (
            <p key={i} className="mb-4">
              {paragraph}
            </p>
          ))}
        </div>
      </Reveal>
    </article>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add stories list and detail pages with StoryCard component"
```

---

### Task 7: About Page and Search Page

**Files:**
- Create: `app/(public)/about/page.tsx`
- Create: `app/(public)/search/page.tsx`
- Create: `components/SearchResults.tsx` — client component
- Modify: `lib/db/queries.ts` — add `searchPhotos`

- [ ] **Step 1: Add search query**

Add to `lib/db/queries.ts`:

```typescript
export async function searchPhotos(query: string): Promise<PhotoWithTags[]> {
  const photos = await db.photo.findMany({
    where: {
      OR: [
        { title: { contains: query } },
        { description: { contains: query } },
        { filename: { contains: query } },
        { tags: { contains: query } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return photos.map(serializePhoto);
}
```

- [ ] **Step 2: Create about page**

Create `app/(public)/about/page.tsx`:

```tsx
import { getAllSettings } from "@/lib/db/queries";
import { Reveal } from "@/components/Reveal";

export const revalidate = 300;

export default async function AboutPage() {
  const settings = await getAllSettings();
  const bio = settings["about.bio"] ?? "用镜头书写光影的诗篇。";
  const gearRaw = settings["about.gear"] ?? "[]";

  let gear: { brand: string; model: string }[] = [];
  try {
    gear = JSON.parse(gearRaw);
  } catch {
    gear = [];
  }

  return (
    <div className="px-14 py-14">
      <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] border-t border-line">
        {/* Left — title */}
        <Reveal className="lg:border-r lg:border-line lg:p-14 p-0 lg:pt-14 pt-14">
          <div className="flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-widest text-accent mb-3.5 before:content-[''] before:w-7 before:h-px before:bg-accent">
            About the Photographer
          </div>
          <h1 className="font-display text-[clamp(28px,4vw,48px)] font-semibold leading-tight tracking-tight text-wrap-balance">
            用镜头书写
            <em className="font-serif italic font-normal text-accent">光影</em>
            的诗篇
          </h1>
        </Reveal>

        {/* Right — bio + gear */}
        <Reveal className="lg:p-14 p-0 lg:pt-14 pt-7 flex flex-col justify-center">
          <p className="font-serif text-lg leading-relaxed text-dim max-w-md mb-14">
            {bio}
          </p>

          {gear.length > 0 && (
            <div className="grid grid-cols-2 gap-0 border-t border-faint">
              {gear.map((item, i) => (
                <div
                  key={i}
                  className={`py-3.5 border-b border-faint flex justify-between items-baseline ${
                    i % 2 === 0 ? "pr-3.5 border-r border-faint" : "pl-3.5"
                  }`}
                >
                  <span className="font-display text-sm font-semibold">
                    {item.brand}
                  </span>
                  <span className="font-serif italic text-[13px] text-dim">
                    {item.model}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Reveal>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create SearchResults client component**

Create `components/SearchResults.tsx`:

```tsx
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
```

- [ ] **Step 4: Create search API route**

Create `app/api/search/route.ts`:

```tsx
import { NextRequest, NextResponse } from "next/server";
import { searchPhotos } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  if (!query.trim()) {
    return NextResponse.json({ photos: [] });
  }
  const photos = await searchPhotos(query);
  return NextResponse.json({ photos });
}
```

- [ ] **Step 5: Create search page**

Create `app/(public)/search/page.tsx`:

```tsx
import { searchPhotos } from "@/lib/db/queries";
import { SearchResults } from "@/components/SearchResults";

export const revalidate = 300;

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q = "" } = await searchParams;
  const results = q ? await searchPhotos(q) : [];

  return (
    <div className="px-14 py-14">
      <SearchResults initialResults={results} query={q} />
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add about page, search page with live search, and search API route"
```

---

## Summary

After completing Phase 2, the public-facing site will have:

1. **Shared layout** — Nav, IndexBar, Footer, Reveal animation
2. **Homepage** — Compact text hero + asymmetric 12-column photo grid
3. **Lightbox** — Fullscreen image viewer with keyboard nav + EXIF panel
4. **Album detail** — Masonry layout + lightbox integration
5. **Category page** — Album grid cards
6. **Photo detail** — Large image + EXIF info panel
7. **Stories** — List page with cards + detail page with Markdown-style content
8. **About page** — Editorial spread with bio + gear list
9. **Search page** — Live search with grid results

Next phases:
- **Phase 3:** Backend admin (dashboard, albums, photos, upload, stories, categories, settings)
- **Phase 4:** Docker deployment and E2E testing
