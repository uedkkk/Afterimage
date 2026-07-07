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
  const decodedSlug = decodeURIComponent(slug);
  const category = await getCategoryBySlug(decodedSlug);

  if (!category) notFound();

  const albums = await getAlbumsByCategory(category.id);

  return (
    <div className="px-6 md:px-12 py-12">
      <Reveal>
        <header className="mb-12 pb-8 border-b border-ink">
          <div className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.04em] text-slate mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-light-signal" />
            Category
          </div>
          <h1 className="text-[clamp(28px,4vw,48px)] font-medium tracking-[-0.02em]">
            {category.name}
          </h1>
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
