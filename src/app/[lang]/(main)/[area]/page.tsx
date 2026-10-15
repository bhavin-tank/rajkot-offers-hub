import { permanentRedirect } from "next/navigation";
import { resolveArea } from "@/components/pages/resolve-area";
import { localizePath } from "@/lib/i18n/config";
import { getLocale } from "@/lib/i18n/server";

/** "/kalawad-road" has no page of its own: it opens that area's offers. */
export default async function AreaPage({ params }: PageProps<"/[lang]/[area]">) {
  const area = await resolveArea((await params).area);
  permanentRedirect(localizePath(await getLocale(), `/${area!.slug}/offers`));
}
