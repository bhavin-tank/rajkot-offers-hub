import { type Filter } from "mongodb";
import { collections, type ContactDoc, type ReportDoc } from "../../db/models";
import { notFoundError } from "../../lib/errors";
import type { ListQuery } from "../../validators/admin";
import { audit } from "../audit";
import type { AuthUser } from "../auth";
import { paged, toObjectId, contains } from "./common";

export async function listContactMessages({ q, status, page, limit }: ListQuery) {
  const { contactMessages } = await collections();
  const query: Filter<ContactDoc> = {};
  if (status === "new" || status === "replied" || status === "closed") query.status = status;
  if (q) query.$or = [{ name: contains(q) }, { message: contains(q) }, { mobile: contains(q.replace(/\D/g, "") || q) }];
  return paged(contactMessages, query, { createdAt: -1 }, page, limit);
}

export async function updateContactMessage(id: string, change: { status?: ContactDoc["status"]; note?: string }, actor: AuthUser) {
  const { contactMessages } = await collections();
  const _id = toObjectId(id, "Message");
  const before = await contactMessages.findOneAndUpdate({ _id }, { $set: { ...change, updatedAt: new Date() } });
  if (!before) throw notFoundError("Message");
  await audit(actor, "contact.update", "contact", _id, { before: { status: before.status }, after: change });
}

export async function listReports({ status, page, limit }: ListQuery) {
  const { reports } = await collections();
  const query: Filter<ReportDoc> = {};
  if (status === "open" || status === "actioned" || status === "dismissed") query.status = status;
  return paged(reports, query, { createdAt: -1 }, page, limit);
}

export async function resolveReport(id: string, change: { status: "actioned" | "dismissed"; note?: string }, actor: AuthUser) {
  const { reports } = await collections();
  const _id = toObjectId(id, "Report");
  const before = await reports.findOneAndUpdate({ _id }, { $set: { ...change, updatedAt: new Date() } });
  if (!before) throw notFoundError("Report");
  await audit(actor, `report.${change.status}`, "report", _id, { reason: change.note });
}
