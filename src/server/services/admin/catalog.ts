import { collections } from "../../db/models";
import { AppError, notFoundError } from "../../lib/errors";
import { cleanI18n } from "../../lib/i18n";
import type { AreaInput, CategoryInput } from "../../validators/admin";
import { audit } from "../audit";
import type { AuthUser } from "../auth";
import { markMediaUsed } from "./offers";
import { toObjectId } from "./common";

/**
 * Categories and areas. Slugs are fixed once created: they are in every URL,
 * the sitemap and copies on businesses and offers.
 */

export async function listAllCategories() {
  const { categories } = await collections();
  return categories.find().sort({ sortOrder: 1, slug: 1 }).toArray();
}

export async function getCategoryById(id: string) {
  const { categories } = await collections();
  const doc = await categories.findOne({ _id: toObjectId(id, "Category") });
  if (!doc) throw notFoundError("Category");
  return doc;
}

function categoryFields(input: CategoryInput) {
  return {
    name: cleanI18n(input.name),
    shortName: cleanI18n(input.shortName),
    icon: input.icon,
    image: input.image,
    description: cleanI18n(input.description),
    subcategories: input.subcategories.map((s) => ({ value: s.value, name: cleanI18n(s.name) })),
    inHomeRow: input.inHomeRow,
    featured: input.featured,
    sortOrder: input.sortOrder,
    isActive: input.isActive,
  };
}

export async function createCategory(input: CategoryInput, actor: AuthUser) {
  const { categories } = await collections();
  if (await categories.findOne({ slug: input.slug })) {
    throw new AppError("CONFLICT", "That slug is taken", { fields: { slug: "That slug is taken" } });
  }
  const now = new Date();
  const { insertedId } = await categories.insertOne({ slug: input.slug, ...categoryFields(input), createdAt: now, updatedAt: now });
  await markMediaUsed([input.image]);
  await audit(actor, "category.create", "category", insertedId, { after: { slug: input.slug } });
  return insertedId;
}

export async function updateCategory(id: string, input: CategoryInput, actor: AuthUser) {
  const before = await getCategoryById(id);
  const { categories } = await collections();
  await categories.updateOne({ _id: before._id }, { $set: { ...categoryFields(input), updatedAt: new Date() } });
  await markMediaUsed([input.image]);
  await audit(actor, "category.update", "category", before._id!, { before: { name: before.name, isActive: before.isActive } });
}

export async function deleteCategory(id: string, actor: AuthUser) {
  const category = await getCategoryById(id);
  const db = await collections();
  const [offers, businesses] = await Promise.all([
    db.offers.countDocuments({ categorySlug: category.slug }),
    db.businesses.countDocuments({ categorySlug: category.slug }),
  ]);
  if (offers || businesses) {
    throw new AppError("CONFLICT", `Used by ${businesses} businesses and ${offers} offers. Hide it instead.`);
  }
  await db.categories.deleteOne({ _id: category._id });
  await audit(actor, "category.delete", "category", category._id!, { before: { slug: category.slug } });
}

export async function listAllAreas() {
  const { areas } = await collections();
  return areas.find().sort({ sortOrder: 1, slug: 1 }).toArray();
}

export async function getAreaById(id: string) {
  const { areas } = await collections();
  const doc = await areas.findOne({ _id: toObjectId(id, "Area") });
  if (!doc) throw notFoundError("Area");
  return doc;
}

export async function createArea(input: AreaInput, actor: AuthUser) {
  const { areas } = await collections();
  if (await areas.findOne({ slug: input.slug })) {
    throw new AppError("CONFLICT", "That slug is taken", { fields: { slug: "That slug is taken" } });
  }
  const now = new Date();
  const { insertedId } = await areas.insertOne({
    slug: input.slug,
    name: cleanI18n(input.name),
    city: "rajkot",
    sortOrder: input.sortOrder,
    isActive: input.isActive,
    createdAt: now,
    updatedAt: now,
  });
  await audit(actor, "area.create", "area", insertedId, { after: { slug: input.slug } });
  return insertedId;
}

export async function updateArea(id: string, input: AreaInput, actor: AuthUser) {
  const before = await getAreaById(id);
  const db = await collections();
  const name = cleanI18n(input.name);
  await db.areas.updateOne({ _id: before._id }, { $set: { name, sortOrder: input.sortOrder, isActive: input.isActive, updatedAt: new Date() } });
  // Offers carry the area name.
  await db.offers.updateMany({ areaSlug: before.slug }, { $set: { areaName: name } });
  await audit(actor, "area.update", "area", before._id!, { before: { name: before.name, isActive: before.isActive } });
}

export async function deleteArea(id: string, actor: AuthUser) {
  const area = await getAreaById(id);
  const db = await collections();
  const businesses = await db.businesses.countDocuments({ areaSlug: area.slug });
  if (businesses) throw new AppError("CONFLICT", `Used by ${businesses} businesses. Hide it instead.`);
  await db.areas.deleteOne({ _id: area._id });
  await audit(actor, "area.delete", "area", area._id!, { before: { slug: area.slug } });
}
