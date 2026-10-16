"use client";

import { Bell, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToggleSave } from "@/components/offers/save-button";
import { useT } from "@/lib/i18n/client";

/**
 * "Follow" on a shop: new offers from it are put first for the visitor and announced in their notifications.
 * Not the same as the Save heart, which is only a private bookmark. A guest is asked to log in first.
 */
export function FollowButton({ slug, className }: { slug: string; className?: string }) {
  const t = useT();
  const { saved: following, onToggle } = useToggleSave(slug, "follow");
  const Icon = following ? BellRing : Bell;
  return (
    <Button
      variant={following ? "outline" : "primary"}
      size="sm"
      aria-pressed={following}
      onClick={onToggle}
      className={className}
    >
      <Icon size={18} aria-hidden />
      {following ? t("Following") : t("Follow")}
    </Button>
  );
}
