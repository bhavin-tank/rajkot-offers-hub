import { LanguageToggle } from "@/components/i18n/language-toggle";
import { Bookmark, CircleUserRound, Gift } from "lucide-react";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { IconLink } from "@/components/ui/icon-button";
import { getAreasWithCounts, getCategorySlugs } from "@/lib/data";
import { getT } from "@/lib/i18n/server";
import { loyaltyEnabled } from "@/lib/rewards/enabled";
import { cn } from "@/lib/utils";
import { BackLink } from "./back-link";
import { Container } from "./container";
import { Logo } from "./logo";
import { LocationPicker } from "./location-picker";
import { NotificationBell } from "./notification-bell";
import { HeaderNav } from "./nav-links";

/** City pill that opens the Rajkot area list. */
export async function LocationPill() {
  const [{ total, areas }, categorySlugs] = await Promise.all([getAreasWithCounts(), getCategorySlugs()]);
  return <LocationPicker areas={areas} total={total} categorySlugs={categorySlugs} />;
}

/** Desktop header (72px); stays at the top of the screen while the page scrolls. */
export async function DesktopHeader({ className }: { className?: string }) {
  const t = await getT();
  return (
    <header className={cn("sticky top-0 z-40 hidden border-b border-line bg-white/95 transition-shadow [html[data-scrolled]_&]:shadow-header backdrop-blur lg:block", className)}>
      <Container className="grid h-[72px] grid-cols-[1fr_auto_1fr] items-center">
        <Logo size="lg" priority />
        <HeaderNav />
        <div className="flex items-center justify-end gap-2 xl:gap-3">
          <LocationPill />
          <LanguageToggle />
          <NotificationBell />
          {loyaltyEnabled() && (
            <IconLink href="/rewards" variant="plain" size="lg" aria-label={t("Rewards")}>
              <Gift size={20} aria-hidden />
            </IconLink>
          )}
          <IconLink href="/saved" variant="plain" size="lg" aria-label={t("Saved offers")}>
            <Bookmark size={20} aria-hidden />
          </IconLink>
          <IconLink href="/account" variant="plain" size="lg" aria-label={t("My account")}>
            <CircleUserRound size={20} aria-hidden />
          </IconLink>
          <ButtonLink href="/submit-offer" size="sm">
            {t("Submit an offer")}
          </ButtonLink>
        </div>
      </Container>
    </header>
  );
}

/** Mobile header (56px): logo, language toggle and city pill; the account is in the bottom menu. */
export function MobileHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 transition-shadow [html[data-scrolled]_&]:shadow-header backdrop-blur lg:hidden">
      <div className="flex h-14 items-center justify-between px-5">
        <Logo priority />
        <div className="flex items-center gap-2">
          <NotificationBell />
          <LanguageToggle />
          <LocationPill />
        </div>
      </div>
    </header>
  );
}

/** Mobile top bar with back arrow and a left-aligned title. */
export function MobileTopBar({
  title,
  backHref,
  action,
}: {
  title: string;
  backHref: string;
  action?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white transition-shadow [html[data-scrolled]_&]:shadow-header lg:hidden">
      <div className="grid h-14 grid-cols-[40px_1fr_40px] items-center px-2">
        <BackLink fallbackHref={backHref} />
        <h1 className="truncate pl-1 text-base font-semibold">{title}</h1>
        <div className="flex justify-end">{action}</div>
      </div>
    </header>
  );
}
