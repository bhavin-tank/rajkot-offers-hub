import type { Metadata } from "next";
import { Suspense } from "react";
import { DetailSkeleton } from "@/components/layout/page-skeleton";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, MapPin, Navigation, Phone, Store, Tag } from "lucide-react";
import { Link } from "@/components/i18n/link";
import { WhatsAppIcon } from "@/components/icons/brand";
import { ShopAvatar } from "@/components/businesses/avatar";
import { ContactRow, StickyActionBar } from "@/components/businesses/contact-actions";
import { ContactLink } from "@/components/businesses/contact-link";
import { OutletMap, type MapOutlet } from "@/components/businesses/outlet-map";
import { PhotoMosaic } from "@/components/businesses/photo-mosaic";
import { Breadcrumb, Container, SectionHeader } from "@/components/layout/container";
import { OfferCarousel } from "@/components/offers/offer-card";
import { OfferCode } from "@/components/offers/offer-code";
import { BranchCards, BusinessRow, HowToGetSteps, MapCard, TermsAccordion } from "@/components/offers/offer-sections";
import { ReviewList } from "@/components/offers/reviews";
import { SaveBarButton, SaveTextButton } from "@/components/offers/save-button";
import { ShareButton } from "@/components/offers/share-button";
import { TrackedAnchor, TrackOfferView } from "@/components/offers/track";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClass } from "@/components/ui/button";
import { DetailRow } from "@/components/ui/display";
import { RatingInline } from "@/components/ui/rating";
import { IconLink } from "@/components/ui/icon-button";
import { SectionTabs } from "@/components/ui/section-tabs";
import { getBusiness, getCategory, getOffer, getOfferReviews, getSimilarOffers } from "@/lib/data";
import { formatRange, formatRupees } from "@/lib/format";
import { getLocale, getT } from "@/lib/i18n/server";
import { breadcrumbLd, JsonLd, offerLd, pageMetadata } from "@/lib/seo";
import { cn, directionsHref } from "@/lib/utils";
import { offerPath, shopPath } from "@/lib/paths";

export async function offerMetadata(slug: string): Promise<Metadata> {
  const [t, locale, offer] = await Promise.all([getT(), getLocale(), getOffer(slug)]);
  if (!offer) notFound();
  const vars = { offer: offer.title, business: offer.businessName, area: offer.areaName };
  return pageMetadata({
    title: t("{offer} at {business}, {area}", vars),
    description: t("{offer} at {business}, {area}, Rajkot. Valid {dates}. See timings, terms and directions.", {
      ...vars,
      offer: offer.offerText,
      dates: formatRange(offer.validFrom, offer.validTo, locale),
    }),
    path: offerPath(offer),
    image: offer.images[0],
    // An ended offer stays reachable for old links but should not show up in search.
    noindex: offer.isExpired,
  });
}

