import { collections } from "./models";

/** Creates every index the services rely on. Safe to run again: existing indexes are left alone. */
export async function ensureIndexes() {
  const db = await collections();
  const { areas, categories, businesses, offers } = db;
  await Promise.all([
    areas.createIndex({ slug: 1 }, { unique: true }),
    categories.createIndex({ slug: 1 }, { unique: true }),
    businesses.createIndex({ slug: 1 }, { unique: true }),
    businesses.createIndex({ areaSlug: 1, categorySlug: 1 }),
    businesses.createIndex({ ownerIds: 1 }),
    businesses.createIndex({ geo: "2dsphere" }),
    offers.createIndex({ slug: 1 }, { unique: true }),
    offers.createIndex({ status: 1, validTo: 1 }),
    offers.createIndex({ status: 1, categorySlug: 1, areaSlug: 1, validTo: 1 }),
    offers.createIndex({ status: 1, createdAt: -1 }),
    offers.createIndex({ businessId: 1 }),
    db.users.createIndex({ mobile: 1 }, { unique: true }),
    db.users.createIndex({ role: 1 }),
    db.otpCodes.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.otpCodes.createIndex({ mobile: 1, createdAt: -1 }),
    db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.sessions.createIndex({ userId: 1 }),
    db.submissions.createIndex({ status: 1, createdAt: -1 }),
    db.submissions.createIndex({ mobile: 1 }),
    db.contactMessages.createIndex({ status: 1, createdAt: -1 }),
    db.reports.createIndex({ status: 1, createdAt: -1 }),
    db.reports.createIndex({ offerId: 1 }),
    db.media.createIndex({ status: 1, createdAt: 1 }),
    db.auditLogs.createIndex({ entity: 1, entityId: 1, createdAt: -1 }),
    db.auditLogs.createIndex({ createdAt: -1 }),
    db.rateLimits.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
  ]);
}
