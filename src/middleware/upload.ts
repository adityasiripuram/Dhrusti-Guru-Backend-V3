// src/middleware/upload.js
import type { NextFunction, Request, Response } from "express";
import multer, { MulterError } from "multer";

// Store in memory so we can compress before sending to provider
const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES: Set<string> = new Set([
  // Images
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/tiff",
  "image/svg+xml",
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  // Video
  "video/mp4",
  "video/webm",
  "video/mpeg",
  "video/quicktime",
  // Audio
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
  // Archives
  "application/zip",
  "application/x-tar",
  "application/gzip",
]);

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || "52428800", 10); // 50 MB default

interface MulterErrorMessages {
  [code: string]: string;
}

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: any,
): void => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type "${file.mimetype}" is not allowed`), false);
  }
};

export const uploadSingle = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
}).single("file");

export const uploadMultiple = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
}).array("files", 20);

/** Express error handler wrapper for multer */
export function handleMulterError(
  err: Error | MulterError | null,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (err instanceof MulterError) {
    const messages: MulterErrorMessages = {
      LIMIT_FILE_SIZE: `File too large. Max allowed: ${MAX_FILE_SIZE / 1024 / 1024} MB`,
      LIMIT_FILE_COUNT: "Too many files. Max 20 per request.",
      LIMIT_UNEXPECTED_FILE: 'Unexpected field name. Use "file" or "files".',
    };
    res.status(413).json({
      error: messages[err.code as keyof typeof messages] || err.message,
    });
    return;
  }
  if (err) {
    res.status(400).json({ error: err.message });
    return;
  }
  next();
}
