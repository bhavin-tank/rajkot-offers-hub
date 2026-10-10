import { ObjectId, type Filter } from "mongodb";
import { toIsoDay } from "@/lib/format";
import { collections, type OfferDoc, type OfferStatus } from "../../db/models";
import { AppError, notFoundError } from "../../lib/errors";
import { addressI18n, cleanI18n } from "../../lib/i18n";
import { uniqueSlug } from "../../lib/slug";
import type { ListQuery, OfferInput } from "../../validators/admin";
import { audit } from "../audit";
import type { AuthUser } from "../auth";
import { contains, paged, toObjectId } from "./common";

export const OFFER_STATUSES: OfferStatus[] = ["draft", "pending", "approved", "rejected", "paused", "expired", "archived"];

/** The business fields an offer carries a copy of. */
export async function businessSnapshot(businessId: ObjectId) {
  const db = await collections();
  const business = await db.businesses.findOne({ _id: businessId });
  if (!business) throw new AppError("VALIDATION_FAILED", "Unknown business", { fields: { businessId: "Unknown business" } });
  const area = await db.areas.findOne({ slug: business.areaSlug });
  return {
    businessSlug: business.slug,
    businessName: business.name,
    areaSlug: business.areaSlug,
    areaName: area?.name ?? { en: business.areaSlug },
    address: addressI18n(business.addressLine, business.postalCode),
  };
}

/** Marks uploads now used by a record as ready, so cleanup never removes them. */
export async function markMediaUsed(urls: string[]) {
  if (!urls.length) return;
  const { media } = await collections();
  await media.updateMany({ url: { $in: urls } }, { $set: { status: "ready" } });
}

function offerFields(input: OfferInput) {
  return {
    businessId: new ObjectId(input.businessId),
    title: cleanI18n(input.title),
    badge: cleanI18n(input.badge),
    type: input.type,
    discount: input.discount,
    categorySlug: input.categorySlug,
    subcategory: input.subcategory,
    offerText: input.offerText,
    images: input.images,
    validFrom: input.validFrom,
    validTo: input.validTo,
    timings: cleanI18n(input.timings),
    steps: input.steps.map((s) => ({ text: cleanI18n(s) })),
    terms: input.terms.map(cleanI18n),
    featured: input.featured,
  };
}

async function checkCategory(slug: string) {
  const { categories } = await collections();
  if (!(await categories.findOne({ slug }))) {
    throw new AppError("VALIDATION_FAILED", "Unknown category", { fields: { categorySlug: "Unknown category" } });
  }
}

export async function listOffers({ q, status, page, limit }: ListQuery) {
  const { offers } = await collections();
  const query: Filter<OfferDoc> = {};
  if (status && OFFER_STATUSES.includes(status as OfferStatus)) query.status = status as OfferStatus;
  if (q) query.$or = [{ "title.en": contains(q) }, { businessName: contains(q) }, { slug: contains(q) }];
  // The queue reads oldest first; everything else newest first.
  return paged(offers, query, status === "pending" ? { updatedAt: 1 } : { updatedAt: -1 }, page, limit);
}

export async function getOffer(id: string) {
  const { offers } = await collections();
  const offer = await offers.findOne({ _id: toObjectId(id, "Offer") });
  if (!offer) throw notFoundError("Offer");
  return offer;
}

export async function createOffer(input: OfferInput, actor: AuthUser, status: "draft" | "pending" | "approved" = "draft") {
  await checkCategory(input.categorySlug);
  const fields = offerFields(input);
  const db = await collections();
  const now = new Date();
  const last = await db.offers.find({}, { projection: { sortOrder: 1 } }).sort({ sortOrder: -1 }).limit(1).next();
  const doc: OfferDoc = {
    ...fields,
    ...(await businessSnapshot(fields.businessId)),
    slug: await uniqueSlug(db.offers, input.title.en, "offer"),
    status,
    ...(status === "approved" && { publishedAt: now }),
    createdBy: new ObjectId(actor.id),
    sortOrder: (last?.sortOrder ?? 0) + 1,
    createdAt: now,
    updatedAt: now,
  };
  const { insertedId } = await db.offers.insertOne(doc);
  await markMediaUsed(input.images);
  await audit(actor, "offer.create", "offer", insertedId, { after: { slug: doc.slug, status } });
  return { ...doc, _id: insertedId };
}

