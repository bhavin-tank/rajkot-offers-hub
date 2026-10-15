"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { OfferPin, OfferSummary } from "@/types";
import { Button } from "@/components/ui/button";
import { loadMoreOffersAction, loadOfferPinsAction, type OfferListQuery } from "@/lib/actions/offer-list";
import { useT } from "@/lib/i18n/client";
import { OfferCardSkeleton, OfferGrid } from "./offer-card";
import { OffersMap } from "./offers-map";
import { useOffersView } from "./view-toggle";

interface OfferResultsProps {
  /** What the list is filtered by, so later pages and the map match it. */
  query: OfferListQuery;
  initialItems: OfferSummary[];
  /** The page `initialItems` runs up to. */
  initialPage: number;
  initialHasMore: boolean;
  total: number;
  /** Link to the next page, for visitors without JavaScript. */
  nextHref: string;
}

/**
 * The results as a list or a map, as chosen with the View toggle. The list loads its next page as the visitor
 * nears the bottom; the map reads its pins the first time it is opened. Remount (by `key`) when
 * the filters change.
 */
export function OfferResults({ query, initialItems, initialPage, initialHasMore, total, nextHref }: OfferResultsProps) {
  const t = useT();
  const { view } = useOffersView();
  const [items, setItems] = useState(initialItems);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [failed, setFailed] = useState(false);
  const busy = useRef(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const [pins, setPins] = useState<{ pins: OfferPin[]; total: number } | null>(null);
  const [mapFailed, setMapFailed] = useState(false);

  const loadMore = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    setFailed(false);
    try {
      const next = await loadMoreOffersAction(query, page + 1);
      setItems((current) => {
        const seen = new Set(current.map((offer) => offer.slug));
        return [...current, ...next.items.filter((offer) => !seen.has(offer.slug))];
      });
      setPage((current) => current + 1);
      setHasMore(next.hasMore);
    } catch {
      setFailed(true);
    } finally {
      busy.current = false;
    }
  }, [query, page]);

  useEffect(() => {
    const el = sentinel.current;
    if (view !== "list" || !el || !hasMore || failed) return;
    // Observing again after every page also catches a sentinel that is still on screen.
    const observer = new IntersectionObserver((entries) => entries[0]?.isIntersecting && void loadMore(), { rootMargin: "600px 0px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, [view, hasMore, failed, loadMore, items.length]);

  useEffect(() => {
    if (view !== "map" || pins || mapFailed) return;
    let cancelled = false;
    loadOfferPinsAction(query).then(
      (data) => !cancelled && setPins(data),
      () => !cancelled && setMapFailed(true),
    );
    return () => {
      cancelled = true;
    };
  }, [view, pins, mapFailed, query]);

  return (
    <>
      {view === "list" ? (
        <div>
          <OfferGrid offers={items} columns={4} />
          {hasMore && (
            <div ref={sentinel} className="mt-6 lg:mt-10">
              {failed ? (
                <div className="flex flex-col items-center gap-3 text-sm text-muted">
                  {t("We could not load more offers.")}
                  <Button type="button" variant="outline" onClick={() => void loadMore()}>
                    {t("Try again")}
                  </Button>
                </div>
              ) : (
                <div role="status" aria-label={t("Loading more offers")} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                  <OfferCardSkeleton />
                  <OfferCardSkeleton />
                </div>
              )}
              <noscript>
                <a href={nextHref} className="block text-center text-sm font-medium text-primary">
                  {t("Show more offers")}
                </a>
              </noscript>
            </div>
          )}
        </div>
      ) : (
        <div>
          {pins ? (
            <OffersMap pins={pins.pins} total={pins.total || total} />
          ) : mapFailed ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-surface px-5 py-16 text-sm text-muted">
              {t("We could not load the map.")}
              <Button type="button" variant="outline" onClick={() => setMapFailed(false)}>
                {t("Try again")}
              </Button>
            </div>
          ) : (
            <div role="status" aria-label={t("Loading the map")} className="h-[62dvh] min-h-[420px] animate-pulse rounded-2xl bg-surface lg:h-[640px]" />
          )}
        </div>
      )}
    </>
  );
}
