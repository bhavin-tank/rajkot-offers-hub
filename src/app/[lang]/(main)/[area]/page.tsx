import { permanentRedirect } from "next/navigation";
import { resolveArea } from "@/components/pages/resolve-area";
import { getAreaSlugs } from "@/lib/data";
import { localizePath } from "@/lib/i18n/config";
import { getLocale } from "@/lib/i18n/server";
import { atLeastOne, NO_PARAM } from "@/lib/static-params";

export async function generateStaticParams() {
  return atLeastOne((await getAreaSlugs()).map((area) => ({ area })), { area: NO_PARAM });
}

/** "/kalawad-road" has no page of its own: it opens that area's offers. */
export default async function AreaPage({ params }: PageProps<"/[lang]/[area]">) {
  const area = await resolveArea((await params).area);
  permanentRedirect(localizePath(await getLocale(), `/${area!.slug}/offers`));
}
