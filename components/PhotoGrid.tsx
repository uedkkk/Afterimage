import type { PhotoWithTags } from "@/lib/db/queries";
import { PhotoCard } from "./PhotoCard";
import { Reveal } from "./Reveal";

interface PhotoGridProps {
  photos: PhotoWithTags[];
}

export function PhotoGrid({ photos }: PhotoGridProps) {
  return (
    <div className="grid grid-cols-12 gap-3.5">
      {photos.map((photo, index) => (
        <Reveal key={photo.id} delay={index * 50}>
          <PhotoCard photo={photo} index={index} />
        </Reveal>
      ))}
    </div>
  );
}
