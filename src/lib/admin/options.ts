import { businessOptions } from "@/server/services/admin/businesses";
import { listAllAreas, listAllCategories } from "@/server/services/admin/catalog";

/** Choices for admin form dropdowns. */
export async function formOptions() {
  const [businesses, categories, areas] = await Promise.all([businessOptions(), listAllCategories(), listAllAreas()]);
  return {
    businesses,
    categories: categories.map((c) => ({ slug: c.slug, name: c.shortName.en, subcategories: c.subcategories.map((s) => s.value) })),
    areas: areas.map((a) => ({ slug: a.slug, name: a.name.en })),
  };
}
