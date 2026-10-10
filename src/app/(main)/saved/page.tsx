import type { Metadata } from "next";
import { Container, PageTitle } from "@/components/layout/container";
import { SavedOffers } from "@/components/offers/saved-offers";
import { getOfferSummaries } from "@/lib/data";

export const metadata: Metadata = {
  title: "સેવ કરેલ ઓફર્સ",
  robots: { index: false },
};

export default async function SavedPage() {
  const offers = await getOfferSummaries();
  return (
    <Container className="flex flex-col gap-6 pt-6 pb-10 lg:gap-8 lg:pt-12 lg:pb-20">
      <PageTitle title="સેવ કરેલ ઓફર્સ" subtitle="તમારી પસંદગીની ઓફર્સ અહીં રહેશે." />
      <SavedOffers offers={offers} />
      <p className="text-center text-[13px] text-faint">સેવ કરેલ ઓફર્સ ફક્ત આ ડિવાઇસમાં જ સચવાય છે.</p>
    </Container>
  );
}
