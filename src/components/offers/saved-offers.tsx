"use client";

import { Clock, Heart } from "lucide-react";
import { useSyncExternalStore } from "react";
import type { OfferSummary } from "@/types";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/display";
import { Tabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { useSavedOffers } from "@/hooks/use-saved-offers";
import { ENDING_SOON_DAYS, formatEndsIn } from "@/lib/format";
import { OfferCard, OfferGridSkeleton } from "./offer-card";

const noop = () => () => {};

/** True once hydrated, so saved offers never flash the empty state. */
function useHydrated() {
  return useSyncExternalStore(noop, () => true, () => false);
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">{children}</div>;
}

/** Saved offers, split into active and expired tabs. */
export function SavedOffers({ offers }: { offers: OfferSummary[] }) {
  const hydrated = useHydrated();
  const { saved, remove, restore } = useSavedOffers();
  const toast = useToast();

  if (!hydrated) return <OfferGridSkeleton count={3} />;

  const bySlug = new Map(offers.map((o) => [o.slug, o]));
  const list = saved.map((slug) => bySlug.get(slug)).filter((o): o is OfferSummary => Boolean(o));
  const active = list.filter((o) => !o.isExpired);
  const expired = list.filter((o) => o.isExpired);

  if (!list.length) {
    return (
      <EmptyState
        icon={Heart}
        title="હજુ કોઈ ઓફર સેવ નથી કરી"
        hint="ગમતી ઓફર પર ♡ દબાવો અને અહીં જુઓ."
        action={<ButtonLink href="/offers">ઓફર્સ જુઓ</ButtonLink>}
      />
    );
  }

  function onRemove(slug: string) {
    const index = saved.indexOf(slug);
    remove(slug);
    toast("ઓફર દૂર કરી", { actionLabel: "પાછું લાવો", onAction: () => restore(slug, index) });
  }

  return (
    <Tabs
      items={[
        {
          value: "active",
          label: `ચાલુ (${active.length})`,
          content: (
            <div className="pt-5 lg:pt-8">
              {active.length ? (
                <Grid>
                  {active.map((offer) => (
                    <OfferCard
                      key={offer.slug}
                      offer={offer}
                      footer={
                        offer.daysLeft <= ENDING_SOON_DAYS && (
                          <p className="flex items-center gap-1.5 text-[13px] font-medium text-warning">
                            <Clock size={14} aria-hidden />
                            {formatEndsIn(offer.daysLeft)}
                          </p>
                        )
                      }
                    />
                  ))}
                </Grid>
              ) : (
                <p className="py-10 text-center text-[15px] text-muted">કોઈ ચાલુ ઓફર સેવ નથી.</p>
              )}
            </div>
          ),
        },
        {
          value: "expired",
          label: `પૂરી થયેલી (${expired.length})`,
          content: (
            <div className="pt-5 lg:pt-8">
              {expired.length ? (
                <Grid>
                  {expired.map((offer) => (
                    <OfferCard
                      key={offer.slug}
                      offer={offer}
                      footer={
                        <Button variant="outline" size="sm" block onClick={() => onRemove(offer.slug)}>
                          દૂર કરો
                        </Button>
                      }
                    />
                  ))}
                </Grid>
              ) : (
                <p className="py-10 text-center text-[15px] text-muted">કોઈ પૂરી થયેલી ઓફર નથી.</p>
              )}
            </div>
          ),
        },
      ]}
    />
  );
}
