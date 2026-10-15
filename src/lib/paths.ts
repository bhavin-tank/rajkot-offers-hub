/**
 * Public URLs of shops and offers. A shop lives at "/<shop>" and its offers at
 * "/<shop>/<offer>"; the proxy maps these onto the pages that render them, and
 * sends the older "/businesses/<shop>" and "/offers/<offer>" links here.
 */
export function shopPath(shop: string) {
  return `/${shop}`;
}

/** `offer` is the handle ("<slug>-<id>") with its shop's slug. */
export function offerPath(offer: { businessSlug: string; slug: string }) {
  return `/${offer.businessSlug}/${offer.slug}`;
}
