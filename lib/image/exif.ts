import sharp from "sharp";

export interface ExifData {
  camera?: string;
  lens?: string;
  aperture?: string;
  shutter?: string;
  iso?: string;
  focalLength?: string;
  takenAt?: string;
}

// TODO: Replace regex-based EXIF parsing with exifr library for real EXIF data
export async function extractExif(
  filePath: string
): Promise<ExifData | null> {
  try {
    const metadata = await sharp(filePath).metadata();
    const exif = metadata.exif;
    if (!exif) return null;

    // Parse EXIF buffer — Sharp returns a Buffer with TIFF/EXIF data
    // Use sharp's metadata which parses common EXIF fields
    const data: ExifData = {};

    // sharp doesn't expose parsed EXIF directly, so we use withMetadata
    // and parse the raw EXIF buffer manually for common fields
    const str = exif.toString("latin1");

    // Simple extraction for common fields
    const makeMatch = str.match(/Make\0+(.*?)(?=\0|$)/);
    const modelMatch = str.match(/Model\0+(.*?)(?=\0|$)/);
    const lensMatch = str.match(/LensModel\0+(.*?)(?=\0|$)/);
    const fNumberMatch = str.match(/FNumber\0+(.*?)(?=\0|$)/);
    const exposureMatch = str.match(/ExposureTime\0+(.*?)(?=\0|$)/);
    const isoMatch = str.match(/ISO\0+(.*?)(?=\0|$)/);
    const focalMatch = str.match(/FocalLength\0+(.*?)(?=\0|$)/);
    const dateMatch = str.match(/DateTimeOriginal\0+(.*?)(?=\0|$)/);

    if (makeMatch && modelMatch) {
      data.camera = `${makeMatch[1].trim()} ${modelMatch[1].trim()}`.trim();
    } else if (modelMatch) {
      data.camera = modelMatch[1].trim();
    }
    if (lensMatch) data.lens = lensMatch[1].trim();
    if (fNumberMatch) data.aperture = `f/${fNumberMatch[1].trim()}`;
    if (exposureMatch) data.shutter = `${exposureMatch[1].trim()}s`;
    if (isoMatch) data.iso = isoMatch[1].trim();
    if (focalMatch) data.focalLength = focalMatch[1].trim();
    if (dateMatch) data.takenAt = dateMatch[1].trim();

    const hasData = Object.keys(data).length > 0;
    return hasData ? data : null;
  } catch {
    return null;
  }
}
