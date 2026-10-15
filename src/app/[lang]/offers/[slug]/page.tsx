import { OfferDetailView, offerMetadata } from "@/components/pages/offer-detail-view";
import { OffersView, offersMetadata } from "@/components/pages/offers-view";
import { isCategorySlug } from "@/lib/data";

export async function generateMetadata({ params }: PageProps<"/[lang]/offers/[slug]">) {
  const { slug } = await params;
  return (await isCategorySlug(slug)) ? offersMetadata(undefined, slug) : offerMetadata(slug);
}

/** A category's offer list (/offers/electronics) or a single offer (/offers/coffee-buy-one-get-one). */
export default async function OffersSlugPage({ params, searchParams }: PageProps<"/[lang]/offers/[slug]">) {
  const { slug } = await params;
  return (await isCategorySlug(slug)) ? (
    <OffersView category={slug} searchParams={searchParams} />
  ) : (
    <OfferDetailView slug={slug} />
  );
}
