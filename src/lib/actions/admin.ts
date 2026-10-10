"use server";

import { cookies } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { bool, hours, i18n, i18nLines, lines, str } from "@/lib/admin/form-data";
import type { AdminState } from "@/lib/admin/state";
import { clearSessionCookies, REFRESH_COOKIE, setSessionCookies } from "@/lib/auth/cookies";
import { currentRequestMeta, requireAdminUser } from "@/lib/auth/session";
import { refreshTags, WRITE_TAGS } from "@/lib/data/cache";
import { AppError } from "@/server/lib/errors";
import * as businesses from "@/server/services/admin/businesses";
import * as catalog from "@/server/services/admin/catalog";
import * as inbox from "@/server/services/admin/inbox";
import * as offers from "@/server/services/admin/offers";
import * as submissions from "@/server/services/admin/submissions";
import * as users from "@/server/services/admin/users";
import { ADMIN_ROLES, requestOtp, revokeRefreshToken, verifyOtp, type AuthUser } from "@/server/services/auth";
import {
  addUserInput,
  areaInput,
  businessInput,
  categoryInput,
  contactUpdateInput,
  convertInput,
  offerInput,
  reasonInput,
  reportResolveInput,
  submissionRejectInput,
  userUpdateInput,
} from "@/server/validators/admin";

/** Admin panel writes. Each checks the session again: actions are public endpoints. */

function toState(error: unknown): AdminState {
  if (error instanceof AppError) return { status: "error", message: error.message, fields: error.extra?.fields };
  if (error instanceof z.ZodError) {
    const fields: Record<string, string> = {};
    for (const issue of error.issues) fields[issue.path.join(".") || "form"] ??= issue.message;
    return { status: "error", message: "Check the highlighted fields", fields };
  }
  console.error("[admin]", error);
  return { status: "error", message: "Something went wrong. Please try again." };
}

async function run(work: (actor: AuthUser) => Promise<AdminState | void>): Promise<AdminState> {
  const actor = await requireAdminUser();
  try {
    return (await work(actor)) ?? { status: "success", message: "Saved" };
  } catch (error) {
    unstable_rethrow(error);
    return toState(error);
  }
}

// Sign-in

export async function requestCodeAction(_prev: AdminState, data: FormData): Promise<AdminState> {
  try {
    const mobile = str(data, "mobile");
    const { requestId } = await requestOtp(mobile, await currentRequestMeta(), { roles: ADMIN_ROLES });
    return { status: "success", message: "If this number has admin access, a code is on its way on WhatsApp.", data: { requestId, mobile } };
  } catch (error) {
    return toState(error);
  }
}

export async function verifyCodeAction(_prev: AdminState, data: FormData): Promise<AdminState> {
  try {
    const result = await verifyOtp(str(data, "requestId"), str(data, "code"), await currentRequestMeta(), { roles: ADMIN_ROLES });
    setSessionCookies(await cookies(), result);
  } catch (error) {
    return toState(error);
  }
  redirect("/admin");
}

export async function signOutAction() {
  const jar = await cookies();
  await revokeRefreshToken(jar.get(REFRESH_COOKIE)?.value);
  clearSessionCookies(jar);
  redirect("/admin/sign-in");
}

// Offers

function readOffer(data: FormData) {
  return offerInput.parse({
    businessId: str(data, "businessId"),
    title: i18n(data, "title"),
    badge: i18n(data, "badge"),
    type: str(data, "type"),
    discount: str(data, "discount") || "0",
    categorySlug: str(data, "categorySlug"),
    subcategory: str(data, "subcategory"),
    offerText: i18n(data, "offerText"),
    images: lines(data, "images"),
    validFrom: str(data, "validFrom"),
    validTo: str(data, "validTo"),
    timings: i18n(data, "timings"),
    steps: i18nLines(data, "steps"),
    terms: i18nLines(data, "terms"),
    featured: bool(data, "featured"),
  });
}

