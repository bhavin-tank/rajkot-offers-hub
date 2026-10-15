"use client";

import { useEffect, useRef, type ComponentProps } from "react";
import { trackOfferAction, type OfferEvent } from "@/lib/actions/offers";

/** Counts an action on an offer for the shop's stats; fire and forget. */
export function trackOffer(offerId: string | undefined, type: OfferEvent) {
  if (offerId) void trackOfferAction(offerId, type);
}

/** Counts one detail view per page visit. */
export function TrackOfferView({ offerId }: { offerId: string }) {
  const sent = useRef<string | null>(null);
  useEffect(() => {
    if (sent.current === offerId) return;
    sent.current = offerId;
    trackOffer(offerId, "detail_view");
  }, [offerId]);
  return null;
}

/** A plain link (directions) that counts its tap. */
export function TrackedAnchor({ offerId, event, onClick, ...props }: ComponentProps<"a"> & { offerId?: string; event: OfferEvent }) {
  return (
    <a
      {...props}
      onClick={(e) => {
        trackOffer(offerId, event);
        onClick?.(e);
      }}
    />
  );
}
