import { ObjectId, type Filter } from "mongodb";
import { collections, type SubmissionDoc, type SubmissionStatus } from "../../db/models";
import { AppError, notFoundError } from "../../lib/errors";
import { DEFAULT_STEPS, DEFAULT_TERMS, DEFAULT_TIMINGS, withGujarati } from "../../lib/i18n";
import { formatMobile } from "../../lib/mobile";
import type { ConvertInput, ListQuery } from "../../validators/admin";
import { audit } from "../audit";
import type { AuthUser } from "../auth";
import { DEFAULT_HOURS, getBusiness, insertBusiness, RAJKOT_CENTER } from "./businesses";
import { paged, toObjectId, contains } from "./common";
import { createOffer } from "./offers";

export const SUBMISSION_STATUSES: SubmissionStatus[] = ["new", "in_review", "converted", "rejected", "spam"];
const OPEN: SubmissionStatus[] = ["new", "in_review"];

export async function listSubmissions({ q, status, page, limit }: ListQuery) {
  const { submissions } = await collections();
  const query: Filter<SubmissionDoc> = {};
  if (status === "open") query.status = { $in: OPEN };
  else if (status && SUBMISSION_STATUSES.includes(status as SubmissionStatus)) query.status = status as SubmissionStatus;
  if (q) query.$or = [{ businessName: contains(q) }, { title: contains(q) }, { mobile: contains(q.replace(/\D/g, "") || q) }];
  return paged(submissions, query, OPEN.includes(status as SubmissionStatus) || status === "open" ? { createdAt: 1 } : { createdAt: -1 }, page, limit);
}

export async function getSubmission(id: string) {
  const { submissions } = await collections();
  const doc = await submissions.findOne({ _id: toObjectId(id, "Submission") });
  if (!doc) throw notFoundError("Submission");
  return doc;
}

/** Existing businesses that share the submission's mobile number: likely the same shop. */
export async function matchingBusinesses(submission: SubmissionDoc) {
  const { businesses } = await collections();
  const digits = submission.mobile.slice(-10);
  return businesses
    .find({ $or: [{ phone: contains(digits) }, { whatsapp: contains(digits) }, { name: contains(submission.businessName) }] })
    .limit(5)
    .toArray();
}

export async function markSubmissionInReview(id: string, actor: AuthUser) {
  const { submissions } = await collections();
  const _id = toObjectId(id, "Submission");
  await submissions.updateOne({ _id, status: "new" }, { $set: { status: "in_review", updatedAt: new Date() } });
  await audit(actor, "submission.review", "submission", _id);
}

export async function rejectSubmission(id: string, reason: string, spam: boolean, actor: AuthUser) {
  const { submissions } = await collections();
  const _id = toObjectId(id, "Submission");
  const status: SubmissionStatus = spam ? "spam" : "rejected";
  const before = await submissions.findOneAndUpdate({ _id, status: { $in: OPEN } }, { $set: { status, reason, updatedAt: new Date() } });
  if (!before) throw new AppError("INVALID_STATE", "Only new or in-review submissions can be rejected");
  await audit(actor, `submission.${status}`, "submission", _id, { reason });
}

/**
 * Turns a submission into an offer: on a new business built from the
 * submission, or on an existing one. The offer is `pending` (review it on the
 * offer page) unless `publish` is set.
 */
export async function convertSubmission(id: string, input: ConvertInput, actor: AuthUser) {
  const submission = await getSubmission(id);
  if (!OPEN.includes(submission.status)) throw new AppError("INVALID_STATE", "This submission was already handled");
  const db = await collections();
  const category = await db.categories.findOne({ slug: submission.categorySlug });
  const fallbackImage = category?.image;

  let businessId: ObjectId;
  if (input.business === "new") {
    const phone = formatMobile(submission.mobile);
    const cover = submission.images[0] ?? fallbackImage;
    if (!cover) throw new AppError("VALIDATION_FAILED", "Add a photo or pick a category with an image");
    const business = await insertBusiness({
      name: submission.businessName,
      categorySlug: submission.categorySlug,
      areaSlug: submission.areaSlug,
      about: { en: "" },
      addressLine: submission.address,
      postalCode: "",
      phone,
      whatsapp: phone,
      ...(submission.instagram && { instagram: submission.instagram }),
      hours: DEFAULT_HOURS,
      cover,
      photos: submission.images.length ? submission.images : [cover],
      geo: { type: "Point", coordinates: [RAJKOT_CENTER.lng, RAJKOT_CENTER.lat] },
      ownerIds: [],
      status: "active",
      verified: false,
      plan: "free",
    });
    businessId = business._id;
    await audit(actor, "business.create", "business", businessId, { after: { slug: business.slug, fromSubmission: id } });
  } else {
    businessId = (await getBusiness(input.business))._id!;
  }

  const images = submission.images.length ? submission.images : fallbackImage ? [fallbackImage] : [];
  const terms = submission.terms?.split("\n").map((t) => t.trim()).filter(Boolean) ?? [];
  const offer = await createOffer(
    {
      businessId: businessId.toHexString(),
      title: { en: submission.title },
      badge: { en: input.badge },
      type: submission.type,
      discount: input.discount,
      categorySlug: submission.categorySlug,
      offerText: { en: submission.description.slice(0, 200) },
      images,
      validFrom: submission.startDate,
      validTo: submission.endDate,
      timings: withGujarati(DEFAULT_TIMINGS),
      steps: DEFAULT_STEPS.map(withGujarati),
      terms: terms.length ? terms.slice(0, 12).map((t) => ({ en: t.slice(0, 300) })) : DEFAULT_TERMS.map(withGujarati),
      featured: false,
    },
    actor,
    input.publish ? "approved" : "pending",
  );

  await db.submissions.updateOne(
    { _id: submission._id },
    { $set: { status: "converted", convertedOfferId: offer._id, convertedBusinessId: businessId, updatedAt: new Date() } },
  );
  await audit(actor, "submission.convert", "submission", submission._id!, { after: { offerId: offer._id.toHexString() } });
  return { offerId: offer._id.toHexString(), businessId: businessId.toHexString(), offerSlug: offer.slug };
}
