"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { useToast } from "@/components/ui/toast";
import { useSavedOffers } from "@/hooks/use-saved-offers";
import { cn } from "@/lib/utils";

function useToggleSave(slug: string) {
  const { isSaved, toggle } = useSavedOffers();
  const toast = useToast();
  const saved = isSaved(slug);
  const onToggle = () => {
    const nowSaved = toggle(slug);
    toast(nowSaved ? "ઓફર સેવ થઈ ગઈ" : "સેવ કરેલમાંથી દૂર કરી");
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

/** Round heart button over an image. */
export function SaveButton({ slug, size = "md", className }: { slug: string; size?: "md" | "lg"; className?: string }) {
  const { saved, onToggle } = useToggleSave(slug);
  return (
    <IconButton
      variant="floating"
      size={size}
      aria-label={saved ? "સેવ કરેલમાંથી દૂર કરો" : "ઓફર સેવ કરો"}
      aria-pressed={saved}
      onClick={onToggle}
      className={className}
    >
      <HeartIcon saved={saved} size={size === "lg" ? 20 : 18} />
    </IconButton>
  );
}

/** Text button "સેવ કરો" used in the desktop info card. */
export function SaveTextButton({ slug }: { slug: string }) {
  const { saved, onToggle } = useToggleSave(slug);
  return (
    <Button variant="ghost" size="sm" aria-pressed={saved} onClick={onToggle} className="px-2">
      <HeartIcon saved={saved} size={18} />
      {saved ? "સેવ થયેલ" : "સેવ કરો"}
    </Button>
  );
}
