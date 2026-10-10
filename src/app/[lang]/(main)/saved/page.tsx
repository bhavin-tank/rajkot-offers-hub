import type { Metadata } from "next";
import { Container, PageTitle } from "@/components/layout/container";
import { SavedOffers } from "@/components/offers/saved-offers";
import { getOfferSummaries } from "@/lib/data";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("Saved offers"),
    robots: { index: false },
  };
}

export default async function SavedPage() {
  const t = await getT();
  const offers = await getOfferSummaries();
  return (
    <Container className="flex flex-col gap-6 pt-6 pb-10 lg:gap-8 lg:pt-12 lg:pb-20">
      <PageTitle title={t("Saved offers")} subtitle={t("Offers you like will be kept here.")} />
      <SavedOffers offers={offers} />
      <p className="text-center text-[13px] text-faint">{t("Saved offers are stored on this device only.")}</p>
    </Container>
  );
}
