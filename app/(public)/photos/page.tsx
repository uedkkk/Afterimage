import { getAllPhotos, getPhotoCount } from "@/lib/db/queries";
import { PhotoCard } from "@/components/PhotoCard";
import { Reveal } from "@/components/Reveal";
import { Pagination } from "@/components/admin/Pagination";

export const revalidate = 300;

const PHOTOS_PER_PAGE = 21;

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function PhotosPage({ searchParams }: PageProps) {
  const { page: pageStr } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageStr ?? "1", 10) || 1);
  const offset = (currentPage - 1) * PHOTOS_PER_PAGE;

  const [photos, totalCount] = await Promise.all([
    getAllPhotos(PHOTOS_PER_PAGE, offset),
    getPhotoCount(),
  ]);

  const totalPages = Math.ceil(totalCount / PHOTOS_PER_PAGE);

  return (
    <div className="max-w-[1320px] mx-auto px-6 md:px-12 py-12">
      <Reveal>
        <header className="pb-6 border-b border-[rgba(0,0,0,0.08)] mb-11">
          <div className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.04em] text-slate mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-light-signal" />
            Photographs
          </div>
          <h1 className="text-[clamp(28px,4vw,48px)] font-medium tracking-[-0.02em] leading-[1.1]">
            全部作品
          </h1>
          <p className="text-[15px] text-slate mt-3">
            {totalCount} 张照片
          </p>
        </header>
      </Reveal>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {photos.map((photo, index) => (
          <Reveal key={photo.id} delay={index * 30} className="aspect-[4/5]">
            <PhotoCard photo={photo} index={index} />
          </Reveal>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-12">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath="/photos"
          />
        </div>
      )}
    </div>
  );
}
