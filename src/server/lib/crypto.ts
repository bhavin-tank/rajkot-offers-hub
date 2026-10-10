import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";

/** Secret for signing tokens and hashing one-time codes. Required in production. */
export function authSecret() {
  const secret = process.env.AUTH_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET must be set to at least 32 characters");
  return "development-only-secret-change-me-0123456789";
}

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function hmac(value: string) {
  return createHmac("sha256", authSecret()).update(value).digest("hex");
}

/** Constant-time comparison of two hex digests. */
export function sameDigest(a: string, b: string) {
  const left = Buffer.from(a, "hex");
  const right = Buffer.from(b, "hex");
  return left.length === right.length && timingSafeEqual(left, right);
}

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

/** Six digits, leading zeros allowed. */
export function randomCode() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}
