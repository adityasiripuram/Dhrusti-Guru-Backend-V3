// src/storage/base.storage.ts

export interface UploadResult {
  url: string;
  fileId: string;
  provider: string;
  size: number;
  filename: string;
}

/**
 * All providers must implement this interface.
 *
 * upload(buffer, filename, mimeType, options) → Promise<UploadResult>
 * delete(fileId)                              → Promise<void>
 */
export class BaseProvider {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  async upload(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    options: Record<string, unknown> = {},
  ): Promise<UploadResult> {
    throw new Error(`${this.name}: upload() not implemented`);
  }

  async delete(fileId: string): Promise<void> {
    throw new Error(`${this.name}: delete() not implemented`);
  }
}
