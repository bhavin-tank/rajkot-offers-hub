import { collections } from "./models";

/** Creates every index the services rely on. Safe to run again: existing indexes are left alone. */
export async function ensureIndexes() {
  const { areas, categories, businesses, offers } = await collections();
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
  ]);
}
