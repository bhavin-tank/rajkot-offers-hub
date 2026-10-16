import type { Metadata } from "next";
import { Suspense } from "react";
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

const TABS = ["offers", "shops", "following"] as const;

/** `/saved?tab=following` opens the Following tab (the account page links there). */
async function Items({ searchParams }: { searchParams: Promise<{ tab?: string | string[] }> }) {
  const { tab } = await searchParams;
  const initial = TABS.find((name) => name === tab);
  return <SavedItems initialTab={initial} />;
}

export default async function SavedPage({ searchParams }: PageProps<"/[lang]/saved">) {
  const t = await getT();
  return (
    <Container className="flex flex-col gap-6 pt-6 pb-10 lg:gap-8 lg:pt-12 lg:pb-20">
      <PageTitle title={t("Saved")} subtitle={t("Offers and shops you like will be kept here.")} />
      <Suspense>
        <Items searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}
