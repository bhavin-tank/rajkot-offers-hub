import { ObjectId } from "mongodb";
import { collections, type SubmissionDoc } from "../db/models";
import { AppError, notFoundError } from "../lib/errors";
import { normalizeMobile } from "../lib/mobile";
import { LIMITS, rateLimit } from "../lib/rate-limit";
import type { ContactBody, ReportBody, SubmissionBody } from "../validators/public";
import { claimMedia } from "./media";
import { publicOfferFilter } from "./visibility";

/** What the public sends us: offer submissions, contact messages and offer reports. */

export interface Sender {
  ip: string;
  userId?: string;
}

const senderUserId = (sender: Sender) => (sender.userId ? { userId: new ObjectId(sender.userId) } : {});

export async function createSubmission(input: SubmissionBody, sender: Sender) {
  await rateLimit(`forms:ip:${sender.ip}`, ...LIMITS.formsPerIp);
  const db = await collections();
  const [category, area] = await Promise.all([
    db.categories.findOne({ slug: input.category, isActive: true }),
    db.areas.findOne({ slug: input.area, isActive: true }),
  ]);
  if (!category) throw new AppError("VALIDATION_FAILED", "Unknown category", { fields: { category: "Unknown category" } });
  if (!area) throw new AppError("VALIDATION_FAILED", "Unknown area", { fields: { area: "Unknown area" } });

  const media = await claimMedia(input.mediaIds);
  const now = new Date();
  const doc: SubmissionDoc = {
    businessName: input.businessName,
    categorySlug: input.category,
    areaSlug: input.area,
    address: input.address,
    ownerName: input.ownerName,
    mobile: normalizeMobile(input.mobile)!,
    whatsappSame: input.whatsapp,
    ...(input.instagram && { instagram: input.instagram.replace(/^@/, "") }),
    title: input.title,
    type: input.type,
    description: input.description,
    ...(input.terms && { terms: input.terms }),
    startDate: input.startDate,
    endDate: input.endDate,
    mediaIds: media.map((m) => m._id!),
    images: media.map((m) => m.url),
    ...senderUserId(sender),
    ip: sender.ip,
    status: "new",
    createdAt: now,
    updatedAt: now,
  };
  const { insertedId } = await db.submissions.insertOne(doc);
  return { id: insertedId.toHexString(), status: doc.status };
}

export async function createContactMessage(input: ContactBody, sender: Sender) {
  await rateLimit(`forms:ip:${sender.ip}`, ...LIMITS.formsPerIp);
  const { contactMessages } = await collections();
  const now = new Date();
  const { insertedId } = await contactMessages.insertOne({
    ...input,
    mobile: normalizeMobile(input.mobile)!,
    ...senderUserId(sender),
    ip: sender.ip,
    status: "new",
    createdAt: now,
    updatedAt: now,
  });
  return { id: insertedId.toHexString() };
}

export async function createReport(offerSlug: string, input: ReportBody, sender: Sender) {
  const { offers, reports } = await collections();
  const offer = await offers.findOne({ slug: offerSlug, ...publicOfferFilter() }, { projection: { _id: 1, slug: 1 } });
  if (!offer) throw notFoundError("Offer");
  await rateLimit(`report:${sender.ip}:${offer.slug}`, ...LIMITS.reportPerOfferPerIp);
  const now = new Date();
  const mobile = input.mobile ? normalizeMobile(input.mobile) : null;
  const { insertedId } = await reports.insertOne({
    offerId: offer._id,
    offerSlug: offer.slug,
    reason: input.reason,
    ...(input.details && { details: input.details }),
    ...(mobile && { mobile }),
    ...senderUserId(sender),
    ip: sender.ip,
    status: "open",
    createdAt: now,
    updatedAt: now,
  });
  return { id: insertedId.toHexString() };
}
