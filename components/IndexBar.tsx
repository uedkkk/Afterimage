import { getAllPhotos, getPublishedAlbums, getAllSettings } from "@/lib/db/queries";

export async function IndexBar() {
  const [albums, photos, settings] = await Promise.all([
    getPublishedAlbums(),
    getAllPhotos(9999, 0),
    getAllSettings(),
  ]);

  const title = settings["site.title"] ?? "Afterimage";

  return (
    <div className="flex border-b border-line text-[11px] font-medium uppercase tracking-wider">
      <div className="px-5 py-2 border-r border-faint flex items-center gap-1.5 first:pl-14">
        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
        {title}
      </div>
      <div className="px-5 py-2 border-r border-faint">
        {photos.length} Works · {albums.length} Albums
      </div>
      <div className="px-5 py-2 ml-auto">
        Travel · Street · Portrait
      </div>
    </div>
  );
}
