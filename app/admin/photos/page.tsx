import Link from "next/link";
import {
  getAllPhotosAdmin,
  getPhotoCountAdmin,
  getAllAlbumsAdmin,
} from "@/lib/db/queries";
import { PhotoTable } from "./PhotoTable";
import { Pagination } from "@/components/admin/Pagination";

export const dynamic = "force-dynamic";

const PER_PAGE = 30;

export default async function PhotosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10) || 1);
  const offset = (page - 1) * PER_PAGE;

  const [photos, total, albums] = await Promise.all([
    getAllPhotosAdmin(PER_PAGE, offset),
    getPhotoCountAdmin(),
    getAllAlbumsAdmin(),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium">照片管理</h1>
          <p className="text-dim mt-1 text-sm">共 {total} 张照片</p>
        </div>
        <Link
          href="/admin/upload"
          className="bg-ink text-bg px-4 py-2 rounded-md text-sm no-underline hover:bg-dim"
        >
          上传照片
        </Link>
      </div>

      <PhotoTable photos={photos} albums={albums} />

      <Pagination currentPage={page} totalPages={totalPages} basePath="/admin/photos" />
    </div>
  );
}
