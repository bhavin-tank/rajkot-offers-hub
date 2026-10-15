import type { Metadata } from "next";
import { Container, PageTitle } from "@/components/layout/container";
import { SavedItems } from "@/components/offers/saved-items";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("Saved"),
    robots: { index: false },
  };
}

export default async function SavedPage() {
  const t = await getT();
  return (
    // The grey page background the shell gives desktop, on a phone too.
    <div className="min-h-[70dvh] bg-surface">
      <Container className="flex flex-col gap-6 pt-6 pb-10 lg:gap-8 lg:pt-12 lg:pb-20">
        <PageTitle title={t("Saved")} subtitle={t("Offers and shops you like will be kept here.")} />
        <SavedItems />
      </Container>
    </div>
  );
}
