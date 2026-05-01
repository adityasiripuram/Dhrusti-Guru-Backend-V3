import sharp from "sharp";
import path from "path";

interface CompressOptions {
  imageQuality?: number;
  imageMaxWidth?: number;
  imageMaxHeight?: number;
  imageFormat?: string;
}

interface CompressResult {
  buffer: Buffer;
  mimeType: string;
  ext: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: string;
  skipped?: boolean;
}

const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/tiff",
  "image/gif",
]);

const FORMAT_MAP: Record<string, string> = {
  jpeg: "jpeg",
  jpg: "jpeg",
  png: "png",
  webp: "webp",
  avif: "avif",
};

/**
 * Compress a file buffer based on its MIME type.
 */
export async function compressFile(
  buffer: Buffer,
  mimeType: string,
  filename: string,
  opts: CompressOptions = {},
): Promise<CompressResult> {
  const originalSize = buffer.byteLength;

  if (IMAGE_MIME_TYPES.has(mimeType)) {
    return compressImage(buffer, mimeType, filename, opts, originalSize);
  }

  // Non-image: return as-is (add video/pdf compression here if needed)
  return {
    buffer,
    mimeType,
    ext: path.extname(filename).replace(".", "") || "bin",
    originalSize,
    compressedSize: originalSize,
    compressionRatio: "0%",
    skipped: true,
  };
}

async function compressImage(
  buffer: Buffer,
  mimeType: string,
  filename: string,
  opts: CompressOptions,
  originalSize: number,
): Promise<CompressResult> {
  const {
    imageQuality = parseInt(process.env.IMAGE_QUALITY || "80", 10),
    imageMaxWidth = parseInt(process.env.IMAGE_MAX_WIDTH || "0", 10),
    imageMaxHeight = parseInt(process.env.IMAGE_MAX_HEIGHT || "0", 10),
    imageFormat = process.env.IMAGE_FORMAT || "webp",
  } = opts;

  // Resolve output format
  const targetFormat =
    imageFormat === "original"
      ? resolveOriginalFormat(mimeType)
      : FORMAT_MAP[imageFormat] || "webp";

  let pipeline = sharp(buffer);

  // Resize only if limits are set and image exceeds them
  if (imageMaxWidth > 0 || imageMaxHeight > 0) {
    pipeline = pipeline.resize({
      width: imageMaxWidth > 0 ? imageMaxWidth : undefined,
      height: imageMaxHeight > 0 ? imageMaxHeight : undefined,
      fit: "inside", // maintains aspect ratio, never upscales
      withoutEnlargement: true,
    });
  }

  // Format + quality
  pipeline = applyFormatOptions(pipeline, targetFormat, imageQuality);

  const compressedBuffer = await pipeline.toBuffer();
  const compressedSize = compressedBuffer.byteLength;

  const ratio =
    originalSize > 0
      ? `${Math.round((1 - compressedSize / originalSize) * 100)}%`
      : "0%";

  return {
    buffer: compressedBuffer,
    mimeType: `image/${targetFormat}`,
    ext: targetFormat === "jpeg" ? "jpg" : targetFormat,
    originalSize,
    compressedSize,
    compressionRatio: ratio,
    skipped: false,
  };
}

function applyFormatOptions(
  pipeline: sharp.Sharp,
  format: string,
  quality: number,
): sharp.Sharp {
  switch (format) {
    case "jpeg":
      return pipeline.jpeg({ quality, mozjpeg: true });
    case "png":
      return pipeline.png({ quality, compressionLevel: 9 });
    case "webp":
      return pipeline.webp({ quality, effort: 4 });
    case "avif":
      return pipeline.avif({ quality, effort: 4 });
    default:
      return pipeline.webp({ quality });
  }
}

function resolveOriginalFormat(mimeType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpeg",
    "image/jpg": "jpeg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
    "image/gif": "webp", // GIF → WebP (animated support via sharp)
    "image/tiff": "jpeg",
  };
  return map[mimeType] || "webp";
}
