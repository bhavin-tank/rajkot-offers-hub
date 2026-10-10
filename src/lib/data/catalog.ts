import type { Area, Business, Category, Offer } from "@/types";
import type { Locale } from "@/lib/i18n/config";
import { localizeContent } from "@/lib/i18n/content-server";
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

/**
 * Text shown to visitors is localized here. `subcategories` stay English
 * on purpose: they are filter values in the URL, so a visitor can switch
 * language without losing the filter. Display them with `localizeContent`.
 */
export function localizedAreas(locale: Locale): Area[] {
  return areas.map((a) => ({ ...a, name: localizeContent(locale, a.name) }));
}

export function localizedCategories(locale: Locale): Category[] {
  return categories.map((c) => ({
    ...c,
    name: localizeContent(locale, c.name),
    shortName: localizeContent(locale, c.shortName),
    description: localizeContent(locale, c.description),
  }));
}

export function buildBusinesses(locale: Locale): Business[] {
  const areaBySlug = new Map(localizedAreas(locale).map((a) => [a.slug, a]));
  const categoryBySlug = new Map(localizedCategories(locale).map((c) => [c.slug, c]));

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

  return businesses.map((b) => ({
    slug: b.slug,
    name: b.name,
    categorySlug: b.categorySlug,
    categoryName: category(b.categorySlug).shortName,
    areaSlug: b.areaSlug,
    areaName: area(b.areaSlug).name,
    cover: b.cover,
    about: localizeContent(locale, b.about),
    address: `${b.addressLine}${localizeContent(locale, ", Rajkot 360005")}`,
    phone: "+91 98XXX XXXXX",
    whatsapp: "+91 98XXX XXXXX",
    instagram: b.instagram,
    website: b.website,
    hours: b.hours ?? defaultHours,
    photos: b.photos ?? [b.cover],
    geo: b.geo,
  }));
}

export function buildOffers(now: Date, locale: Locale): Offer[] {
  const today = toIsoDay(now);
  const businessBySlug = new Map(buildBusinesses(locale).map((b) => [b.slug, b]));
  const content = (text: string) => localizeContent(locale, text);

  return offers.map((o) => {
    const business = businessBySlug.get(o.businessSlug);
    if (!business) throw new Error(`Unknown business: ${o.businessSlug}`);
    return {
      slug: o.slug,
      title: content(o.title),
      badge: content(o.badge),
      type: o.type,
      discount: o.discount,
      categorySlug: o.categorySlug,
      subcategory: o.subcategory,
      businessSlug: business.slug,
      businessName: business.name,
      areaSlug: business.areaSlug,
      areaName: business.areaName,
      images: o.images.map((id) => img(id)),
      offerText: content(o.offerText ?? o.title),
      validFrom: addDays(today, o.fromDay),
      validTo: addDays(today, o.toDay),
      createdAt: addDays(today, o.createdDay),
      timings: content(o.timings ?? "10 AM – 9 PM"),
      address: business.address,
      steps: defaultSteps.map((text) => ({ text: content(text) })),
      terms: (o.terms ?? defaultTerms).map(content),
      isExpired: o.toDay < 0,
      daysLeft: o.toDay,
    };
  });
}

export { areas, categories };
