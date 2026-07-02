import { notFound } from "next/navigation";
import {
  getStoryByIdAdmin,
  getAllAlbumsAdmin,
  getAllPhotosAdmin,
} from "@/lib/db/queries";
import { StoryForm } from "../StoryForm";

export const dynamic = "force-dynamic";

export default async function StoryEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [story, albums, photos] = await Promise.all([
    getStoryByIdAdmin(id),
    getAllAlbumsAdmin(),
    getAllPhotosAdmin(100, 0),
  ]);

  if (!story) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">编辑故事</h1>
        <p className="text-dim mt-1 text-sm">{story.title}</p>
      </div>
      <StoryForm story={story} albums={albums} photos={photos} />
    </div>
  );
}
