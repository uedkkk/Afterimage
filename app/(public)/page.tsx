import { getAllPhotos, getAllSettings } from "@/lib/db/queries";
import { PhotoGrid } from "@/components/PhotoGrid";
import { Reveal } from "@/components/Reveal";

export const revalidate = 300;

export default async function Home() {
  const [photos, settings] = await Promise.all([
    getAllPhotos(7, 0),
    getAllSettings(),
  ]);

  const description = settings["site.description"] ?? "摄影作品展示与管理系统";
  const heroTitle = settings["site.hero_title"] ?? "光影的";
  const heroSubtitle = settings["site.hero_subtitle"] ?? "残像";

  return (
    <>
      {/* Hero — compact text intro */}
      <section className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] items-end gap-8 md:gap-28 px-4 md:px-14 pt-14 pb-14">
        <div>
          <h1 className="font-display text-[clamp(40px,6vw,84px)] font-bold leading-[0.92] tracking-tight">
            {heroTitle}
            <br />
            <em className="font-serif italic font-normal text-accent tracking-tight">
              {heroSubtitle}
            </em>
          </h1>
        </div>
        <div className="flex flex-col gap-7 pb-2">
          <p className="font-serif text-[17px] italic text-dim leading-relaxed">
            {description}
          </p>
        </div>
      </section>

      {/* Gallery */}
      <section className="px-4 md:px-14 pb-14" id="gallery">
        <Reveal>
          <div className="flex justify-between items-end mb-14">
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
