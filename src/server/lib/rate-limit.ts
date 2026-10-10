import { collections } from "../db/models";
import { AppError } from "./errors";

/**
 * Fixed-window counters kept in MongoDB (expired by a TTL index), so limits
 * hold across server instances without another service. Swap for Redis if
 * request volume makes this a hot collection.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number) {
  const window = Math.floor(Date.now() / 1000 / windowSeconds);
  const expiresAt = new Date((window + 1) * windowSeconds * 1000);
  const { rateLimits } = await collections();
  const doc = await rateLimits.findOneAndUpdate(
    { _id: `${key}:${window}` },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
    { upsert: true, returnDocument: "after" },
  );
  if ((doc?.count ?? 0) > limit) {
    const retryAfter = Math.max(1, Math.ceil((expiresAt.getTime() - Date.now()) / 1000));
    throw new AppError("RATE_LIMITED", "Too many requests, please try again later", { retryAfter });
  }
}

/** The limits from the API spec, in one place. */
export const LIMITS = {
  otpPerMobile: [3, 15 * 60],
  otpPerIp: [10, 60 * 60],
  formsPerIp: [5, 10 * 60],
  uploadsPerIp: [30, 10 * 60],
  reportPerOfferPerIp: [1, 24 * 60 * 60],
} as const satisfies Record<string, readonly [number, number]>;
