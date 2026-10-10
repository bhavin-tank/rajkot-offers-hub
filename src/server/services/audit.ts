import { ObjectId } from "mongodb";
import { collections } from "../db/models";
import type { AuthUser } from "./auth";

/** Records an admin write. `before`/`after` hold only the fields that matter for the action. */
export async function audit(
  actor: AuthUser,
  action: string,
  entity: string,
  entityId: ObjectId | string,
  details: { before?: unknown; after?: unknown; reason?: string } = {},
) {
  const { auditLogs } = await collections();
  await auditLogs.insertOne({
    actorId: new ObjectId(actor.id),
    actorMobile: actor.mobile,
    action,
    entity,
    entityId: typeof entityId === "string" ? entityId : entityId.toHexString(),
    ...details,
    createdAt: new Date(),
  });
}

export async function listAudit({ entity, entityId, page = 1, limit = 50 }: { entity?: string; entityId?: string; page?: number; limit?: number }) {
  const { auditLogs } = await collections();
  const query = { ...(entity && { entity }), ...(entityId && { entityId }) };
  const [items, total] = await Promise.all([
    auditLogs.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).toArray(),
    auditLogs.countDocuments(query),
  ]);
  return { items, total };
}
