import { OfferDetailView, offerMetadata } from "@/components/pages/offer-detail-view";
import { OffersView, offersMetadata } from "@/components/pages/offers-view";
import { getCategorySlugs, getOfferSlugs, isCategorySlug } from "@/lib/data";
import { atLeastOne, NO_PARAM } from "@/lib/static-params";

export async function generateStaticParams() {
  const [categories, offers] = await Promise.all([getCategorySlugs(), getOfferSlugs()]);
  return atLeastOne([...categories, ...offers].map((slug) => ({ slug })), { slug: NO_PARAM });
}

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