export async function saveOfferAction(id: string | null, _prev: AdminState, data: FormData): Promise<AdminState> {
  let createdId: string | undefined;
  const state = await run(async (actor) => {
    const input = readOffer(data);
    if (id) {
      await offers.updateOffer(id, input, actor);
      refreshTags(WRITE_TAGS.offer, "action");
      return;
    }
    const intent = str(data, "intent");
    const status = intent === "approved" || intent === "pending" ? intent : "draft";
    createdId = (await offers.createOffer(input, actor, status))._id.toHexString();
    refreshTags(WRITE_TAGS.offer, "action");
  });
  if (createdId) redirect(`/admin/offers/${createdId}`);
  return state;
}

const OFFER_INTENTS = ["approve", "reject", "pause", "unpause", "archive", "submit", "feature", "unfeature"] as const;

export async function offerStatusAction(id: string, _prev: AdminState, data: FormData): Promise<AdminState> {
  return run(async (actor) => {
    const intent = z.enum(OFFER_INTENTS).parse(str(data, "intent"));
    if (intent === "approve") await offers.approveOffer(id, actor);
    if (intent === "reject") await offers.rejectOffer(id, reasonInput.parse({ reason: str(data, "reason") }).reason, actor);
    if (intent === "pause") await offers.pauseOffer(id, actor, str(data, "reason") || undefined);
    if (intent === "unpause") await offers.unpauseOffer(id, actor);
    if (intent === "archive") await offers.archiveOffer(id, actor);
    if (intent === "submit") await offers.submitOfferForReview(id, actor);
    if (intent === "feature" || intent === "unfeature") await offers.setOfferFeatured(id, intent === "feature", actor);
    refreshTags(WRITE_TAGS.offer, "action");
    return { status: "success", message: "Updated" };
  });
}

// Submissions

export async function convertSubmissionAction(id: string, _prev: AdminState, data: FormData): Promise<AdminState> {
  let offerId: string | undefined;
  const state = await run(async (actor) => {
    const input = convertInput.parse({
      business: str(data, "business"),
      badge: str(data, "badge"),
      discount: str(data, "discount") || "0",
      publish: bool(data, "publish"),
    });
    offerId = (await submissions.convertSubmission(id, input, actor)).offerId;
    refreshTags(WRITE_TAGS.business, "action");
  });
  if (offerId) redirect(`/admin/offers/${offerId}`);
  return state;
}

export async function rejectSubmissionAction(id: string, _prev: AdminState, data: FormData): Promise<AdminState> {
  return run(async (actor) => {
    const { reason, spam } = submissionRejectInput.parse({ reason: str(data, "reason"), spam: bool(data, "spam") });
    await submissions.rejectSubmission(id, reason, spam, actor);
    return { status: "success", message: spam ? "Marked as spam" : "Rejected" };
  });
}

export async function reviewSubmissionAction(id: string): Promise<AdminState> {
  return run(async (actor) => {
    await submissions.markSubmissionInReview(id, actor);
    return { status: "success", message: "Marked in review" };
  });
}

// Businesses

function readBusiness(data: FormData) {
  return businessInput.parse({
    name: str(data, "name"),
    categorySlug: str(data, "categorySlug"),
    areaSlug: str(data, "areaSlug"),
    about: i18n(data, "about"),
    addressLine: str(data, "addressLine"),
    postalCode: str(data, "postalCode"),
    phone: str(data, "phone"),
    whatsapp: str(data, "whatsapp"),
    instagram: str(data, "instagram"),
    website: str(data, "website"),
    hours: hours(data),
    cover: str(data, "cover"),
    photos: lines(data, "photos"),
    lat: str(data, "lat"),
    lng: str(data, "lng"),
  });
}

export async function saveBusinessAction(id: string | null, _prev: AdminState, data: FormData): Promise<AdminState> {
  let createdId: string | undefined;
  const state = await run(async (actor) => {
    const input = readBusiness(data);
    if (id) await businesses.updateBusiness(id, input, actor);
    else createdId = (await businesses.createBusiness(input, actor))._id.toHexString();
    refreshTags(WRITE_TAGS.business, "action");
  });
  if (createdId) redirect(`/admin/businesses/${createdId}`);
  return state;
}

export async function businessFlagAction(id: string, _prev: AdminState, data: FormData): Promise<AdminState> {
  return run(async (actor) => {
    const intent = z.enum(["verify", "unverify", "suspend", "activate"]).parse(str(data, "intent"));
    if (intent === "verify" || intent === "unverify") await businesses.setBusinessVerified(id, intent === "verify", actor);
    else await businesses.setBusinessStatus(id, intent === "suspend" ? "suspended" : "active", actor);
    refreshTags(WRITE_TAGS.business, "action");
    return { status: "success", message: "Updated" };
  });
}

