"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
  count?: number;
}

export function AdminNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="no-scrollbar flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
      {items.map((item) => {
        const active = item.href === "/admin" ? pathname === "/admin" || pathname === "/en/admin" : pathname.includes(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-9 shrink-0 items-center justify-between gap-3 rounded-lg px-3 text-sm",
              active ? "bg-ink font-medium text-white hover:text-white" : "text-ink hover:bg-surface",
            )}
          >
            {item.label}
            {item.count ? (
              <span className={cn("rounded-full px-1.5 text-xs font-semibold", active ? "bg-white/20 text-white" : "bg-primary text-white")}>{item.count}</span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
