import { collections } from "../db/models";
import { publicOfferFilter } from "./visibility";

export interface SlugSets {
  areas: string[];
  categories: string[];
  offers: string[];
  businesses: string[];
}

/** Every public slug, for 404 checks and static params. Reads only the slug field. */
export async function findSlugs(): Promise<SlugSets> {
  const db = await collections();
  const slugsOf = (docs: { slug: string }[]) => docs.map((d) => d.slug);
  const projection = { _id: 0, slug: 1 } as const;
  const [areas, categories, offers, businesses] = await Promise.all([
    db.areas.find({ isActive: true }, { projection }).sort({ sortOrder: 1 }).toArray(),
    db.categories.find({ isActive: true }, { projection }).sort({ sortOrder: 1 }).toArray(),
    db.offers.find(publicOfferFilter(), { projection }).sort({ sortOrder: 1 }).toArray(),
    db.businesses.find({ status: "active" }, { projection }).sort({ sortOrder: 1 }).toArray(),
  ]);
  return { areas: slugsOf(areas), categories: slugsOf(categories), offers: slugsOf(offers), businesses: slugsOf(businesses) };
}
