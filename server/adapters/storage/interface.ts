/**
 * Storage adapter interface.
 *
 * Default implementation: `server/storage.ts` — proxies through an
 * S3-compatible storage endpoint (any S3-compatible service can be
 * exposed behind this proxy, or you can implement IStorageAdapter directly).
 *
 * To use AWS S3 directly:
 *   Install @aws-sdk/client-s3 (already in package.json) and implement
 *   IStorageAdapter using S3Client.putObject / createPresignedUrl.
 *   Set env vars: STORAGE_BUCKET, AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY.
 *
 * To use Cloudflare R2:
 *   R2 is S3-compatible — point the S3 adapter at your R2 endpoint.
 *
 * To use local filesystem (dev only):
 *   Implement IStorageAdapter with fs.writeFile / path.join(uploadsDir, key).
 */

export interface StoragePutResult {
  key: string;
  /** Public or pre-signed URL to access the uploaded object */
  url: string;
}

export interface StorageGetResult {
  key: string;
  url: string;
}

export interface IStorageAdapter {
  /**
   * Upload data at the given key.
   * @param relKey  Relative path/key (e.g. "avatars/user-123.png")
   * @param data    Raw buffer, byte array, or UTF-8 string
   * @param contentType  MIME type (default "application/octet-stream")
   */
  put(relKey: string, data: Buffer | Uint8Array | string, contentType?: string): Promise<StoragePutResult>;

  /**
   * Resolve a download URL for the given key.
   */
  get(relKey: string): Promise<StorageGetResult>;
}
