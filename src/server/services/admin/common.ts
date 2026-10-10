import { ObjectId, type Collection, type Document, type Filter, type Sort } from "mongodb";
import { AppError } from "../../lib/errors";

/** Parses a route id, answering 404 for anything that can't be one. */
export function toObjectId(id: string, what: string) {
  if (!ObjectId.isValid(id)) throw new AppError("NOT_FOUND", `${what} not found`);
  return new ObjectId(id);
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export async function paged<T extends Document>(
  collection: Collection<T>,
  query: Filter<T>,
  sort: Sort,
  page: number,
  limit: number,
): Promise<Page<T>> {
  const [items, total] = await Promise.all([
    collection.find(query).sort(sort).skip((page - 1) * limit).limit(limit).toArray(),
    collection.countDocuments(query),
  ]);
  return { items: items as T[], total, page, limit };
}

export function escapeRegex(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Case-insensitive "contains" match for a search box. */
export const contains = (q: string) => new RegExp(escapeRegex(q.trim()), "i");
