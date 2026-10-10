import type { Collection, Filter } from "mongodb";

/** "Sample Café & Bakery!" → "sample-cafe-bakery". Non-Latin text drops out, so callers pass a fallback. */
export function slugify(text: string, maxLength = 60) {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/, "");
}

/** `base`, or `base-2`, `base-3`… whichever is not taken in `collection`. */
export async function uniqueSlug<T extends { slug: string }>(collection: Collection<T>, text: string, fallback: string) {
  const base = slugify(text) || fallback;
  for (let n = 1; n < 1000; n++) {
    const candidate = n === 1 ? base : `${base}-${n}`;
    if (!(await collection.findOne({ slug: candidate } as Filter<T>, { projection: { _id: 1 } }))) return candidate;
  }
  throw new Error(`No free slug for "${base}"`);
}
