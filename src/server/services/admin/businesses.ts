import { ObjectId, type Filter } from "mongodb";
import { collections, type BusinessDoc, type BusinessStatus } from "../../db/models";
import { AppError, notFoundError } from "../../lib/errors";
import { cleanI18n } from "../../lib/i18n";
import { uniqueSlug } from "../../lib/slug";
import type { BusinessInput, ListQuery } from "../../validators/admin";
import { audit } from "../audit";
import type { AuthUser } from "../auth";
import { businessSnapshot, markMediaUsed } from "./offers";
import { contains, paged, toObjectId } from "./common";

/** Rajkot city centre; used until someone sets a business's real location. */
export const RAJKOT_CENTER = { lat: 22.3039, lng: 70.8022 };

export const DEFAULT_HOURS = [0, 1, 2, 3, 4, 5, 6].map((day) =>
  day === 6 ? { day, opens: "11:00", closes: "19:00" } : { day, opens: "10:00", closes: "21:00" },
);

async function checkCatalog(categorySlug: string, areaSlug: string) {
  const db = await collections();
  const [category, area] = await Promise.all([db.categories.findOne({ slug: categorySlug }), db.areas.findOne({ slug: areaSlug })]);
  const fields: Record<string, string> = {};
  if (!category) fields.categorySlug = "Unknown category";
  if (!area) fields.areaSlug = "Unknown area";
  if (Object.keys(fields).length) throw new AppError("VALIDATION_FAILED", "Check the category and area", { fields });
}

function businessFields(input: BusinessInput) {
  return {
    name: input.name,
    categorySlug: input.categorySlug,
    areaSlug: input.areaSlug,
    about: cleanI18n(input.about),
    addressLine: input.addressLine,
    postalCode: input.postalCode,
    phone: input.phone,
    whatsapp: input.whatsapp,
    instagram: input.instagram?.replace(/^@/, ""),
    website: input.website,
    hours: input.hours,
    cover: input.cover,
    photos: input.photos,
    geo: { type: "Point" as const, coordinates: [input.lng, input.lat] as [number, number] },
  };
}

export async function listBusinesses({ q, status, page, limit }: ListQuery) {
  const { businesses } = await collections();
  const query: Filter<BusinessDoc> = {};
  if (status === "active" || status === "pending" || status === "suspended") query.status = status;
  if (q) {
    const digits = q.replace(/\D/g, "");
    query.$or = [
      { name: contains(q) },
      { slug: contains(q) },
      { areaSlug: contains(q) },
      ...(digits.length >= 4 ? [{ phone: contains(digits.slice(-10)) }, { whatsapp: contains(digits.slice(-10)) }] : []),
    ];
  }
  return paged(businesses, query, { name: 1 }, page, limit);
}

/** Every business as id + name, for pickers. */
export async function businessOptions() {
  const { businesses } = await collections();
  const docs = await businesses.find({}, { projection: { name: 1, areaSlug: 1, status: 1 } }).sort({ name: 1 }).toArray();
  return docs.map((b) => ({ id: b._id.toHexString(), name: b.name, areaSlug: b.areaSlug, status: b.status }));
}

export async function getBusiness(id: string) {
  const { businesses } = await collections();
  const business = await businesses.findOne({ _id: toObjectId(id, "Business") });
  if (!business) throw notFoundError("Business");
  return business;
}

/** Inserts a business without input validation; callers have already checked the fields. */
export async function insertBusiness(fields: Omit<BusinessDoc, "_id" | "slug" | "sortOrder" | "createdAt" | "updatedAt">) {
  const db = await collections();
  const now = new Date();
  const last = await db.businesses.find({}, { projection: { sortOrder: 1 } }).sort({ sortOrder: -1 }).limit(1).next();
  const doc: BusinessDoc = {
    ...fields,
    slug: await uniqueSlug(db.businesses, `${fields.name} ${fields.areaSlug}`, "business"),
    sortOrder: (last?.sortOrder ?? 0) + 1,
    createdAt: now,
    updatedAt: now,
  };
  const { insertedId } = await db.businesses.insertOne(doc);
  await markMediaUsed([doc.cover, ...doc.photos]);
  return { ...doc, _id: insertedId };
}

export async function createBusiness(input: BusinessInput, actor: AuthUser) {
  await checkCatalog(input.categorySlug, input.areaSlug);
  const business = await insertBusiness({ ...businessFields(input), ownerIds: [], status: "active", verified: false, plan: "free" });
  await audit(actor, "business.create", "business", business._id, { after: { slug: business.slug } });
  return business;
}

/** Refreshes the business fields every one of its offers carries a copy of. */
export async function syncBusinessOffers(businessId: ObjectId) {
  const { offers } = await collections();
  await offers.updateMany({ businessId }, { $set: { ...(await businessSnapshot(businessId)), updatedAt: new Date() } });
}

export async function updateBusiness(id: string, input: BusinessInput, actor: AuthUser) {
  await checkCatalog(input.categorySlug, input.areaSlug);
  const before = await getBusiness(id);
  const fields = businessFields(input);
  const { businesses } = await collections();
  const unset = { ...(!fields.instagram && { instagram: "" as const }), ...(!fields.website && { website: "" as const }) };
  await businesses.updateOne(
    { _id: before._id },
    { $set: { ...fields, updatedAt: new Date() }, ...(Object.keys(unset).length && { $unset: unset }) },
  );
  await markMediaUsed([fields.cover, ...fields.photos]);
  await syncBusinessOffers(before._id);
  await audit(actor, "business.update", "business", before._id, { before: { name: before.name, areaSlug: before.areaSlug } });
  return getBusiness(id);
}

export async function setBusinessVerified(id: string, verified: boolean, actor: AuthUser) {
  const { businesses } = await collections();
  const _id = toObjectId(id, "Business");
  const { matchedCount } = await businesses.updateOne(
    { _id },
    verified ? { $set: { verified, verifiedAt: new Date(), updatedAt: new Date() } } : { $set: { verified, updatedAt: new Date() }, $unset: { verifiedAt: "" } },
  );
  if (!matchedCount) throw notFoundError("Business");
  await audit(actor, verified ? "business.verify" : "business.unverify", "business", _id);
}

/** Suspending hides the business and pauses its live offers; reactivating leaves those offers paused for review. */
export async function setBusinessStatus(id: string, status: Exclude<BusinessStatus, "pending">, actor: AuthUser) {
  const db = await collections();
  const _id = toObjectId(id, "Business");
  const before = await db.businesses.findOneAndUpdate({ _id }, { $set: { status, updatedAt: new Date() } });
  if (!before) throw notFoundError("Business");
  let paused = 0;
  if (status === "suspended") {
    ({ modifiedCount: paused } = await db.offers.updateMany({ businessId: _id, status: "approved" }, { $set: { status: "paused", updatedAt: new Date() } }));
  }
  await audit(actor, `business.${status === "suspended" ? "suspend" : "activate"}`, "business", _id, {
    before: { status: before.status },
    after: { status, pausedOffers: paused },
  });
}

export async function businessOfferCounts(id: ObjectId) {
  const { offers } = await collections();
  const rows = await offers.aggregate<{ _id: string; count: number }>([{ $match: { businessId: id } }, { $group: { _id: "$status", count: { $sum: 1 } } }]).toArray();
  return Object.fromEntries(rows.map((r) => [r._id, r.count])) as Record<string, number>;
}
