"use client";

import NextForm from "next/form";
import NextLink from "next/link";
import { useParams } from "next/navigation";
import type { ComponentProps } from "react";
import { areaHref } from "@/lib/areas";
import { localizePath } from "@/lib/i18n/config";
import { useLocale } from "@/lib/i18n/client";

/** Resolves an internal href for the visitor's language and, on area pages, their area. */
export function useResolveHref() {
  const locale = useLocale();
  const { area } = useParams<{ area?: string }>();
  return (href: string) => localizePath(locale, areaHref(area, href));
}

/**
 * `next/link` that keeps internal links in the visitor's language, and keeps
 * "/offers" and "/categories" links inside the area they are browsing.
 */
export function Link({ href, ...props }: ComponentProps<typeof NextLink>) {
  const resolve = useResolveHref();
  return <NextLink href={typeof href === "string" ? resolve(href) : href} {...props} />;
}

/** `next/form` whose string `action` follows the same rules as `Link`. */
export function Form({ action, ...props }: ComponentProps<typeof NextForm>) {
  const resolve = useResolveHref();
  return <NextForm action={typeof action === "string" ? resolve(action) : action} {...props} />;
}
