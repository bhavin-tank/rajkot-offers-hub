"use client";

import { LocateFixed, X } from "lucide-react";
import { useState, useTransition, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clearLocationAction, setGpsLocationAction, setPincodeLocationAction, type LocationResult } from "@/lib/actions/location";
import { useT } from "@/lib/i18n/client";
import type { MessageKey } from "@/lib/i18n/translate";
import type { Near } from "@/lib/location";

/**
 * The "near me" block at the top of the location sheet: the browser's GPS, or a
 * Rajkot pincode when the visitor would rather not share it (or is on a desktop).
 */
export function NearMe({ near, onLocated, onCleared }: { near?: Near; onLocated: () => void; onCleared: () => void }) {
  const t = useT();
  const [error, setError] = useState<MessageKey | null>(null);
  const [locating, setLocating] = useState(false);
  const [pending, startTransition] = useTransition();
  const busy = locating || pending;

  function finish(result: LocationResult) {
    if (result.ok) onLocated();
    else setError(result.error);
  }

  function locateByGps() {
    setError(null);
    if (!("geolocation" in navigator)) {
      setError("We could not get your location. Enter your pincode instead.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        startTransition(async () => finish(await setGpsLocationAction(position.coords.latitude, position.coords.longitude)));
      },
      (failure) => {
        setLocating(false);
        setError(
          failure.code === failure.PERMISSION_DENIED
            ? "Location access is off. Enter your pincode instead."
            : "We could not get your location. Enter your pincode instead.",
        );
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 10 * 60_000 },
    );
  }

  function locateByPincode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const pincode = String(new FormData(event.currentTarget).get("pincode") ?? "");
    startTransition(async () => finish(await setPincodeLocationAction(pincode)));
  }

  function clear() {
    setError(null);
    startTransition(async () => {
      await clearLocationAction();
      onCleared();
    });
  }

  return (
    <div className="flex flex-col gap-3 px-1 pb-2">
      {near && (
        <div className="flex items-center gap-2 rounded-xl bg-primary-soft px-3 py-2.5 text-sm">
          <LocateFixed size={16} className="shrink-0 text-primary" aria-hidden />
          <span className="flex-1">
            {near.pincode ? t("Showing distances from pincode {pincode}", { pincode: near.pincode }) : t("Showing distances from your location")}
          </span>
          <button type="button" onClick={clear} disabled={busy} className="inline-flex cursor-pointer items-center gap-1 text-[13px] font-medium text-muted hover:text-ink">
            <X size={14} aria-hidden />
            {t("Clear")}
          </button>
        </div>
      )}
      <Button type="button" variant="outline" block onClick={locateByGps} disabled={busy}>
        <LocateFixed size={18} aria-hidden />
        {locating ? t("Finding you…") : t("Use my location")}
      </Button>
      <form onSubmit={locateByPincode} noValidate className="flex gap-2">
        <Input
          name="pincode"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={6}
          pattern="[0-9]{6}"
          placeholder={t("Pincode, e.g. 360005")}
          aria-label={t("Pincode")}
          className="flex-1"
        />
        <Button type="submit" variant="soft" disabled={busy}>
          {t("Go")}
        </Button>
      </form>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {t(error)}
        </p>
      )}
    </div>
  );
}
