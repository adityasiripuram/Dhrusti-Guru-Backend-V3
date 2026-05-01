import { getProvider } from "../storage/provider";
import { compressFile } from "../utils/compressor";

export interface CompressionOptions {
  imageQuality?: number;
  imageMaxWidth?: number;
  imageMaxHeight?: number;
  imageFormat?: string;
}

export function parseCompressionOverrides(
  query: Record<string, unknown>,
): CompressionOptions {
  const parseNumber = (value: unknown): number | undefined => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  return {
    imageQuality: parseNumber(query.quality),
    imageMaxWidth: parseNumber(query.maxWidth),
    imageMaxHeight: parseNumber(query.maxHeight),
    imageFormat: typeof query.format === "string" ? query.format : undefined,
  };
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function processAndUpload(
  file: Express.Multer.File,
  providerName: string | undefined,
  folder: string,
  compressionOpts: CompressionOptions,
) {
  const provider = getProvider(providerName);
  const compressed = await compressFile(
    file.buffer,
    file.mimetype,
    file.originalname,
    {
      imageQuality: compressionOpts.imageQuality,
      imageMaxWidth: compressionOpts.imageMaxWidth,
      imageMaxHeight: compressionOpts.imageMaxHeight,
      imageFormat: compressionOpts.imageFormat,
    },
  );

  const uploadResult = await provider.upload(
    compressed.buffer,
    file.originalname,
    compressed.mimeType,
    { folder },
  );

  return {
    ...uploadResult,
    originalName: file.originalname,
    skipped: compressed.skipped,
  };
}
