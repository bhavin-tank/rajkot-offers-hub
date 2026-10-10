"use client";

import { Form } from "@/components/i18n/link";
import { Search } from "lucide-react";
import type { ReactNode } from "react";
import { buttonClass } from "@/components/ui/button";
import { useT } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

const variants = {
  /** Home hero: tall, shadowed, with a "search" button on desktop. */
  hero: "h-[54px] rounded-2xl border-line shadow-card lg:h-[60px] lg:pr-2",
  /** Offers page, mobile: flat. */
  page: "h-[46px] rounded-xl border-input",
  /** Offers page, desktop: shadowed. */
  pageLarge: "h-[52px] rounded-[14px] border-line shadow-card",
} as const;

interface SearchBarProps {
  variant?: keyof typeof variants;
  defaultValue?: string;
  /** Hidden inputs to keep the current filters on submit. */
  hidden?: ReactNode;
  className?: string;
}

/** GET form to /offers?q=…, so search works without JavaScript. */
export function SearchBar({ variant = "page", defaultValue, hidden, className }: SearchBarProps) {
  const t = useT();
  const placeholder = t("Search for a shop, offer or category");
  return (
    <Form
      action="/offers"
      role="search"
      className={cn(
        "flex items-center gap-2.5 border bg-white pl-4 focus-within:border-primary focus-within:shadow-ring",
        variants[variant],
        className,
      )}
    >
      {hidden}
      <Search size={variant === "hero" ? 20 : 18} className="shrink-0 text-muted" aria-hidden />
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-full min-w-0 flex-1 bg-transparent pr-3 text-[15px] outline-none focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {variant === "hero" && (
        <button type="submit" className={buttonClass({ size: "sm", className: "hidden h-11 px-6 lg:inline-flex" })}>
          {t("Search")}
        </button>
      )}
    </Form>
  );
}
