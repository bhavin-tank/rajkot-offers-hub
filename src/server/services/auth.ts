import { jwtVerify, SignJWT } from "jose";
import { ObjectId } from "mongodb";
import { collections, type Role, type UserDoc } from "../db/models";
import { authSecret, hmac, randomCode, randomToken, sameDigest, sha256 } from "../lib/crypto";
import { AppError } from "../lib/errors";
import { normalizeMobile } from "../lib/mobile";
import { LIMITS, rateLimit } from "../lib/rate-limit";
import { sendOtpMessage } from "../lib/whatsapp";

/**
 * Sign-in with a one-time code sent on WhatsApp, then a short-lived JWT access
 * token plus a rotating refresh token (`<sessionId>.<secret>`). Only a hash of
 * each secret is stored.
 */

export const ACCESS_TTL = Number(process.env.ACCESS_TOKEN_TTL) || 15 * 60;
export const REFRESH_TTL = Number(process.env.REFRESH_TOKEN_TTL) || 30 * 24 * 60 * 60;
const OTP_TTL = 5 * 60;
const OTP_MAX_ATTEMPTS = 5;
const RESEND_AFTER = 30;
/** A refresh token replaced less than this long ago still works once: parallel requests race to refresh. */
const ROTATION_GRACE_MS = 60_000;

export const ADMIN_ROLES: Role[] = ["admin", "superadmin"];

export interface RequestMeta {
  ip: string;
  userAgent: string;
}

export interface AuthUser {
  id: string;
  mobile: string;
  name?: string;
  role: Role;
}

export interface Tokens {
  accessToken: string;
  /** Null when an old-but-recent refresh token was used: keep the newer one the client already has. */
  refreshToken: string | null;
  accessExpiresIn: number;
  refreshExpiresIn: number;
}

export function toAuthUser(user: UserDoc): AuthUser {
  return { id: user._id!.toHexString(), mobile: user.mobile, ...(user.name && { name: user.name }), role: user.role };
}

const key = () => new TextEncoder().encode(authSecret());