// Categories and areas

function readCategory(data: FormData) {
  return categoryInput.parse({
    slug: str(data, "slug"),
    name: i18n(data, "name"),
    shortName: i18n(data, "shortName"),
    icon: str(data, "icon"),
    image: str(data, "image"),
    description: i18n(data, "description"),
    // One per line: "English" or "English | ગુજરાતી".
    subcategories: lines(data, "subcategories").map((line) => {
      const [en, gu = ""] = line.split("|").map((part) => part.trim());
      return { value: en, name: { en, gu } };
    }),
    inHomeRow: bool(data, "inHomeRow"),
    featured: bool(data, "featured"),
    sortOrder: str(data, "sortOrder") || "0",
    isActive: bool(data, "isActive"),
  });
}

export async function saveCategoryAction(id: string | null, _prev: AdminState, data: FormData): Promise<AdminState> {
  let created = false;
  const state = await run(async (actor) => {
    const input = readCategory(data);
    if (id) await catalog.updateCategory(id, input, actor);
    else {
      await catalog.createCategory(input, actor);
      created = true;
    }
    refreshTags(WRITE_TAGS.catalog, "action");
  });
  if (created) redirect("/admin/categories");
  return state;
}

export async function deleteCategoryAction(id: string): Promise<AdminState> {
  let deleted = false;
  const state = await run(async (actor) => {
    await catalog.deleteCategory(id, actor);
    refreshTags(WRITE_TAGS.catalog, "action");
    deleted = true;
  });
  if (deleted) redirect("/admin/categories");
  return state;
}

function readArea(data: FormData) {
  return areaInput.parse({
    slug: str(data, "slug"),
    name: i18n(data, "name"),
    sortOrder: str(data, "sortOrder") || "0",
    isActive: bool(data, "isActive"),
  });
}

export async function saveAreaAction(id: string | null, _prev: AdminState, data: FormData): Promise<AdminState> {
  return run(async (actor) => {
    const input = readArea(data);
    if (id) await catalog.updateArea(id, input, actor);
    else await catalog.createArea(input, actor);
    refreshTags(WRITE_TAGS.catalog, "action");
    return { status: "success", message: id ? "Saved" : "Area added" };
  });
}

export async function deleteAreaAction(id: string): Promise<AdminState> {
  return run(async (actor) => {
    await catalog.deleteArea(id, actor);
    refreshTags(WRITE_TAGS.catalog, "action");
    return { status: "success", message: "Deleted" };
  });
}

// Users

export async function addAdminAction(_prev: AdminState, data: FormData): Promise<AdminState> {
  return run(async (actor) => {
    const { mobile, role, name } = addUserInput.parse({ mobile: str(data, "mobile"), role: str(data, "role"), name: str(data, "name") });
    await users.addAdmin(mobile, role, name, actor);
    return { status: "success", message: "Admin added. They can sign in with a WhatsApp code." };
  });
}

export async function updateUserAction(id: string, _prev: AdminState, data: FormData): Promise<AdminState> {
  return run(async (actor) => {
    const change = userUpdateInput.parse({ role: str(data, "role") || undefined, status: str(data, "status") || undefined });
    await users.updateUser(id, change, actor);
    return { status: "success", message: "Updated" };
  });
}

// Inbox

export async function resolveReportAction(id: string, _prev: AdminState, data: FormData): Promise<AdminState> {
  return run(async (actor) => {
    const change = reportResolveInput.parse({ status: str(data, "status"), note: str(data, "note") });
    await inbox.resolveReport(id, change, actor);
    return { status: "success", message: "Report closed" };
  });
}

export async function updateContactAction(id: string, _prev: AdminState, data: FormData): Promise<AdminState> {
  return run(async (actor) => {
    const change = contactUpdateInput.parse({ status: str(data, "status") || undefined, note: str(data, "note") });
    await inbox.updateContactMessage(id, change, actor);
    return { status: "success", message: "Saved" };
  });
}
