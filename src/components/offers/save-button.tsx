"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { useToast } from "@/components/ui/toast";
import { useSavedOffers } from "@/hooks/use-saved-offers";
import { useT } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

function useToggleSave(slug: string) {
  const { isSaved, toggle } = useSavedOffers();
  const toast = useToast();
  const t = useT();
  const saved = isSaved(slug);
  const onToggle = () => {
    const nowSaved = toggle(slug);
    toast(nowSaved ? t("Offer saved") : t("Removed from saved"));
  };
  return { saved, onToggle };
}

function HeartIcon({ saved, size }: { saved: boolean; size: number }) {
  return (
    <Heart
      size={size}
      aria-hidden
      className={cn(saved && "fill-primary text-primary")}
    />
  );
}

/** Round heart button: over an image ("floating") or on a plain bar ("plain"). */
export function SaveButton({
  slug,
  size = "md",
  variant = "floating",
  className,
}: {
  slug: string;
  size?: "md" | "lg";
  variant?: "floating" | "plain";
  className?: string;
}) {
  const t = useT();
  const { saved, onToggle } = useToggleSave(slug);
  return (
    <IconButton
      variant={variant}
      size={size}
      aria-label={saved ? t("Remove from saved") : t("Save offer")}
      aria-pressed={saved}
      onClick={onToggle}
      className={className}
    >
      <HeartIcon saved={saved} size={size === "lg" ? 20 : 18} />
    </IconButton>
  );
}

/** Text button "Save": plain, or outlined like the Share button beside it in a header. */
export function SaveTextButton({ slug, variant = "ghost" }: { slug: string; variant?: "ghost" | "outline" }) {
  const t = useT();
  const { saved, onToggle } = useToggleSave(slug);
  return (
    <Button variant={variant} size="sm" aria-pressed={saved} onClick={onToggle} className={variant === "ghost" ? "px-2" : undefined}>
      <HeartIcon saved={saved} size={18} />
      {saved ? t("Saved") : t("Save")}
    </Button>
  );
}
