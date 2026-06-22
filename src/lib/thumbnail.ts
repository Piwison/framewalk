/**
 * Generate a small thumbnail entirely on-device (FR-7). The original photo is
 * never copied or uploaded; we decode it, draw a downscaled copy to a canvas,
 * and keep only the resulting small blob. iOS may hand us HEIC — createImageBitmap
 * decodes it on modern iOS; we always re-encode to JPEG for a portable thumbnail.
 */

const MAX_EDGE = 1080; // longest side of the stored thumbnail
const JPEG_QUALITY = 0.82;

export async function makeThumbnail(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable.");
    ctx.drawImage(bitmap, 0, 0, w, h);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) =>
          blob ? resolve(blob) : reject(new Error("Thumbnail encoding failed.")),
        "image/jpeg",
        JPEG_QUALITY,
      );
    });
  } finally {
    bitmap.close();
  }
}
