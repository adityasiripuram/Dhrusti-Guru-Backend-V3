import express, { type Request, type Response } from "express";
import {
  getErrorMessage,
  parseCompressionOverrides,
  processAndUpload,
} from "../services/uploadService.js";
import {
  handleMulterError,
  uploadMultiple,
  uploadSingle,
} from "../middleware/upload.js";
import { getProvider } from "../storage/provider.js";

const router = express.Router();

// ─── Routes ─────────────────────────────────────────────────────────────────

/**
 * POST /upload
 * Single file upload.
 * Query params: provider, folder, quality, maxWidth, maxHeight, format
 */
router.post(
  "/",
  uploadSingle,
  handleMulterError,
  async (req: Request, res: Response) => {
    if (!req.file) {
      return res
        .status(400)
        .json({ error: 'No file provided. Use field name "file".' });
    }

    try {
      const providerName =
        typeof req.query.provider === "string" ? req.query.provider : undefined;
      const folder =
        typeof req.query.folder === "string" ? req.query.folder : "uploads";
      const compressionOpts = parseCompressionOverrides(
        req.query as Record<string, unknown>,
      );

      const result = await processAndUpload(
        req.file,
        providerName,
        folder,
        compressionOpts,
      );

      return res.status(201).json({ success: true, file: result });
    } catch (err) {
      console.error("[upload] error:", err);
      return res.status(500).json({ error: getErrorMessage(err) });
    }
  },
);

/**
 * POST /upload/batch
 * Multiple files upload (up to 20).
 * Query params: provider, folder, quality, maxWidth, maxHeight, format
 */
router.post(
  "/batch",
  uploadMultiple,
  handleMulterError,
  async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0) {
      return res
        .status(400)
        .json({ error: 'No files provided. Use field name "files".' });
    }

    const providerName =
      typeof req.query.provider === "string" ? req.query.provider : undefined;
    const folder =
      typeof req.query.folder === "string" ? req.query.folder : "uploads";
    const compressionOpts = parseCompressionOverrides(
      req.query as Record<string, unknown>,
    );

    const results = await Promise.allSettled(
      files.map((f) =>
        processAndUpload(f, providerName, folder, compressionOpts),
      ),
    );

    const responseFiles = results.map((r, i) =>
      r.status === "fulfilled"
        ? { success: true, ...r.value }
        : {
            success: false,
            originalName: files[i].originalname,
            error: getErrorMessage(r.reason),
          },
    );

    const allOk = responseFiles.every((f) => f.success);
    return res.status(allOk ? 201 : 207).json({
      success: allOk,
      total: responseFiles.length,
      uploaded: responseFiles.filter((f) => f.success).length,
      files: responseFiles,
    });
  },
);

/**
 * DELETE /upload/:fileId
 * Delete a previously uploaded file.
 * Query param: provider (to specify which provider owns the file)
 */
router.delete("/:fileId(*)", async (req: Request, res: Response) => {
  const fileId = req.params.fileId;
  if (!fileId) return res.status(400).json({ error: "fileId is required" });

  try {
    const provider = getProvider(
      typeof req.query.provider === "string" ? req.query.provider : undefined,
    );
    await provider.delete(fileId);
    return res.json({ success: true, deleted: fileId });
  } catch (err) {
    console.error("[delete] error:", err);
    return res.status(500).json({ error: getErrorMessage(err) });
  }
});

export default router;
