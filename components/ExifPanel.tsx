import type { ExifData } from "@/lib/image/exif";

interface ExifPanelProps {
  exif: ExifData | Record<string, unknown> | null;
}

const EXIF_LABELS: Record<string, string> = {
  camera: "相机",
  lens: "镜头",
  aperture: "光圈",
  shutter: "快门",
  iso: "ISO",
  focalLength: "焦距",
  takenAt: "拍摄时间",
};

export function ExifPanel({ exif }: ExifPanelProps) {
  if (!exif || Object.keys(exif).length === 0) return null;

  return (
    <div className="border-t border-faint pt-7 mt-7">
      <h3 className="text-[11px] font-medium uppercase tracking-widest text-dim mb-4">
        EXIF 信息
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {Object.entries(exif).map(([key, value]) => (
          <div key={key}>
            <div className="text-[11px] uppercase tracking-wider text-dim mb-0.5">
              {EXIF_LABELS[key] ?? key}
            </div>
            <div className="text-sm font-medium">{String(value)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
