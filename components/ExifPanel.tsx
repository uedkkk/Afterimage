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
    <div className="bg-lifted rounded-stadium p-6 md:p-8 mt-8">
      <h3 className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.04em] text-slate mb-5">
        <span className="w-1.5 h-1.5 rounded-full bg-light-signal" />
        EXIF 信息
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
        {Object.entries(exif).map(([key, value]) => (
          <div key={key}>
            <div className="text-[12px] uppercase tracking-wider text-slate mb-0.5">
              {EXIF_LABELS[key] ?? key}
            </div>
            <div className="text-[15px] font-medium">{String(value)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
