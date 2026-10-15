"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { ShopAvatar } from "@/components/businesses/avatar";
import { Link } from "@/components/i18n/link";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/display";
import { IconButton } from "@/components/ui/icon-button";
import { useToast } from "@/components/ui/toast";
import { useSavedShops } from "@/hooks/use-saved";
import { savedShopCards, type SavedShop } from "@/lib/actions/saves";
import { useT } from "@/lib/i18n/client";
import { shopPath } from "@/lib/paths";

/** Saved shops, newest first. Cards are fetched for the shops saved on the account. */
export function SavedShops() {
  const t = useT();
  const toast = useToast();
  const { saved, ready, remove, restore } = useSavedShops();
  const [shops, setShops] = useState<SavedShop[] | null>(null);
  const key = saved.join("|");

  useEffect(() => {
    let current = true;
    savedShopCards(key ? key.split("|") : []).then((cards) => current && setShops(cards), () => current && setShops([]));
    return () => {
      current = false;
    };
  }, [key]);

  if (!ready || (saved.length > 0 && shops === null)) return <div aria-hidden className="h-24 animate-pulse rounded-2xl bg-skeleton" />;

  const bySlug = new Map((shops ?? []).map((shop) => [shop.slug, shop]));
  const list = saved.map((slug) => bySlug.get(slug)).filter((shop): shop is SavedShop => Boolean(shop));

  if (!list.length) {
    return (
      <EmptyState
        icon={Heart}
        title={t("No saved shops yet")}
        hint={t("Tap ♡ on a shop you like to see it here.")}
        action={<ButtonLink href="/offers">{t("Browse offers")}</ButtonLink>}
      />
    );
  }

  function onRemove(slug: string) {
    const index = saved.indexOf(slug);
    const change = remove(slug);
    void change?.done.then((ok) => ok || toast(t("Could not save. Please try again.")));
    toast(t("Shop removed"), { actionLabel: t("Undo"), onAction: () => void restore(slug, index) });
  }

  return (
    <ul className="grid grid-cols-1 gap-4 pt-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 lg:pt-8">
      {list.map((shop) => (
        <li key={shop.slug} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4">
          <Link href={shopPath(shop.slug)} className="flex min-w-0 flex-1 items-center gap-3">
            <ShopAvatar logo={shop.logo} className="size-14 shrink-0" />
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-semibold">{shop.name}</span>
              <span className="block truncate text-sm text-muted">{t("{category} • {area}, Rajkot", { category: shop.categoryName, area: shop.areaName })}</span>
            </span>
          </Link>
          <IconButton variant="soft" size="lg" aria-label={t("Remove from saved")} onClick={() => onRemove(shop.slug)}>
            <Heart size={20} aria-hidden className="fill-primary text-primary" />
          </IconButton>
        </li>
      ))}
    </ul>
  );
}
