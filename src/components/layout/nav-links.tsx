"use client";

import { Link } from "@/components/i18n/link";
import { useParams, usePathname } from "next/navigation";
import { Bookmark, CircleUserRound, House, LayoutGrid, Tag } from "lucide-react";
import { stripArea } from "@/lib/areas";
import { splitLocale } from "@/lib/i18n/config";
import { useT } from "@/lib/i18n/client";
import type { MessageKey } from "@/lib/i18n/translate";
import { cn } from "@/lib/utils";
import { mainNav } from "@/lib/site";

function isActive(pathname: string, href: string, area?: string) {
  const path = stripArea(splitLocale(pathname).path, area);
  return href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`);
}

/** Desktop header navigation. */
export function HeaderNav() {
  const pathname = usePathname();
  const { area } = useParams<{ area?: string }>();
  const t = useT();
  return (
    <nav aria-label={t("Main menu")}>
      <ul className="flex items-center gap-5 text-[15px] xl:gap-9 font-medium">
        {mainNav.map((item) => {
          const active = isActive(pathname, item.href, area);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn("transition-colors", active ? "text-ink" : "text-muted hover:text-ink")}
              >
                {t(item.label)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

const bottomNav = [
  { href: "/", label: "Home", icon: House },
  { href: "/offers", label: "Offers", icon: Tag },
  { href: "/categories", label: "Categories", icon: LayoutGrid },
  { href: "/saved", label: "Saved", icon: Bookmark },
  { href: "/account", label: "Account", icon: CircleUserRound },
] as const satisfies readonly { href: string; label: MessageKey; icon: unknown }[];

/** Mobile tab bar, fixed to the bottom of the screen. */
export function BottomNav() {
  const pathname = usePathname();
  const { area } = useParams<{ area?: string }>();
  const t = useT();
  return (
    <nav
      aria-label={t("Main menu")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="grid h-16 grid-cols-5">
        {bottomNav.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href, area);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-1 text-[11px]",
                  active ? "font-semibold text-primary" : "font-medium text-muted",
                )}
              >
                <Icon size={22} strokeWidth={1.75} aria-hidden />
                {t(label)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
