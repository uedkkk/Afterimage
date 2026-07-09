import { notFound } from "next/navigation";
import { getPhotoByIdAdmin, getAllAlbumsAdmin } from "@/lib/db/queries";
import { PhotoEditForm } from "../PhotoEditForm";

export const dynamic = "force-dynamic";

export default async function PhotoEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [photo, albums] = await Promise.all([
    getPhotoByIdAdmin(id),
    getAllAlbumsAdmin(),
  ]);

  if (!photo) notFound();

  const exifEntries = photo.exif
    ? Object.entries(photo.exif).filter(([, v]) => v != null)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium">编辑照片</h1>
        <p className="text-dim mt-1 text-sm">{photo.filename}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="rounded-lg border border-faint bg-paper p-4">
            {photo.filePath && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo.filePath}
                alt={photo.title || photo.filename}
                className="w-full rounded-md"
              />
            )}
          </div>
          {exifEntries.length > 0 && (
            <div className="rounded-lg border border-faint bg-paper p-4">
              <h2 className="text-sm font-medium text-ink mb-3">EXIF 信息</h2>
              <dl className="space-y-1">
                {exifEntries.map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <dt className="text-dim">{key}</dt>
                    <dd className="text-ink">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>

        <PhotoEditForm photo={photo} albums={albums} />
      </div>
    </div>
  );
}