export async function updateOffer(id: string, input: OfferInput, actor: AuthUser) {
  await checkCategory(input.categorySlug);
  const before = await getOffer(id);
  const fields = offerFields(input);
  const { offers } = await collections();
  const unset = { ...(!fields.subcategory && { subcategory: "" as const }), ...(!fields.offerText && { offerText: "" as const }) };
  await offers.updateOne(
    { _id: before._id },
    {
      $set: { ...fields, ...(await businessSnapshot(fields.businessId)), updatedAt: new Date() },
      ...(Object.keys(unset).length && { $unset: unset }),
    },
  );
  await markMediaUsed(input.images);
  await audit(actor, "offer.update", "offer", before._id!, { before: { title: before.title, validTo: before.validTo } });
  return getOffer(id);
}

/** Moves an offer between statuses atomically; INVALID_STATE when it is not in one of `from`. */
async function transition(
  id: string,
  from: OfferStatus[],
  to: OfferStatus,
  actor: AuthUser,
  extra: { set?: Partial<OfferDoc>; unset?: (keyof OfferDoc)[]; reason?: string } = {},
) {
  const { offers } = await collections();
  const _id = toObjectId(id, "Offer");
  const updated = await offers.findOneAndUpdate(
    { _id, status: { $in: from } },
    {
      $set: { status: to, updatedAt: new Date(), ...extra.set },
      ...(extra.unset?.length && { $unset: Object.fromEntries(extra.unset.map((k) => [k, ""])) }),
    },
    { returnDocument: "before" },
  );
  if (!updated) {
    const current = await offers.findOne({ _id }, { projection: { status: 1 } });
    if (!current) throw notFoundError("Offer");
    throw new AppError("INVALID_STATE", `This offer is ${current.status}; only ${from.join(", ")} offers can become ${to}`);
  }
  await audit(actor, `offer.${to}`, "offer", _id, { before: { status: updated.status }, after: { status: to }, reason: extra.reason });
  return { ...updated, status: to };
}

export async function approveOffer(id: string, actor: AuthUser) {
  const offer = await getOffer(id);
  return transition(id, ["draft", "pending", "rejected"], "approved", actor, {
    set: { publishedAt: offer.publishedAt ?? new Date() },
    unset: ["rejectionReason"],
  });
}

export const rejectOffer = (id: string, reason: string, actor: AuthUser) =>
  transition(id, ["draft", "pending"], "rejected", actor, { set: { rejectionReason: reason }, reason });

export const pauseOffer = (id: string, actor: AuthUser, reason?: string) => transition(id, ["approved"], "paused", actor, { reason });

export const unpauseOffer = (id: string, actor: AuthUser) => transition(id, ["paused"], "approved", actor);

export const submitOfferForReview = (id: string, actor: AuthUser) => transition(id, ["draft", "rejected"], "pending", actor);

export const archiveOffer = (id: string, actor: AuthUser) =>
  transition(id, ["draft", "pending", "approved", "rejected", "paused", "expired"], "archived", actor);

export async function setOfferFeatured(id: string, featured: boolean, actor: AuthUser) {
  const { offers } = await collections();
  const _id = toObjectId(id, "Offer");
  const { matchedCount } = await offers.updateOne({ _id }, { $set: { featured, updatedAt: new Date() } });
  if (!matchedCount) throw notFoundError("Offer");
  await audit(actor, featured ? "offer.feature" : "offer.unfeature", "offer", _id);
}

/** Nightly job: approved offers whose last day has passed become `expired`. Returns how many changed. */
export async function expireOffers(now = new Date()) {
  const { offers } = await collections();
  const { modifiedCount } = await offers.updateMany(
    { status: "approved", validTo: { $lt: toIsoDay(now) } },
    { $set: { status: "expired", updatedAt: now } },
  );
  return modifiedCount;
}
