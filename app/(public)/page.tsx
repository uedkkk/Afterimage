import { getAllPhotos, getAllSettings } from "@/lib/db/queries";
import { PhotoGrid } from "@/components/PhotoGrid";
import { Reveal } from "@/components/Reveal";
import Link from "next/link";

export const revalidate = 300;

export default async function Home() {
  const [photos, settings] = await Promise.all([
    getAllPhotos(7, 0),
    getAllSettings(),
  ]);

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
