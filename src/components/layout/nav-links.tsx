"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, House, LayoutGrid, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { mainNav } from "@/lib/site";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/** Desktop header navigation. */
export function HeaderNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main menu">
      <ul className="flex items-center gap-9 text-[15px] font-medium">
        {mainNav.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn("transition-colors", active ? "text-ink" : "text-muted hover:text-ink")}
              >
                {item.label}
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
] as const;

/** Mobile tab bar, fixed to the bottom of the screen. */
export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main menu"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="grid h-16 grid-cols-4">
        {bottomNav.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
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
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
