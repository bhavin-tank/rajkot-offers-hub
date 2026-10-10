import type { Area, Business, Category, Offer } from "@/types";
import { addDays, toIsoDay } from "@/lib/format";
import { areas } from "@/lib/mock/areas";
import { businesses, defaultHours } from "@/lib/mock/businesses";
import { categories } from "@/lib/mock/categories";
import { img } from "@/lib/mock/images";
import { defaultSteps, defaultTerms, offers } from "@/lib/mock/offers";

/**
 * Turns the mock records into domain objects. This is the only place
 * that knows about the mock shape; a real API replaces this file.
 */

const areaBySlug = new Map(areas.map((a) => [a.slug, a]));
const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));

function area(slug: string): Area {
  const found = areaBySlug.get(slug);
  if (!found) throw new Error(`Unknown area: ${slug}`);
  return found;
}

function category(slug: string): Category {
  const found = categoryBySlug.get(slug);
  if (!found) throw new Error(`Unknown category: ${slug}`);
  return found;
}

export function buildBusinesses(): Business[] {
  return businesses.map((b) => ({
    slug: b.slug,
    name: b.name,
    categorySlug: b.categorySlug,
    categoryName: category(b.categorySlug).shortName,
    areaSlug: b.areaSlug,
    areaName: area(b.areaSlug).name,
    cover: b.cover,
    about: b.about,
    address: `${b.addressLine}, Rajkot 360005`,
    phone: "+91 98XXX XXXXX",
    whatsapp: "+91 98XXX XXXXX",
    instagram: b.instagram,
    website: b.website,
    hours: b.hours ?? defaultHours,
    photos: b.photos ?? [b.cover],
    geo: b.geo,
  }));
}

export function buildOffers(now: Date): Offer[] {
  const today = toIsoDay(now);
  const businessBySlug = new Map(buildBusinesses().map((b) => [b.slug, b]));

  return offers.map((o) => {
    const business = businessBySlug.get(o.businessSlug);
    if (!business) throw new Error(`Unknown business: ${o.businessSlug}`);
    return {
      slug: o.slug,
      title: o.title,
      badge: o.badge,
      type: o.type,
      discount: o.discount,
      categorySlug: o.categorySlug,
      subcategory: o.subcategory,
      businessSlug: business.slug,
      businessName: business.name,
      areaSlug: business.areaSlug,
      areaName: business.areaName,
      images: o.images.map((id) => img(id)),
      offerText: o.offerText ?? o.title,
      validFrom: addDays(today, o.fromDay),
      validTo: addDays(today, o.toDay),
      createdAt: addDays(today, o.createdDay),
      timings: o.timings ?? "10 AM – 9 PM",
      address: business.address,
      steps: defaultSteps.map((text) => ({ text })),
      terms: o.terms ?? defaultTerms,
      isExpired: o.toDay < 0,
      daysLeft: o.toDay,
    };
  });
}

export { areas, categories };
