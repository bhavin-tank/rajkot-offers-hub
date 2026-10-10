import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { hmac, sameDigest } from "./crypto";

/**
 * Where uploaded photos live. Browsers upload straight to storage with a
 * short-lived signed PUT URL, so photo bytes never pass through our server.
 *
 * - Cloudflare R2 (S3 API) when the R2_* variables are set.
 * - Otherwise, in development only, a folder on disk (.data/uploads) served by
 *   /api/v1/uploads/local (PUT) and /api/v1/media (GET).
 */

const UPLOAD_URL_TTL = 5 * 60;

export interface SignedUpload {
  url: string;
  headers: Record<string, string>;
}

interface StorageDriver {
  presignPut(key: string, mime: string, bytes: number): Promise<SignedUpload>;
  publicUrl(key: string): string;
  /** Size of the stored object, or null when nothing was uploaded. */
  size(key: string): Promise<number | null>;
}

function r2Driver(): StorageDriver | null {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, MEDIA_PUBLIC_URL } = process.env;
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET || !MEDIA_PUBLIC_URL) return null;
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
  });
  const base = MEDIA_PUBLIC_URL.replace(/\/+$/, "");
  return {
    async presignPut(key, mime, bytes) {
      // Content type and length are signed, so the upload must match what was declared.
      const command = new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, ContentType: mime, ContentLength: bytes });
      return { url: await getSignedUrl(client, command, { expiresIn: UPLOAD_URL_TTL }), headers: { "Content-Type": mime } };
    },
    publicUrl: (key) => `${base}/${key}`,
    async size(key) {
      try {
        const head = await client.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }));
        return head.ContentLength ?? 0;
      } catch (error) {
        if ((error as { name?: string }).name === "NotFound") return null;
        throw error;
      }
    },
  };
}

export const LOCAL_UPLOAD_DIR = path.join(process.cwd(), ".data", "uploads");

function localPath(key: string) {
  const file = path.resolve(LOCAL_UPLOAD_DIR, key);
  if (!file.startsWith(LOCAL_UPLOAD_DIR + path.sep)) throw new Error("Invalid upload key");
  return file;
}

function localSignature(key: string, mime: string, bytes: number, expires: number) {
  return hmac(`upload:${key}:${mime}:${bytes}:${expires}`);
}

const localDriver: StorageDriver = {
  async presignPut(key, mime, bytes) {
    const expires = Math.floor(Date.now() / 1000) + UPLOAD_URL_TTL;
    const query = new URLSearchParams({ mime, bytes: String(bytes), expires: String(expires), sig: localSignature(key, mime, bytes, expires) });
    return { url: `/api/v1/uploads/local/${key}?${query}`, headers: { "Content-Type": mime } };
  },
  publicUrl: (key) => `/api/v1/media/${key}`,
  async size(key) {
    try {
      return (await stat(localPath(key))).size;
    } catch {
      return null;
    }
  },
};

let driver: StorageDriver | undefined;

function storage(): StorageDriver {
  driver ??= r2Driver() ?? undefined;
  if (driver) return driver;
  if (process.env.NODE_ENV === "production" && process.env.STORAGE_DRIVER !== "local") {
    throw new Error("Photo storage is not configured: set the R2_* variables and MEDIA_PUBLIC_URL");
  }
  return localDriver;
}

export const presignUpload = (key: string, mime: string, bytes: number) => storage().presignPut(key, mime, bytes);
export const publicUrl = (key: string) => storage().publicUrl(key);
export const storedSize = (key: string) => storage().size(key);

export function isLocalStorage() {
  return storage() === localDriver;
}

/** Saves a development upload after checking the signed URL it was sent to. */
export async function writeLocalUpload(key: string, params: URLSearchParams, contentType: string | null, body: ArrayBuffer) {
  const mime = params.get("mime") ?? "";
  const bytes = Number(params.get("bytes"));
  const expires = Number(params.get("expires"));
  const sig = params.get("sig") ?? "";
  if (!isLocalStorage()) return "Local uploads are disabled";
  if (!sig || !sameDigest(localSignature(key, mime, bytes, expires), sig)) return "Bad signature";
  if (expires < Date.now() / 1000) return "Upload link expired";
  if (contentType !== mime || body.byteLength !== bytes) return "File does not match the upload request";
  const file = localPath(key);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, Buffer.from(body));
  return null;
}

export async function readLocalUpload(key: string) {
  if (!isLocalStorage()) return null;
  try {
    return await readFile(localPath(key));
  } catch {
    return null;
  }
}
