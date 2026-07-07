import { notFound } from "next/navigation";
import { getAlbumByIdAdmin, getAllCategories } from "@/lib/db/queries";
import { AlbumForm } from "../AlbumForm";
import { AlbumPhotosManager } from "./AlbumPhotosManager";

export const dynamic = "force-dynamic";

export default async function AlbumEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [result, categories] = await Promise.all([
    getAlbumByIdAdmin(id),
    getAllCategories(),
  ]);

  if (!result) notFound();

  const { album, photos } = result;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium">编辑相册</h1>
        <p className="text-dim mt-1 text-sm">{album.title}</p>
      </div>
      <AlbumForm album={album} categories={categories} />
      <div className="border-t border-faint pt-6">
        <h2 className="text-lg font-medium mb-4">照片管理</h2>
        <AlbumPhotosManager albumId={album.id} photos={photos} />
      </div>
    </div>
  );
}
