import Image from "next/image";
import Link from "next/link";
import { getAllPhotos, getAllSettings, getPublishedAlbums, getPublishedStories } from "@/lib/db/queries";
import { PhotoGrid } from "@/components/PhotoGrid";
import { Reveal } from "@/components/Reveal";

export const revalidate = 300;

export default async function Home() {
  const [photos, settings, albums, stories] = await Promise.all([
    getAllPhotos(7, 0),
    getAllSettings(),
    getPublishedAlbums(),
    getPublishedStories(),
  ]);

  const description = settings["site.description"] ?? "摄影作品展示与管理系统";
  const heroTitle = settings["site.hero_title"] ?? "光影的";
  const heroSubtitle = settings["site.hero_subtitle"] ?? "残像";
  const bio = settings["about.content"] ?? "用镜头书写光影的诗篇。";
  const gearRaw = settings["about.gear"] ?? "";
  const heroPhoto = photos[0];
  const featuredAlbums = albums.slice(0, 5);
  const featuredStories = stories.slice(0, 3);

  const gear = gearRaw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [brand, ...modelParts] = line.split(/\s+/);
      return { brand, model: modelParts.join(" ") || "" };
    });

  return (
    <>
      {/* Hero — Stadium Media Frame */}
      <section className="px-6">
        <div className="relative rounded-stadium overflow-hidden w-full h-[62vh] min-h-[420px] bg-ink shadow-card">
          {heroPhoto && (
            <Image
              src={heroPhoto.thumbPath ?? heroPhoto.filePath}
              alt={heroPhoto.title ?? heroPhoto.filename}
              fill
              sizes="100vw"
              className="object-cover opacity-85"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-ink/50 via-transparent to-ink/30" />
          <div className="absolute inset-0 p-8 md:p-14 flex flex-col justify-between z-10">
            <span className="self-start inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.04em] text-white bg-white/15 backdrop-blur-sm rounded-pill px-4 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-light-signal" />
              Featured · 2024
            </span>
            <div className="flex justify-between items-end gap-8">
              <h1 className="text-[clamp(36px,6vw,72px)] font-medium leading-none tracking-[-0.02em] text-white max-w-2xl">
                {heroTitle}
                <br />
                {heroSubtitle}
              </h1>
              <div className="hidden md:block">
                <p className="text-[16px] font-450 leading-[1.5] text-white/85 max-w-xs mb-3">
                  {description}
                </p>
                <Link
                  href="#gallery"
                  className="inline-flex items-center gap-2 bg-ink text-canvas border-[1.5px] border-ink rounded-button px-7 py-2.5 text-[15px] font-medium tracking-[-0.01em] no-underline transition-all duration-300 hover:bg-transparent hover:text-white hover:border-white"
                >
                  浏览全部作品 →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Albums — Circular Portraits with Orbital Arcs */}
      {featuredAlbums.length > 0 && (
        <section className="py-24 md:py-32 px-6 relative overflow-hidden">
          <div className="absolute top-4 left-0 text-[clamp(80px,14vw,180px)] font-medium tracking-[-0.02em] text-ghost leading-none pointer-events-none select-none">
            Albums
          </div>
          <Reveal>
            <div className="flex flex-col items-center gap-3 mb-16">
              <span className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.04em] text-slate">
                <span className="w-1.5 h-1.5 rounded-full bg-light-signal" />
                精选影集
              </span>
              <h2 className="text-[clamp(28px,4vw,48px)] font-medium tracking-[-0.02em] leading-[1.1] text-center">
                每一组影像，都是一段旅程
              </h2>
            </div>
          </Reveal>
          <div className="relative max-w-6xl mx-auto">
            {/* Orbital arcs — decorative SVG */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none hidden md:block" viewBox="0 0 1200 520" preserveAspectRatio="none" aria-hidden="true">
              <path d="M120,140 Q400,80 600,200 T1080,120" fill="none" stroke="#F37338" strokeWidth="1.5" strokeDasharray="4 6" opacity="0.5" />
              <path d="M200,420 Q500,360 700,440 T1050,380" fill="none" stroke="#F37338" strokeWidth="1.5" strokeDasharray="4 6" opacity="0.5" />
              <path d="M180,180 Q350,300 500,420" fill="none" stroke="#F37338" strokeWidth="1.5" strokeDasharray="4 6" opacity="0.4" />
            </svg>
            <div className="relative flex flex-wrap justify-center gap-8 md:gap-12 py-8">
              {featuredAlbums.map((album, i) => (
                <Reveal key={album.id} delay={i * 80}>
                  <Link href={`/album/${album.slug}`} className="group flex flex-col items-center gap-4 no-underline">
                    <div className="relative w-[200px] h-[200px] md:w-[240px] md:h-[240px]">
                      <div className="relative w-full h-full rounded-full overflow-hidden shadow-card cursor-pointer transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105">
                        {album.cover ? (
                          <Image
                            src={album.cover.thumbPath ?? album.cover.filePath}
                            alt={album.title}
                            fill
                            sizes="(max-width: 768px) 200px, 240px"
                            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-dust" />
                        )}
                      </div>
                      <span className="absolute bottom-3 right-3 w-[52px] h-[52px] rounded-full bg-white flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition-all duration-300 group-hover:bg-ink group-hover:text-white z-10">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                          <path d="M7 17L17 7M17 7H8M17 7V16" />
                        </svg>
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.04em] text-slate">
                        <span className="w-1.5 h-1.5 rounded-full bg-light-signal" />
                        {album.category?.name ?? "Album"}
                      </span>
                      <span className="text-[18px] md:text-[20px] font-medium tracking-[-0.01em] text-ink">
                        {album.title}
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery — Pill Cards */}
      <section className="px-6 pb-24" id="gallery">
        <div className="bg-lifted rounded-stadium px-6 md:px-12 py-16 md:py-24">
          <Reveal>
            <div className="flex flex-col items-center gap-3 mb-12">
              <span className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.04em] text-slate">
                <span className="w-1.5 h-1.5 rounded-full bg-light-signal" />
                作品集
              </span>
              <h2 className="text-[clamp(28px,4vw,48px)] font-medium tracking-[-0.02em] leading-[1.1] text-center">
                {photos.length} 张光影瞬间
              </h2>
            </div>
          </Reveal>
          <PhotoGrid photos={photos} />
          <Reveal>
            <div className="flex justify-center mt-16">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 bg-ink text-canvas border-[1.5px] border-ink rounded-button px-7 py-2.5 text-[15px] font-medium tracking-[-0.01em] no-underline transition-all duration-300 hover:bg-charcoal"
              >
                查看全部作品 →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Stories — Pill Carousel Cards */}
      {featuredStories.length > 0 && (
        <section className="py-24 md:py-32 px-6 relative overflow-hidden">
          <div className="absolute top-4 right-0 text-[clamp(80px,14vw,180px)] font-medium tracking-[-0.02em] text-ghost leading-none pointer-events-none select-none">
            Stories
          </div>
          <Reveal>
            <div className="flex flex-col items-center gap-3 mb-16">
              <span className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.04em] text-slate">
                <span className="w-1.5 h-1.5 rounded-full bg-light-signal" />
                影像故事
              </span>
              <h2 className="text-[clamp(28px,4vw,48px)] font-medium tracking-[-0.02em] leading-[1.1] text-center">
                镜头背后的叙事
              </h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {featuredStories.map((story, i) => (
              <Reveal key={story.id} delay={i * 80}>
                <Link href={`/stories/${story.slug}`} className="group block no-underline">
                  {story.cover ? (
                    <div className="relative aspect-[3/4] overflow-hidden bg-dust rounded-stadium shadow-card transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1.5 group-hover:shadow-drama">
                      <Image
                        src={story.cover.thumbPath ?? story.cover.filePath}
                        alt={story.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex flex-col justify-end p-7 bg-gradient-to-t from-black/80 to-transparent">
                        <span className="self-start bg-white text-ink rounded-pill px-3 py-1 text-[11px] font-medium mb-3">
                          Story
                        </span>
                        <h3 className="text-white text-[22px] font-medium tracking-[-0.01em] leading-[1.2] mb-1.5">
                          {story.title}
                        </h3>
                        <p className="text-white/70 text-[14px] font-450 leading-[1.5] line-clamp-2">
                          {story.excerpt}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative aspect-[3/4] overflow-hidden bg-lifted rounded-stadium shadow-card p-7 flex flex-col justify-between transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1.5 group-hover:shadow-drama">
                      <span className="self-start bg-ink text-canvas rounded-pill px-3 py-1 text-[11px] font-medium">
                        Story
                      </span>
                      <div>
                        <h3 className="text-ink text-[22px] font-medium tracking-[-0.01em] leading-[1.2] mb-1.5">
                          {story.title}
                        </h3>
                        <p className="text-slate text-[14px] font-450 leading-[1.5] line-clamp-4">
                          {story.excerpt}
                        </p>
                      </div>
                    </div>
                  )}
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* About — Split Editorial */}
      <section className="py-24 md:py-32 px-6 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
          <Reveal>
            <div className="relative">
              <div className="absolute -top-10 -left-16 text-[120px] font-medium tracking-[-0.02em] text-ghost leading-none pointer-events-none select-none">
                About
              </div>
              <div className="relative">
                <div className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.04em] text-slate mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-light-signal" />
                  关于摄影师
                </div>
                <h2 className="text-[clamp(28px,4vw,52px)] font-medium leading-[1.1] tracking-[-0.02em] text-balance">
                  用镜头书写
                  <br />
                  光影的诗篇
                </h2>
              </div>
            </div>
          </Reveal>
          <Reveal>
            <div className="flex flex-col justify-center">
              <p className="text-[16px] font-450 leading-relaxed text-granite max-w-md mb-8">
                {bio}
              </p>
              {gear.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {gear.map((item, i) => (
                    <div key={i} className="bg-lifted rounded-button p-5 flex flex-col gap-1">
                      <span className="text-[15px] font-medium text-ink">{item.brand}</span>
                      <span className="text-[13px] font-450 text-slate">{item.model}</span>
                    </div>
                  ))}
                </div>
              )}
              <Link
                href="/about"
                className="inline-flex items-center gap-2 bg-white text-ink border-[1.5px] border-ink rounded-button px-7 py-2.5 text-[15px] font-450 no-underline transition-all duration-300 hover:bg-ink hover:text-canvas self-start"
              >
                了解更多 →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
