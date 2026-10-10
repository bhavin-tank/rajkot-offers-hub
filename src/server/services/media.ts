import { ObjectId } from "mongodb";
import { collections, type MediaDoc, type MediaPurpose } from "../db/models";
import { AppError } from "../lib/errors";
import { LIMITS, rateLimit } from "../lib/rate-limit";
import { presignUpload, publicUrl, storedSize } from "../lib/storage";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const IMAGE_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export interface UploadRequest {
  mime: string;
  bytes: number;
  purpose: MediaPurpose;
  ownerId?: ObjectId;
  ip: string;
}

/**
 * Reserves a media record and returns a signed URL the browser PUTs the file to.
 * The record stays `pending` until something that uses it (a submission, an
 * offer) confirms the file arrived.
 */
export async function createUpload({ mime, bytes, purpose, ownerId, ip }: UploadRequest) {
  const ext = IMAGE_TYPES[mime];
  if (!ext) throw new AppError("UNSUPPORTED_MEDIA", "Upload a JPG, PNG or WebP photo");
  if (!Number.isInteger(bytes) || bytes <= 0) throw new AppError("VALIDATION_FAILED", "File size is missing");
  if (bytes > MAX_UPLOAD_BYTES) throw new AppError("FILE_TOO_LARGE", "Photos must be 5 MB or smaller");
  await rateLimit(`upload:ip:${ip}`, ...LIMITS.uploadsPerIp);

  const id = new ObjectId();
  const now = new Date();
  const key = `${purpose}/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${id.toHexString()}.${ext}`;
  const doc: MediaDoc = { _id: id, key, url: publicUrl(key), mime, bytes, purpose, status: "pending", ...(ownerId && { ownerId }), createdAt: now };
  const { media } = await collections();
  await media.insertOne(doc);
  const upload = await presignUpload(key, mime, bytes);
  return { mediaId: id.toHexString(), url: doc.url, uploadUrl: upload.url, method: "PUT" as const, headers: upload.headers };
}

/**
 * Confirms each upload exists in storage and marks it ready. Returns the
 * records in the order given; throws when one is unknown or never uploaded.
 */
export async function claimMedia(ids: string[]): Promise<MediaDoc[]> {
  if (!ids.length) return [];
  if (!ids.every((id) => ObjectId.isValid(id))) throw new AppError("VALIDATION_FAILED", "Unknown photo");
  const objectIds = ids.map((id) => new ObjectId(id));
  const { media } = await collections();
  const docs = await media.find({ _id: { $in: objectIds } }).toArray();
  const byId = new Map(docs.map((d) => [d._id!.toHexString(), d]));

  const ordered = ids.map((id) => {
    const doc = byId.get(id);
    if (!doc) throw new AppError("VALIDATION_FAILED", "Unknown photo", { fields: { mediaIds: "Unknown photo" } });
    return doc;
  });
  for (const doc of ordered) {
    if (doc.status === "ready") continue;
    const size = await storedSize(doc.key);
    if (size === null) {
      throw new AppError("VALIDATION_FAILED", "A photo did not finish uploading. Remove it and add it again.", {
        fields: { mediaIds: "A photo did not finish uploading" },
      });
    }
  }
  await media.updateMany({ _id: { $in: objectIds } }, { $set: { status: "ready" } });
  return ordered;
}
