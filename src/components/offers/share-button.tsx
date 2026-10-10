"use client";

import { Link2, Share2 } from "lucide-react";
import { useState } from "react";
import { InstagramIcon, WhatsAppIcon } from "@/components/icons/brand";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Sheet } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/toast";
import { localizePath } from "@/lib/i18n/config";
import { useLocale, useT } from "@/lib/i18n/client";
import { site } from "@/lib/site";

interface ShareButtonProps {
  title: string;
  /** Path of the page to share, e.g. "/offers/kurta-20-off". */
  path: string;
  variant?: "floating" | "plain" | "text" | "pill";
}

/** Uses the system share sheet when there is one, else our own sheet. */
export function ShareButton({ title, path, variant = "floating" }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const toast = useToast();
  const t = useT();
  const locale = useLocale();
  const url = `${site.url}${localizePath(locale, path)}`;

  async function onShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        if ((error as DOMException).name === "AbortError") return;
      }
    }
    setOpen(true);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      toast(t("Link copied"));
    } catch {
      toast(t("Could not copy the link"));
    }
    setOpen(false);
  }

  const options = [
    {
      label: "WhatsApp",
      icon: <WhatsAppIcon size={22} />,
      href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
    },
    { label: "Instagram", icon: <InstagramIcon size={22} />, href: "https://instagram.com" },
  ];

  return (
    <>
      {variant === "floating" || variant === "plain" ? (
        <IconButton variant={variant} size="lg" aria-label={t("Share")} onClick={onShare}>
          <Share2 size={20} aria-hidden />
        </IconButton>
      ) : variant === "pill" ? (
        <button
          type="button"
          onClick={onShare}
          className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-white px-4 text-sm font-medium shadow-card hover:bg-surface"
        >
          <Share2 size={16} aria-hidden />
          {t("Share")}
        </button>
      ) : (
        <Button variant="ghost" size="sm" onClick={onShare} className="px-2">
          <Share2 size={18} aria-hidden />
          {t("Share")}
        </Button>
      )}

      <Sheet open={open} onClose={() => setOpen(false)} title={t("Share with friends")}>
        <div className="grid grid-cols-3 gap-3">
          {options.map((option) => (
            <a
              key={option.label}
              href={option.href}
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
              className="flex flex-col items-center gap-2 rounded-2xl bg-surface py-4 text-xs font-medium hover:bg-canvas"
            >
              {option.icon}
              {option.label}
            </a>
          ))}
          <button
            type="button"
            onClick={copyLink}
            className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl bg-surface py-4 text-xs font-medium hover:bg-canvas"
          >
            <Link2 size={22} aria-hidden />
            {t("Copy link")}
          </button>
        </div>
        <p className="mt-4 truncate rounded-xl border border-line px-3.5 py-3 text-[13px] text-muted">
          {url.replace(/^https?:\/\//, "")}
        </p>
      </Sheet>
    </>
  );
}
