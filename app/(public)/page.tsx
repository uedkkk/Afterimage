import Image from "next/image";
import Link from "next/link";
import { getAllPhotos, getAllSettings, getPublishedAlbums, getPublishedStories } from "@/lib/db/queries";
import { PhotoGrid } from "@/components/PhotoGrid";
import { StoryCard } from "@/components/StoryCard";
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
        <div className="relative overflow-hidden w-full h-[62vh] min-h-[420px] bg-ink">
          {heroPhoto && (
            <Image
              src={heroPhoto.filePath}
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

      {/* Featured Albums */}
      {featuredAlbums.length > 0 && (
        <section className="py-24 md:py-32 px-6 relative overflow-hidden">
          <div className="absolute top-4 left-0 text-[clamp(80px,14vw,180px)] font-medium tracking-[-0.02em] text-ghost leading-none pointer-events-none select-none">
            Albums
          </div>
          <div className="max-w-[1320px] mx-auto relative">
            <Reveal>
              <div className="pb-6 border-b border-[rgba(0,0,0,0.08)] mb-11">
                <div className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.04em] text-slate mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-light-signal" />
                  精选影集
                </div>
                <h2 className="text-[clamp(28px,4vw,48px)] font-medium tracking-[-0.02em] leading-[1.1]">
                  每一组影像，都是一段旅程
                </h2>
              </div>
            </Reveal>
            <div className="story-grid">
              {featuredAlbums.map((album, i) => (
                <Reveal key={album.id} delay={i * 80}>
                  <Link href={`/album/${album.slug}`} className="group flex flex-col gap-5 no-underline">
                    {album.cover ? (
                      <div className="relative aspect-[3/2] overflow-hidden bg-dust">
                        <Image
                          src={album.cover.filePath}
                          alt={album.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                        />
                      </div>
                    ) : (
                      <div className="relative aspect-[3/2] overflow-hidden bg-dust" />
                    )}
                    <div className="flex flex-col">
                      <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-signal mb-2">
                        {album.category?.name ?? "Album"}
                      </span>
                      <h3 className="text-[22px] font-semibold tracking-[-0.014em] leading-[1.3] text-ink transition-opacity duration-300 group-hover:opacity-60">
                        {album.title}
                      </h3>
                      {album.description && (
                        <p className="mt-2 text-[15px] leading-[1.5] text-[rgba(0,0,0,0.5)] line-clamp-2">
                          {album.description}
                        </p>
                      )}
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
          {albums.length > 5 && (
            <div className="flex justify-center mt-12">
              <Link
                href="/albums"
                className="inline-flex items-center gap-2 bg-ink text-canvas border-[1.5px] border-ink rounded-button px-7 py-2.5 text-[15px] font-medium tracking-[-0.01em] no-underline transition-all duration-300 hover:bg-charcoal"
              >
                查看全部相册 →
              </Link>
            </div>
          )}
        </section>
      )}

      {/* Gallery */}
      <section className="px-6 pb-24" id="gallery">
        <div className="bg-lifted px-6 md:px-12 py-16 md:py-24">
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
                href="/photos"
                className="inline-flex items-center gap-2 bg-ink text-canvas border-[1.5px] border-ink rounded-button px-7 py-2.5 text-[15px] font-medium tracking-[-0.01em] no-underline transition-all duration-300 hover:bg-charcoal"
              >
                查看全部作品 →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Stories — Editorial Grid */}
      {featuredStories.length > 0 && (
        <section className="py-24 md:py-32 px-6 relative overflow-hidden">
          <div className="absolute top-4 right-0 text-[clamp(80px,14vw,180px)] font-medium tracking-[-0.02em] text-ghost leading-none pointer-events-none select-none">
            Stories
          </div>
          <div className="max-w-[1320px] mx-auto relative">
            <Reveal>
              <div className="pb-6 border-b border-[rgba(0,0,0,0.08)] mb-11">
                <div className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.04em] text-slate mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-light-signal" />
                  影像故事
                </div>
                <h2 className="text-[clamp(28px,4vw,48px)] font-medium tracking-[-0.02em] leading-[1.1] text-center">
                  镜头背后的叙事
                </h2>
              </div>
            </Reveal>
            <div className="story-grid">
              {featuredStories.map((story, i) => (
                <Reveal key={story.id} delay={i * 80}>
                  <StoryCard story={story} />
                </Reveal>
              ))}
            </div>
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
