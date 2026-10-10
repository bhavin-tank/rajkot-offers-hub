import { LanguageToggle } from "@/components/i18n/language-toggle";
import { Link } from "@/components/i18n/link";
import { ArrowLeft, ChevronDown, Heart, MapPin, Search } from "lucide-react";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { IconLink } from "@/components/ui/icon-button";
import { getT } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";
import { Container } from "./container";
import { Logo } from "./logo";
import { HeaderNav } from "./nav-links";

/** "Rajkot" city pill. Only Rajkot is served, so it links to the area list. */
export async function LocationPill({ className, showChevron }: { className?: string; showChevron?: boolean }) {
  const t = await getT();
  return (
    <Link
      href="/categories#areas"
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-white pr-3 pl-2.5 text-[13px] font-medium hover:border-input lg:h-10 lg:px-3.5 lg:text-sm",
        className,
      )}
    >
      <MapPin size={15} aria-hidden />
      {t(site.city)}
      {showChevron && <ChevronDown size={14} className="text-muted" aria-hidden />}
    </Link>
  );
}

/** Desktop header (72px). */
export async function DesktopHeader({ className }: { className?: string }) {
  const t = await getT();
  return (
    <header className={cn("hidden border-b border-line bg-white lg:block", className)}>
      <Container className="grid h-[72px] grid-cols-[1fr_auto_1fr] items-center">
        <Logo size="lg" priority />
        <HeaderNav />
        <div className="flex items-center justify-end gap-2 xl:gap-3">
          <LocationPill />
          <LanguageToggle />
          <IconLink href="/saved" variant="plain" size="lg" aria-label={t("Saved offers")}>
            <Heart size={20} aria-hidden />
          </IconLink>
          <ButtonLink href="/submit-offer" size="sm">
            {t("Submit an offer")}
          </ButtonLink>
        </div>
      </Container>
    </header>
  );
}

/** Mobile header (56px): logo, search and city pill. */
export async function MobileHeader() {
  const t = await getT();
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur lg:hidden">
      <div className="flex h-14 items-center justify-between px-5">
        <Logo priority />
        <div className="flex items-center gap-2">
          <IconLink href="/offers" variant="plain" size="md" aria-label={t("Search")}>
            <Search size={20} aria-hidden />
          </IconLink>
          <LanguageToggle />
          <LocationPill showChevron />
        </div>
      </div>
    </header>
  );
}

/** Mobile top bar with back arrow and centred title. */
export async function MobileTopBar({
  title,
  backHref,
  action,
}: {
  title: string;
  backHref: string;
  action?: ReactNode;
}) {
  const t = await getT();
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white lg:hidden">
      <div className="grid h-14 grid-cols-[40px_1fr_40px] items-center px-2">
        <IconLink href={backHref} variant="plain" size="lg" aria-label={t("Go back")}>
          <ArrowLeft size={22} aria-hidden />
        </IconLink>
        <h1 className="truncate text-center text-base font-semibold">{title}</h1>
        <div className="flex justify-end">{action}</div>
      </div>
    </header>
  );
}
