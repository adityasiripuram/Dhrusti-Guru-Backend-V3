import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import { BaseProvider, UploadResult } from "./base.storage";

export class CloudinaryProvider extends BaseProvider {
  constructor() {
    super("cloudinary");

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error(
        "Cloudinary: missing CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET",
      );
    }
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }

  async upload(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    options: Record<string, unknown> = {},
  ): Promise<UploadResult> {
    const folder = (options.folder as string) || "uploads";
    const publicId = (options.publicId as string) || undefined;
    const resourceType = mimeType.startsWith("image/")
      ? "image"
      : mimeType.startsWith("video/")
        ? "video"
        : "raw";

    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
          resource_type: resourceType,
          overwrite: true,
        },
        (err: unknown, res: unknown) => (err ? reject(err) : resolve(res)),
      );
      Readable.from(buffer).pipe(uploadStream);
    });

    return {
      url: result.secure_url,
      fileId: result.public_id,
      provider: this.name,
      size: result.bytes,
      filename: result.public_id,
    };
  }

  async delete(fileId: string): Promise<void> {
    await cloudinary.uploader.destroy(fileId);
  }
}
