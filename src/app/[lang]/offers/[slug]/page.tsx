import { OfferDetailView, offerMetadata } from "@/components/pages/offer-detail-view";
import { OffersView, offersMetadata } from "@/components/pages/offers-view";
import { getCategorySlugs, getOfferSlugs, isCategorySlug } from "@/lib/data";

export function generateStaticParams() {
  return [...getCategorySlugs(), ...getOfferSlugs()].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/offers/[slug]">) {
  const { slug } = await params;
  return isCategorySlug(slug) ? offersMetadata(undefined, slug) : offerMetadata(slug);
}

/** A category's offer list (/offers/electronics) or a single offer (/offers/coffee-buy-one-get-one). */
export default async function OffersSlugPage({ params, searchParams }: PageProps<"/[lang]/offers/[slug]">) {
  const { slug } = await params;
  return isCategorySlug(slug) ? (
    <OffersView category={slug} searchParams={searchParams} />
  ) : (
    <OfferDetailView slug={slug} />
  );
}
