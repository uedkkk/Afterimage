import { getAllCategories } from "@/lib/db/queries";
import { AlbumForm } from "../AlbumForm";

export const dynamic = "force-dynamic";

export default async function NewAlbumPage() {
  const categories = await getAllCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium">新建相册</h1>
        <p className="text-dim mt-1 text-sm">创建一个新的相册</p>
      </div>
      <AlbumForm categories={categories} />
    </div>
  );
}
