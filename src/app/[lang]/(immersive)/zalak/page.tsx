import type { Metadata } from "next";
import { ZalakViewer } from "@/components/zalak/viewer";
import { getT } from "@/lib/i18n/server";
import { getZalakFeed } from "@/lib/zalak/data";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("Zalak"), robots: { index: false } };
}

/** `/zalak?start=<id>` opens on that reel. */
export default async function ZalakPage({ searchParams }: PageProps<"/[lang]/zalak">) {
  const { start } = await searchParams;
  const stories = await getZalakFeed();
  const index = stories.findIndex((story) => story.id === (Array.isArray(start) ? start[0] : start));
  return <ZalakViewer stories={stories} kind="reel" start={Math.max(index, 0)} />;
}
