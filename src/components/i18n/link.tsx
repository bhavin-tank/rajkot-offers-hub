"use client";

import NextForm from "next/form";
import NextLink from "next/link";
import type { ComponentProps } from "react";
import { localizePath } from "@/lib/i18n/config";
import { useLocale } from "@/lib/i18n/client";

/** `next/link` that keeps internal links in the visitor's language. */
export function Link({ href, ...props }: ComponentProps<typeof NextLink>) {
  const locale = useLocale();
  return <NextLink href={typeof href === "string" ? localizePath(locale, href) : href} {...props} />;
}

/** `next/form` whose string `action` stays in the visitor's language. */
export function Form({ action, ...props }: ComponentProps<typeof NextForm>) {
  const locale = useLocale();
  return <NextForm action={typeof action === "string" ? localizePath(locale, action) : action} {...props} />;
}