async function OfferContent({ slug }: { slug: string }) {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const offer = await getOffer(slug);
  if (!offer) notFound();
  const [business, category, similar, reviews] = await Promise.all([
    getBusiness(offer.businessSlug),
    getCategory(offer.categorySlug),
    getSimilarOffers(offer),
    getOfferReviews(offer.id),
  ]);
  if (!business) notFound();

  const expired = offer.isExpired;
  const validity = `${formatRange(offer.validFrom, offer.validTo, locale)}${expired ? ` · ${t("Expired")}` : ""}`;
  const path = offerPath(offer);
  const geo = offer.geo ?? business.geo;
  const minSpend = offer.minSpend ? t("On bills of {amount} or more", { amount: formatRupees(offer.minSpend) }) : null;
  const images = [...new Set(offer.images)];
  const hasCode = !expired && offer.redemptionMode !== "walk_in";

  const badge = (
    <Badge variant={expired ? "expired" : "offer"} size="md">
      {expired ? t("Expired") : offer.badge}
    </Badge>
  );

  // One pin per outlet the offer is valid at; without that list, the shop's own outlets, else its address.
  const valid = offer.branches.filter((b) => b.geo);
  const several = valid.length > 1;
  const pins: MapOutlet[] = valid.length
    ? valid.map((b, i) => ({ id: b.id, name: several ? b.name : business.name, address: b.areaName, lat: b.geo!.lat, lng: b.geo!.lng, main: b.isMain, ...(several ? { number: i + 1 } : {}) }))
    : [{ id: business.id, name: business.name, address: offer.address, lat: geo.lat, lng: geo.lng, main: true }];
  if (!pins.some((pin) => pin.main)) pins[0] = { ...pins[0], main: true };

  // On a phone several outlets get a card each (the desktop has the map and its list); one outlet keeps the address card.
  const cardsOnPhone = offer.branches.length > 1;

  const crumbs = await breadcrumbLd([
    { name: t("Home"), path: "/" },
    { name: t("Offers"), path: "/offers" },
    ...(category ? [{ name: category.shortName, path: `/offers/${category.slug}` }] : []),
    { name: offer.title, path },
  ]);

  const mobileButtons = (
    <div className="absolute inset-x-4 top-4 lg:hidden">
      <IconLink href="/offers" variant="floating" size="lg" aria-label={t("Go back")}>
        <ArrowLeft size={20} aria-hidden />
      </IconLink>
    </div>
  );

  const details = (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-5">
        <DetailRow icon={Tag} label={t("Offer")}>
          {offer.offerText}
          {minSpend && <span className="mt-1 block font-semibold">{minSpend}</span>}
        </DetailRow>
        <DetailRow icon={CalendarDays} label={t("Validity")}>
          {validity}
        </DetailRow>
        <DetailRow icon={Clock} label={t("Timings")}>
          {offer.timings}
        </DetailRow>
        <DetailRow icon={MapPin} label={t("Address")}>
          {offer.address}
        </DetailRow>
        {offer.validAt.length > 0 && (
          <DetailRow icon={Store} label={t("Valid at")} className={cardsOnPhone ? "max-lg:hidden" : undefined}>
            <ul>
              {offer.validAt.map((branch) => (
                <li key={branch}>{branch}</li>
              ))}
            </ul>
          </DetailRow>
        )}
      </div>
      {cardsOnPhone ? (
        <BranchCards branches={offer.branches} offerId={offer.id} className="lg:hidden" />
      ) : (
        <MapCard address={offer.address} geo={geo} offerId={offer.id} className="lg:hidden" />
      )}
    </div>
  );

  return (
    <div className="lg:bg-surface lg:pt-6 lg:pb-16">
      <JsonLd data={await offerLd(offer, business)} />
      {!expired && <TrackOfferView offerId={offer.id} />}
      <JsonLd data={crumbs} />
      {expired && (
        <div role="status" className="bg-surface px-5 py-3 text-center text-sm font-medium text-muted lg:mb-6 lg:rounded-2xl">
          {t("This offer has ended")}
        </div>
      )}

      <Container className="px-0 lg:px-5">
        <div className="hidden lg:mb-4 lg:block">
          <Breadcrumb
            items={[
              { href: "/", label: t("Home") },
              { href: "/offers", label: t("Offers") },
              ...(category ? [{ href: `/categories/${category.slug}`, label: category.shortName }] : []),
            ]}
          />
        </div>
        <div className="overflow-hidden lg:rounded-2xl lg:border lg:border-line lg:bg-white">
          <PhotoMosaic images={images} alt={offer.title} linked={false}>
            <div className={cn("absolute bottom-4 left-4", expired && "opacity-80")}>{badge}</div>
            {mobileButtons}
          </PhotoMosaic>
          <div className="flex flex-col gap-3 px-5 pt-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:px-8 lg:py-6">
            <div className="flex min-w-0 items-start gap-4 lg:items-center">
              {/* On a phone the shop card below shows the logo. */}
              <ShopAvatar logo={business.logo} className="hidden size-20 shrink-0 lg:flex" />
              <div className="min-w-0">
                <h1 className={cn("text-[22px] leading-snug font-semibold lg:text-[28px] lg:leading-tight", expired && "text-muted")}>{offer.title}</h1>
                {/* On a phone the shop card below says whose offer it is, so only the rating stays here. */}
                <p className={cn("mt-1 flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted lg:flex lg:text-[15px]", offer.rating ? "flex" : "hidden")}>
                  <Link href={shopPath(business.slug)} className="hidden font-medium text-ink hover:underline lg:inline">
                    {business.name}
                  </Link>
                  <span aria-hidden className="hidden lg:inline">
                    •
                  </span>
                  <span className="hidden lg:inline">{t("{area}, Rajkot", { area: offer.areaName })}</span>
                  {offer.rating && <RatingInline rating={offer.rating} className="text-sm text-muted" />}
                </p>
              </div>
            </div>
            <div className="hidden shrink-0 items-center gap-3 lg:flex">
              {expired ? (
                <>
                  <Button size="sm" disabled>
                    {t("Offer expired")}
                  </Button>
                </>
              ) : (
                <>
                  <ContactLink business={business.slug} kind="call" number={business.phone} masked={business.contactMasked} offerId={offer.id} className={buttonClass({ size: "sm" })}>
                    <Phone size={18} aria-hidden />
                    {t("Call")}
                  </ContactLink>
                  <ContactLink business={business.slug} kind="whatsapp" number={business.whatsapp} masked={business.contactMasked} offerId={offer.id} className={buttonClass({ variant: "whatsapp", size: "sm" })}>
                    <WhatsAppIcon size={18} />
                    WhatsApp
                  </ContactLink>
                </>
              )}
              <TrackedAnchor href={directionsHref(geo.lat, geo.lng)} target="_blank" rel="noreferrer" offerId={offer.id} event="directions" className={buttonClass({ variant: "outline", size: "sm" })}>
                <Navigation size={18} aria-hidden />
                {t("Directions")}
              </TrackedAnchor>
              <ShareButton title={offer.title} path={path} variant="pill" offerId={offer.id} />
              <SaveTextButton slug={offer.slug} variant="outline" />
            </div>
          </div>
        </div>
      </Container>

      <Container className="lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-6">
        <div className="mt-6 flex min-w-0 flex-col gap-6 lg:gap-8 lg:rounded-2xl lg:border lg:border-line lg:bg-white lg:pb-8">
          {/* On a phone the shop comes before the tabs; on desktop it is a card in the side column. */}
          <section className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-4 lg:hidden">
            <BusinessRow slug={business.slug} name={business.name} area={offer.areaName} logo={business.logo} />
            <ContactRow contact={{ ...business, geo }} disabled={expired} offerId={offer.id} />
          </section>
          <SectionTabs
            label={t("Page sections")}
            topBar={
              <div className="flex h-full items-center justify-between gap-1 border-b border-line px-2">
                <IconLink href="/offers" variant="plain" size="lg" aria-label={t("Go back")}>
                  <ArrowLeft size={22} aria-hidden />
                </IconLink>
                <p className="min-w-0 flex-1 truncate text-base font-semibold">{offer.title}</p>
                <span className="size-10 shrink-0" aria-hidden />
              </div>
            }
            items={[
              { value: "details", label: t("Details"), content: details },
              { value: "how", label: t("How to get it"), content: <HowToGetSteps steps={offer.steps} /> },
              ...(offer.terms.length
                ? [{ value: "terms", label: t("Terms"), content: <TermsAccordion terms={offer.terms} /> }]
                : []),
              ...(reviews.total
                ? [
                    {
                      value: "reviews",
                      label: t("Reviews ({count})", { count: reviews.total }),
                      content: (
                        <ReviewList reviews={reviews.items} total={reviews.total} />
                      ),
                    },
                  ]
                : []),
            ]}
          />
          <p className="text-xs leading-relaxed text-faint lg:px-8">
            {t("Offer details are provided by the business. Please confirm with the store before you buy.")}
          </p>
        </div>

        {/* Desktop side cards; on a phone the same information sits in the tabs. */}
        <aside className="mt-6 hidden flex-col gap-6 lg:flex">
          {/* Validity, timings and minimum spend are in the Details tab; only the code needs its own card. */}
          {hasCode && (
            <section className="rounded-2xl border border-line bg-white p-6">
              <OfferCode offerId={offer.id} mode={offer.redemptionMode} />
            </section>
          )}
          <section className="overflow-hidden rounded-2xl border border-line bg-white">
            <OutletMap outlets={pins} className="h-[220px]" />
            <div className="flex flex-col gap-1 p-6">
              <p className="text-[15px] leading-relaxed font-medium">{offer.address}</p>
              {offer.validAt.length > 0 && (
                <ul className="text-sm text-muted">
                  {offer.validAt.map((branch) => (
                    <li key={branch}>{branch}</li>
                  ))}
                </ul>
              )}
            </div>
          </section>
          <section className="rounded-2xl border border-line bg-white p-6">
            <BusinessRow slug={business.slug} name={business.name} area={offer.areaName} logo={business.logo} />
          </section>
        </aside>
      </Container>

      {similar.length > 0 && (
        <section className="mt-10 bg-surface py-8 lg:mt-16 lg:py-0">
          <Container>
            <SectionHeader title={t("Similar offers")} />
            <OfferCarousel offers={similar} />
          </Container>
        </section>
      )}

      {/* Room for the mobile action bar. */}
      <div aria-hidden className={cn("lg:hidden", hasCode ? "h-48" : "h-28")} />
      <StickyActionBar
        lead={
          <>
            <SaveBarButton slug={offer.slug} />
            <ShareButton title={offer.title} path={path} variant="bar" offerId={offer.id} />
          </>
        }
      >
        {/* A code sits above the buttons so it stays in reach while the page scrolls. */}
        {hasCode && <OfferCode offerId={offer.id} mode={offer.redemptionMode} compact />}
      </StickyActionBar>
    </div>
  );
}

export function OfferDetailView({ slug }: { slug: string }) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <OfferContent slug={slug} />
    </Suspense>
  );
}
