import { FocusShell, MainShell } from "@/components/layout/shells";
import { isCategorySlug } from "@/lib/data";

/**
 * /offers/<slug> is either a category's offer list (browsing page) or a single
 * offer (detail page). The two need different page shells.
 */
export default async function OffersSlugLayout({ children, params }: LayoutProps<"/[lang]/offers/[slug]">) {
  const { slug } = await params;
  return (await isCategorySlug(slug)) ? <MainShell>{children}</MainShell> : <FocusShell>{children}</FocusShell>;
}
