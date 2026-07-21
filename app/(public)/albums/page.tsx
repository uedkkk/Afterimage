import { getPublishedAlbums } from "@/lib/db/queries";
import { AlbumCard } from "@/components/AlbumCard";
import { Reveal } from "@/components/Reveal";

export const revalidate = 300;

export default async function AlbumsPage() {
  const albums = await getPublishedAlbums();

  return (
    <div className="max-w-[1320px] mx-auto px-6 md:px-12 py-12">
      <Reveal>
        <header className="pb-6 border-b border-[rgba(0,0,0,0.08)] mb-11">
          <div className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.04em] text-slate mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-light-signal" />
            Albums
          </div>
          <h1 className="text-[clamp(28px,4vw,48px)] font-medium tracking-[-0.02em] leading-[1.1]">
            全部影集
          </h1>
          <p className="text-[15px] text-slate mt-3">
            {albums.length} 个影集
          </p>
        </header>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {albums.map((album, index) => (
          <Reveal key={album.id} delay={index * 50}>
            <AlbumCard album={album} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
