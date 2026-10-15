import type { Metadata } from "next";
import { localizePath, type Locale } from "@/lib/i18n/config";
import { getLocale } from "@/lib/i18n/server";
import { absoluteUrl, site } from "@/lib/site";
import type { Business, Offer } from "@/types";
import { offerPath, shopPath } from "@/lib/paths";

/**
 * public/opengraph-image.png, named by every page. Not the `app/opengraph-image`
 * file convention: that never reaches pages under the `[lang]` root layout, and
 * `app/` itself has no layout to set `metadataBase`, so Next warned and resolved
 * it against http://localhost:3000 on every build and worker start.
 */
export const DEFAULT_SHARE_IMAGE = "/opengraph-image.png";

interface PageSeo {
  title: string;
  description: string;
  /** Public path without the locale prefix; becomes the canonical URL. */
  path: string;
  /** Share image; the site-wide one when omitted. */
  image?: string;
  /** Keep the page out of search results (empty lists, expired offers). */
  noindex?: boolean;
  /** Use `title` as is, without the "· Rajkot Offers Hub" suffix. */
  absoluteTitle?: boolean;
}

/**
 * Title, description, canonical URL and share tags for a page. Pages pass the
 * clean path, so filtered and sorted variants ("?sort=ending", "?page=2") point
 * search engines back to the one URL that should rank.
 */
export async function pageMetadata({ title, description, path, image, noindex, absoluteTitle }: PageSeo): Promise<Metadata> {
  const locale = await getLocale();
  const url = localizePath(locale, path);
  const images = [image ?? DEFAULT_SHARE_IMAGE];
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: site.name,
      locale: locale === "gu" ? "gu_IN" : "en_IN",
      type: "website",
      images,
    },
    twitter: { card: "summary_large_image", title, description, images },
    ...(noindex && { robots: { index: false, follow: true } }),
  };
}

/** Renders schema.org data as a JSON-LD script tag. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // Escape "<" so text in the data can never close the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

const ORGANIZATION_ID = `${site.url}/#organization`;

/** The site itself, for the home page. */
export function siteLd(description: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORGANIZATION_ID,
        name: site.name,
        url: site.url,
        logo: absoluteUrl("/icon.png"),
        email: site.email,
        sameAs: [`https://instagram.com/${site.instagram.replace(/^@/, "")}`],
        areaServed: cityLd(),
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        name: site.name,
        url: site.url,
        description,
        inLanguage: "en-IN",
        publisher: { "@id": ORGANIZATION_ID },
      },
    ],
  };
}

function cityLd() {
  return {
    "@type": "City",
    name: site.city,
    containedInPlace: { "@type": "State", name: site.region },
  };
}

/** Breadcrumb trail; the last item is the current page. */
export async function breadcrumbLd(items: { name: string; path: string }[]) {
  const locale = await getLocale();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(localizePath(locale, item.path)),
    })),
  };
}

export function faqLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
}

/** The closest schema.org business type for each category. */
const BUSINESS_TYPES: Record<string, string> = {
  food: "FoodEstablishment",
  fashion: "ClothingStore",
  beauty: "BeautySalon",
  electronics: "ElectronicsStore",
  fitness: "HealthClub",
  home: "HomeGoodsStore",
  entertainment: "EntertainmentBusiness",
  festival: "Store",
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/** Mock numbers are masked ("+91 98XXX XXXXX"); only publish real ones. */
function realPhone(phone: string) {
  return /^\+?[\d\s-]+$/.test(phone) ? phone : undefined;
}

function addressLd(business: Business) {
  return {
    "@type": "PostalAddress",
    streetAddress: business.streetAddress,
    addressLocality: `${business.areaName}, ${site.city}`,
    addressRegion: site.region,
    postalCode: business.postalCode,
    addressCountry: site.country,
  };
}

function businessRef(business: Business, locale: Locale) {
  return `${absoluteUrl(localizePath(locale, shopPath(business.slug)))}#business`;
}

/** A shop's profile as a LocalBusiness: address, map pin, hours and contact. */
export async function localBusinessLd(business: Business, offers: Pick<Offer, "urlSlug" | "title" | "businessSlug">[] = []) {
  const locale = await getLocale();
  const url = absoluteUrl(localizePath(locale, shopPath(business.slug)));
  const links = [
    business.instagram && `https://instagram.com/${business.instagram.replace(/^@/, "")}`,
    business.website && (business.website.startsWith("http") ? business.website : `https://${business.website}`),
  ].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": BUSINESS_TYPES[business.categorySlug] ?? "LocalBusiness",
    "@id": businessRef(business, locale),
    name: business.name,
    description: business.about,
    url,
    image: [...new Set([business.cover, ...business.photos])],
    telephone: realPhone(business.phone),
    address: addressLd(business),
    geo: { "@type": "GeoCoordinates", latitude: business.geo.lat, longitude: business.geo.lng },
    hasMap: `https://www.google.com/maps/search/?api=1&query=${business.geo.lat},${business.geo.lng}`,
    openingHoursSpecification: business.hours
      .filter((h) => h.opens && h.closes)
      .map((h) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: DAYS[h.day], opens: h.opens, closes: h.closes })),
    sameAs: links.length ? links : undefined,
    makesOffer: offers.length
      ? offers.map((o) => ({ "@type": "Offer", name: o.title, url: absoluteUrl(localizePath(locale, offerPath(o))) }))
      : undefined,
  };
}

/** One offer, sold by the business that runs it. */
export async function offerLd(offer: Offer, business: Business) {
  const locale = await getLocale();
  return {
    "@context": "https://schema.org",
    "@type": "Offer",
    name: offer.title,
    description: offer.offerText,
    url: absoluteUrl(localizePath(locale, offerPath(offer))),
    image: offer.images,
    category: offer.subcategory,
    validFrom: offer.validFrom,
    validThrough: offer.validTo,
    availability: offer.isExpired ? "https://schema.org/Discontinued" : "https://schema.org/InStoreOnly",
    areaServed: cityLd(),
    offeredBy: {
      "@type": BUSINESS_TYPES[business.categorySlug] ?? "LocalBusiness",
      "@id": businessRef(business, locale),
      name: business.name,
      address: addressLd(business),
    },
  };
}
