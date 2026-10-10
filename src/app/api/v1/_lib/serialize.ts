import type { ObjectId } from "mongodb";

/** `{ _id, ...rest }` → `{ id, ...rest }`; nested ObjectIds and Dates serialize to strings in JSON. */
export function toApi<T extends { _id?: ObjectId }>(doc: T) {
  const { _id, ...rest } = doc;
  return { id: _id?.toHexString(), ...rest };
}

export function pageToApi<T extends { _id?: ObjectId }>(page: { items: T[]; total: number; page: number; limit: number }) {
  return {
    data: page.items.map(toApi),
    meta: { page: page.page, limit: page.limit, total: page.total, hasMore: page.page * page.limit < page.total },
  };
}
