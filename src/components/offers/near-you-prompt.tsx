"use client";

import { LocateFixed } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { setGpsLocationAction } from "@/lib/actions/location";
import { useT } from "@/lib/i18n/client";
import type { MessageKey } from "@/lib/i18n/translate";
import { NEAR_CHANGED_EVENT } from "@/lib/location";

/** Asks the browser for the visitor's position once they tap, saves it as their "near me" location and reloads the page with it. */
export function NearYouPrompt() {
  const t = useT();
  const router = useRouter();
  const [error, setError] = useState<MessageKey | null>(null);
  const [locating, setLocating] = useState(false);
  const [pending, startTransition] = useTransition();
  const busy = locating || pending;

  function locate() {
    setError(null);
    if (!("geolocation" in navigator)) {
      setError("We could not get your location.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        startTransition(async () => {
          const result = await setGpsLocationAction(position.coords.latitude, position.coords.longitude);
          if (!result.ok) return setError(result.error);
          window.dispatchEvent(new Event(NEAR_CHANGED_EVENT));
          router.refresh();
        });
      },
      (failure) => {
        setLocating(false);
        setError(failure.code === failure.PERMISSION_DENIED ? "Location access is off." : "We could not get your location.");
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 10 * 60_000 },
    );
  }

  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl bg-surface p-4 lg:flex-row lg:items-center lg:justify-between lg:p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-primary">
          <LocateFixed size={20} aria-hidden />
        </span>
        <p className="text-sm lg:text-[15px] leading-snug">{t("See the offers closest to you, nearest first.")}</p>
      </div>
      <Button onClick={locate} disabled={busy} className="w-full lg:w-auto">
        {locating ? t("Finding you…") : t("Offers near me")}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {t(error)}
        </p>
      )}
    </div>
  );
}
