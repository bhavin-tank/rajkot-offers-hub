import type { Metadata } from "next";
import { ZalakViewer } from "@/components/zalak/viewer";
import { getT } from "@/lib/i18n/server";
import { getStatusFeed } from "@/lib/zalak/data";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("Status"), robots: { index: false } };
}

/** `/status?shop=<slug>` opens on that shop's status. */
export default async function StatusPage({ searchParams }: PageProps<"/[lang]/status">) {
  const { shop } = await searchParams;
  const stories = await getStatusFeed();
  const index = stories.findIndex((story) => story.shop.slug === (Array.isArray(shop) ? shop[0] : shop));
  return <ZalakViewer stories={stories} kind="status" start={Math.max(index, 0)} />;
}