async function signAccessToken(user: UserDoc, sessionId: ObjectId) {
  return new SignJWT({ role: user.role, sid: sessionId.toHexString() })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user._id!.toHexString())
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TTL}s`)
    .sign(key());
}

/** The token's claims, or null when it is missing, forged or expired. */
export async function verifyAccessToken(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify<{ role: Role; sid: string }>(token, key(), { algorithms: ["HS256"] });
    return payload.sub ? { userId: payload.sub, role: payload.role, sessionId: payload.sid } : null;
  } catch {
    return null;
  }
}

/** The active user behind an access token, or null. Reads the user so blocks and role changes apply at once. */
export async function userForAccessToken(token: string | undefined): Promise<AuthUser | null> {
  const claims = await verifyAccessToken(token);
  if (!claims || !ObjectId.isValid(claims.userId)) return null;
  const { users } = await collections();
  const user = await users.findOne({ _id: new ObjectId(claims.userId) });
  return user && user.status === "active" ? toAuthUser(user) : null;
}

const otpHash = (requestId: ObjectId, code: string) => hmac(`${requestId.toHexString()}:${code}`);

/**
 * Sends a sign-in code on WhatsApp. With `roles`, only existing users with one of
 * those roles get a code; anyone else gets the same answer and no message, so the
 * endpoint does not reveal who has access.
 */
export async function requestOtp(rawMobile: string, meta: RequestMeta, options: { roles?: Role[] } = {}) {
  const mobile = normalizeMobile(rawMobile);
  if (!mobile) {
    throw new AppError("VALIDATION_FAILED", "Enter a valid mobile number", { fields: { mobile: "Enter a valid mobile number" } });
  }
  await rateLimit(`otp:mobile:${mobile}`, ...LIMITS.otpPerMobile);
  await rateLimit(`otp:ip:${meta.ip}`, ...LIMITS.otpPerIp);

  const db = await collections();
  const last = await db.otpCodes.findOne({ mobile }, { sort: { createdAt: -1 } });
  const wait = last ? RESEND_AFTER - Math.floor((Date.now() - last.createdAt.getTime()) / 1000) : 0;
  if (wait > 0) throw new AppError("RATE_LIMITED", `Wait ${wait} seconds before asking for a new code`, { retryAfter: wait });

  const answer = { expiresIn: OTP_TTL, resendIn: RESEND_AFTER };
  const user = await db.users.findOne({ mobile });
  const allowed = user ? user.status === "active" && (!options.roles || options.roles.includes(user.role)) : !options.roles;
  if (!allowed) return { requestId: new ObjectId().toHexString(), ...answer };

  const requestId = new ObjectId();
  const code = randomCode();
  const now = new Date();
  await db.otpCodes.insertOne({
    _id: requestId,
    mobile,
    codeHash: otpHash(requestId, code),
    attempts: 0,
    ip: meta.ip,
    createdAt: now,
    expiresAt: new Date(now.getTime() + OTP_TTL * 1000),
  });
  try {
    await sendOtpMessage(mobile, code);
  } catch (error) {
    await db.otpCodes.deleteOne({ _id: requestId });
    throw error;
  }
  return { requestId: requestId.toHexString(), ...answer };
}

/** Checks a code and opens a session. With `roles`, only existing users with one of those roles may sign in. */
export async function verifyOtp(requestId: string, code: string, meta: RequestMeta, options: { roles?: Role[] } = {}) {
  const expired = new AppError("OTP_EXPIRED", "This code has expired. Ask for a new one.");
  if (!ObjectId.isValid(requestId) || !/^\d{6}$/.test(code)) throw new AppError("OTP_INVALID", "That code is not right");

  const db = await collections();
  const id = new ObjectId(requestId);
  const otp = await db.otpCodes.findOne({ _id: id });
  if (!otp || otp.usedAt || otp.expiresAt < new Date() || otp.attempts >= OTP_MAX_ATTEMPTS) throw expired;

  if (!sameDigest(otpHash(id, code), otp.codeHash)) {
    const attempts = otp.attempts + 1;
    await db.otpCodes.updateOne({ _id: id }, { $set: { attempts } });
    const attemptsLeft = OTP_MAX_ATTEMPTS - attempts;
    if (attemptsLeft <= 0) throw expired;
    throw new AppError("OTP_INVALID", "That code is not right", { attemptsLeft });
  }
  // Claim the code atomically so two requests can't both use it.
  const claimed = await db.otpCodes.findOneAndUpdate({ _id: id, usedAt: { $exists: false } }, { $set: { usedAt: new Date() } });
  if (!claimed) throw expired;

  let user = await db.users.findOne({ mobile: otp.mobile });
  const isNewUser = !user;
  if (!user) {
    if (options.roles) throw new AppError("FORBIDDEN", "This number has no access");
    const now = new Date();
    const doc: UserDoc = { mobile: otp.mobile, role: "user", businessIds: [], locale: "en", status: "active", createdAt: now, updatedAt: now };
    const { insertedId } = await db.users.insertOne(doc);
    user = { ...doc, _id: insertedId };
  }
  if (user.status === "blocked") throw new AppError("ACCOUNT_BLOCKED", "This account is blocked");
  if (options.roles && !options.roles.includes(user.role)) throw new AppError("FORBIDDEN", "This number has no access");

  await db.users.updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date() } });
  const tokens = await createSession(user, meta);
  return { ...tokens, user: toAuthUser(user), isNewUser };
}

async function createSession(user: UserDoc, meta: RequestMeta): Promise<Tokens> {
  const { sessions } = await collections();
  const secret = randomToken();
  const now = new Date();
  const { insertedId } = await sessions.insertOne({
    userId: user._id!,
    refreshTokenHash: sha256(secret),
    userAgent: meta.userAgent.slice(0, 300),
    ip: meta.ip,
    createdAt: now,
    lastUsedAt: now,
    expiresAt: new Date(now.getTime() + REFRESH_TTL * 1000),
  });
  return {
    accessToken: await signAccessToken(user, insertedId),
    refreshToken: `${insertedId.toHexString()}.${secret}`,
    accessExpiresIn: ACCESS_TTL,
    refreshExpiresIn: REFRESH_TTL,
  };
}

function parseRefreshToken(token: string | undefined) {
  const [id, secret] = token?.split(".") ?? [];
  return id && secret && ObjectId.isValid(id) ? { sessionId: new ObjectId(id), secret } : null;
}

/**
 * Swaps a refresh token for a new pair. Presenting a replaced token after the
 * grace period means it was copied, so the whole session is revoked.
 */
export async function refreshSession(refreshToken: string | undefined): Promise<Tokens & { user: AuthUser }> {
  const unauthenticated = new AppError("UNAUTHENTICATED", "Please sign in again");
  const parsed = parseRefreshToken(refreshToken);
  if (!parsed) throw unauthenticated;

  const db = await collections();
  const session = await db.sessions.findOne({ _id: parsed.sessionId });
  if (!session || session.revokedAt || session.expiresAt < new Date()) throw unauthenticated;

  const hash = sha256(parsed.secret);
  const isCurrent = sameDigest(hash, session.refreshTokenHash);
  const isRecentPrevious =
    !isCurrent &&
    session.previousRefreshTokenHash !== undefined &&
    sameDigest(hash, session.previousRefreshTokenHash) &&
    Date.now() - (session.rotatedAt?.getTime() ?? 0) < ROTATION_GRACE_MS;
  if (!isCurrent && !isRecentPrevious) {
    await db.sessions.updateOne({ _id: session._id }, { $set: { revokedAt: new Date() } });
    throw unauthenticated;
  }

  const user = await db.users.findOne({ _id: session.userId });
  if (!user || user.status !== "active") {
    await db.sessions.updateOne({ _id: session._id }, { $set: { revokedAt: new Date() } });
    throw user ? new AppError("ACCOUNT_BLOCKED", "This account is blocked") : unauthenticated;
  }

  const accessToken = await signAccessToken(user, session._id);
  let nextRefresh: string | null = null;
  if (isCurrent) {
    const secret = randomToken();
    await db.sessions.updateOne(
      { _id: session._id },
      {
        $set: {
          refreshTokenHash: sha256(secret),
          previousRefreshTokenHash: session.refreshTokenHash,
          rotatedAt: new Date(),
          lastUsedAt: new Date(),
        },
      },
    );
    nextRefresh = `${session._id.toHexString()}.${secret}`;
  }
  return { accessToken, refreshToken: nextRefresh, accessExpiresIn: ACCESS_TTL, refreshExpiresIn: REFRESH_TTL, user: toAuthUser(user) };
}

/** Ends the session a refresh token belongs to. Unknown tokens are ignored. */
export async function revokeRefreshToken(refreshToken: string | undefined) {
  const parsed = parseRefreshToken(refreshToken);
  if (!parsed) return;
  const { sessions } = await collections();
  await sessions.updateOne({ _id: parsed.sessionId, revokedAt: { $exists: false } }, { $set: { revokedAt: new Date() } });
}

export async function revokeAllSessions(userId: ObjectId) {
  const { sessions } = await collections();
  await sessions.updateMany({ userId, revokedAt: { $exists: false } }, { $set: { revokedAt: new Date() } });
}
