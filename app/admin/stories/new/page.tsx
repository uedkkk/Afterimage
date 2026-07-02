import { getAllAlbumsAdmin, getAllPhotosAdmin } from "@/lib/db/queries";
import { StoryForm } from "../StoryForm";

export const dynamic = "force-dynamic";

export default async function NewStoryPage() {
  const [albums, photos] = await Promise.all([
    getAllAlbumsAdmin(),
    getAllPhotosAdmin(100, 0),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">新建故事</h1>
        <p className="text-dim mt-1 text-sm">写一篇新的摄影故事</p>
      </div>
      <StoryForm albums={albums} photos={photos} />
    </div>
  );
}
