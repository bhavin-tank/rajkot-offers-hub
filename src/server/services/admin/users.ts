import { type Filter } from "mongodb";
import { collections, type Role, type UserDoc } from "../../db/models";
import { AppError, notFoundError } from "../../lib/errors";
import { normalizeMobile } from "../../lib/mobile";
import type { ListQuery } from "../../validators/admin";
import { audit } from "../audit";
import { revokeAllSessions, type AuthUser } from "../auth";
import { contains, paged, toObjectId } from "./common";

export const ROLES: Role[] = ["user", "business", "admin", "superadmin"];

export async function listUsers({ q, status, page, limit }: ListQuery) {
  const { users } = await collections();
  const query: Filter<UserDoc> = {};
  if (status && ROLES.includes(status as Role)) query.role = status as Role;
  if (q) {
    const digits = q.replace(/\D/g, "");
    query.$or = [{ name: contains(q) }, ...(digits ? [{ mobile: contains(digits) }] : [])];
  }
  return paged(users, query, { createdAt: -1 }, page, limit);
}

/** Changes a user's role, status or name. Only a superadmin changes roles; nobody changes their own role or status. */
export async function updateUser(id: string, change: { role?: Role; status?: "active" | "blocked"; name?: string }, actor: AuthUser) {
  const { users } = await collections();
  const _id = toObjectId(id, "User");
  const user = await users.findOne({ _id });
  if (!user) throw notFoundError("User");
  const isSelf = actor.id === id;
  if (change.role && change.role !== user.role) {
    if (actor.role !== "superadmin") throw new AppError("FORBIDDEN", "Only a superadmin can change roles");
    if (isSelf) throw new AppError("FORBIDDEN", "You can't change your own role");
  }
  if (change.status && change.status !== user.status) {
    if (isSelf) throw new AppError("FORBIDDEN", "You can't block yourself");
    if (user.role === "superadmin" && actor.role !== "superadmin") throw new AppError("FORBIDDEN", "Only a superadmin can block a superadmin");
  }
  await users.updateOne({ _id }, { $set: { ...change, updatedAt: new Date() } });
  if (change.status === "blocked") await revokeAllSessions(_id);
  await audit(actor, "user.update", "user", _id, { before: { role: user.role, status: user.status }, after: change });
}

/** Gives a mobile number admin access, creating the user if needed. Superadmin only. */
export async function addAdmin(rawMobile: string, role: "admin" | "superadmin", name: string | undefined, actor: AuthUser) {
  if (actor.role !== "superadmin") throw new AppError("FORBIDDEN", "Only a superadmin can add admins");
  const mobile = normalizeMobile(rawMobile);
  if (!mobile) throw new AppError("VALIDATION_FAILED", "Enter a valid mobile number", { fields: { mobile: "Enter a valid mobile number" } });
  const { users } = await collections();
  const now = new Date();
  const result = await users.findOneAndUpdate(
    { mobile },
    {
      $set: { role, status: "active", updatedAt: now, ...(name && { name }) },
      $setOnInsert: { mobile, businessIds: [], locale: "en", createdAt: now },
    },
    { upsert: true, returnDocument: "after" },
  );
  await audit(actor, "user.grant_admin", "user", result!._id, { after: { role } });
  return result!;
}
