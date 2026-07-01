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
    <div className="px-4 md:px-14 py-14">
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
