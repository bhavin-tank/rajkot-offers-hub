"use client";

import { Heart } from "lucide-react";
import { useLogin } from "@/components/auth/login-dialog";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/display";
import { Tabs } from "@/components/ui/tabs";
import { loadSaves, useSavedOffers, useSavedShops } from "@/hooks/use-saved";
import { useT } from "@/lib/i18n/client";
import { SavedOffers } from "./saved-offers";
import { SavedShops } from "./saved-shops";

/** The saved page: offers and shops in two tabs. They live on the account, so a guest is asked to log in. */
export function SavedItems() {
  const t = useT();
  const login = useLogin();
  const offers = useSavedOffers();
  const shops = useSavedShops();

  if (offers.ready && !offers.member) {
    return (
      <EmptyState
        icon={Heart}
        title={t("Log in to see what you saved")}
        hint={t("Your saved offers and shops are kept on your account.")}
        action={<Button onClick={() => login.prompt(() => void loadSaves())}>{t("Log in")}</Button>}
      />
    );
  }

  return (
    <Tabs
      listClassName="gap-8"
      items={[
        { value: "offers", label: t("Offers ({count})", { count: offers.saved.length }), content: <SavedOffers /> },
        { value: "shops", label: t("Shops ({count})", { count: shops.saved.length }), content: <SavedShops /> },
      ]}
    />
  );
}
