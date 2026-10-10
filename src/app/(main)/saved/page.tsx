import type { Metadata } from "next";
import { Container, PageTitle } from "@/components/layout/container";
import { SavedOffers } from "@/components/offers/saved-offers";
import { getOfferSummaries } from "@/lib/data";

export const metadata: Metadata = {
  title: "Saved offers",
  robots: { index: false },
};

export default async function SavedPage() {
  const offers = await getOfferSummaries();
  return (
    <Container className="flex flex-col gap-6 pt-6 pb-10 lg:gap-8 lg:pt-12 lg:pb-20">
      <PageTitle title="Saved offers" subtitle="Offers you like will be kept here." />
      <SavedOffers offers={offers} />
      <p className="text-center text-[13px] text-faint">Saved offers are stored on this device only.</p>
    </Container>
  );
}
