/**
 * Loads the sample catalog (src/lib/mock) into MongoDB, replacing any
 * areas, categories, businesses and offers already there.
 *
 *   pnpm db:seed            refuses to run when NODE_ENV=production
 *   pnpm db:seed --force    runs anyway
 *
 * Mock offer dates are day offsets, so they are fixed relative to the day the
 * seed runs: re-seed to get fresh "ending soon" and expired offers.
 */
import { addDays, toIsoDay } from "@/lib/format";
import { areas } from "@/lib/mock/areas";
import { businesses, defaultHours } from "@/lib/mock/businesses";
import { categories } from "@/lib/mock/categories";
import { img } from "@/lib/mock/images";
import { defaultSteps, defaultTerms, offers } from "@/lib/mock/offers";
import { addressI18n, withGujarati as i18n } from "../lib/i18n";
import { closeClient } from "./client";
import { ensureIndexes } from "./indexes";
import { collections, type AreaDoc, type BusinessDoc, type CategoryDoc, type OfferDoc } from "./models";

/** Mock businesses have no real numbers yet. */
const PLACEHOLDER_PHONE = "+91 98XXX XXXXX";
const POSTAL_CODE = "360005";

/** Midnight in Rajkot on `isoDay`. */
function rajkotMidnight(isoDay: string) {
  return new Date(`${isoDay}T00:00:00+05:30`);
}

async function seed() {
  if (process.env.NODE_ENV === "production" && !process.argv.includes("--force")) {
    throw new Error("Refusing to seed with NODE_ENV=production. Pass --force to replace the catalog anyway.");
  }

  const now = new Date();
  const today = toIsoDay(now);
  const db = await collections();

  const areaDocs: AreaDoc[] = areas.map((a, i) => ({
    slug: a.slug,
    name: i18n(a.name),
    city: "rajkot",
    sortOrder: i,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }));

  const categoryDocs: CategoryDoc[] = categories.map((c, i) => ({
    slug: c.slug,
    name: i18n(c.name),
    shortName: i18n(c.shortName),
    icon: c.icon,
    image: c.image,
    description: i18n(c.description),
    subcategories: c.subcategories.map((value) => ({ value, name: i18n(value) })),
    inHomeRow: c.inHomeRow,
    featured: c.featured ?? false,
    sortOrder: i,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }));

  const businessDocs: BusinessDoc[] = businesses.map((b, i) => ({
    slug: b.slug,
    name: b.name,
    categorySlug: b.categorySlug,
    areaSlug: b.areaSlug,
    about: i18n(b.about),
    addressLine: b.addressLine,
    postalCode: POSTAL_CODE,
    phone: PLACEHOLDER_PHONE,
    whatsapp: PLACEHOLDER_PHONE,
    ...(b.instagram && { instagram: b.instagram }),
    ...(b.website && { website: b.website }),
    hours: b.hours ?? defaultHours,
    cover: b.cover,
    photos: b.photos ?? [b.cover],
    geo: { type: "Point", coordinates: [b.geo.lng, b.geo.lat] },
    ownerIds: [],
    status: "active",
    verified: false,
    plan: "free",
    sortOrder: i,
    createdAt: now,
    updatedAt: now,
  }));

  await Promise.all([db.areas.deleteMany({}), db.categories.deleteMany({}), db.businesses.deleteMany({}), db.offers.deleteMany({})]);
  await ensureIndexes();
  await db.areas.insertMany(areaDocs);
  await db.categories.insertMany(categoryDocs);
  const { insertedIds } = await db.businesses.insertMany(businessDocs);

  const areaBySlug = new Map(areaDocs.map((a) => [a.slug, a]));
  const businessBySlug = new Map(businessDocs.map((b, i) => [b.slug, { ...b, _id: insertedIds[i] }]));

  const offerDocs: OfferDoc[] = offers.map((o, i) => {
    const business = businessBySlug.get(o.businessSlug);
    if (!business) throw new Error(`Offer ${o.slug}: unknown business ${o.businessSlug}`);
    const area = areaBySlug.get(business.areaSlug);
    if (!area) throw new Error(`Business ${business.slug}: unknown area ${business.areaSlug}`);
    const createdAt = rajkotMidnight(addDays(today, o.createdDay));
    return {
      slug: o.slug,
      businessId: business._id,
      title: i18n(o.title),
      badge: i18n(o.badge),
      type: o.type,
      discount: o.discount,
      categorySlug: o.categorySlug,
      ...(o.subcategory && { subcategory: o.subcategory }),
      offerText: i18n(o.offerText ?? o.title),
      images: o.images.map((id) => img(id)),
      validFrom: addDays(today, o.fromDay),
      validTo: addDays(today, o.toDay),
      timings: i18n(o.timings ?? "10 AM – 9 PM"),
      steps: defaultSteps.map((text) => ({ text: i18n(text) })),
      terms: (o.terms ?? defaultTerms).map(i18n),
      status: "approved",
      featured: false,
      publishedAt: createdAt,
      businessSlug: business.slug,
      businessName: business.name,
      areaSlug: business.areaSlug,
      areaName: area.name,
      address: addressI18n(business.addressLine, business.postalCode),
      sortOrder: i,
      createdAt,
      updatedAt: now,
    };
  });
  await db.offers.insertMany(offerDocs);

  console.info(
    `Seeded ${areaDocs.length} areas, ${categoryDocs.length} categories, ` +
      `${businessDocs.length} businesses and ${offerDocs.length} offers (dates relative to ${today}).`,
  );
}

seed()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(closeClient);
