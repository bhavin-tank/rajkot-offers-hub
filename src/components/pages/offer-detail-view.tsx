import type { Metadata } from "next";
import { Suspense } from "react";
import { DetailSkeleton } from "@/components/layout/page-skeleton";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, MapPin, Phone, Tag } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/brand";
import { StickyActionBar } from "@/components/businesses/contact-actions";
import { Breadcrumb, Container, SectionHeader } from "@/components/layout/container";
import { OfferCarousel } from "@/components/offers/offer-card";
import { OfferGallery } from "@/components/offers/offer-gallery";
import { BusinessRow, HowToGetSteps, MapCard, TermsAccordion } from "@/components/offers/offer-sections";
import { SaveButton, SaveTextButton } from "@/components/offers/save-button";
import { ShareButton } from "@/components/offers/share-button";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonAnchor } from "@/components/ui/button";
import { DetailRow, Divider } from "@/components/ui/display";
import { IconLink } from "@/components/ui/icon-button";
import { getBusiness, getCategory, getOffer, getSimilarOffers } from "@/lib/data";
import { formatRange } from "@/lib/format";
import { getLocale, getT } from "@/lib/i18n/server";
import { cn, directionsHref, telHref, whatsappHref } from "@/lib/utils";

export async function offerMetadata(slug: string): Promise<Metadata> {
  const [t, offer] = await Promise.all([getT(), getOffer(slug)]);
  if (!offer) return {};
  return {
    title: offer.title,
    description: t("{business}, {area} — {offer}", {
      business: offer.businessName,
      area: offer.areaName,
      offer: offer.offerText,
    }),
    openGraph: { images: offer.images.slice(0, 1) },
  };
}

async function OfferContent({ slug }: { slug: string }) {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const offer = await getOffer(slug);
  if (!offer) notFound();
  const [business, category, similar] = await Promise.all([
    getBusiness(offer.businessSlug),
    getCategory(offer.categorySlug),
    getSimilarOffers(offer),
  ]);
  if (!business) notFound();

  const expired = offer.isExpired;
  const validity = `${formatRange(offer.validFrom, offer.validTo, locale)}${expired ? ` · ${t("Expired")}` : ""}`;
  const path = `/offers/${offer.slug}`;

  const badge = (
    <Badge variant={expired ? "expired" : "offer"} size="md">
      {expired ? t("Expired") : offer.badge}
    </Badge>
  );

  const titleBlock = (
    <>
      {category && (
        <Badge variant="neutral" size="xs" className="self-start">
          {category.shortName}
        </Badge>
      )}
      <h1 className={cn("text-[26px] leading-[1.3] font-semibold lg:text-[32px] lg:leading-tight", expired && "text-muted")}>
        {offer.title}
      </h1>
      <BusinessRow slug={business.slug} name={business.name} area={business.areaName} />
    </>
  );

  return (
    <>
      {expired && (
        <div role="status" className="bg-surface px-5 py-3 text-center text-sm font-medium text-muted">
          {t("This offer has ended")}
        </div>
      )}

      <Container className="px-0 pb-8 lg:px-5 lg:pt-6 lg:pb-20">
        <div className="hidden lg:mb-6 lg:block">
          <Breadcrumb
            items={[
              { href: "/", label: t("Home") },
              { href: "/offers", label: t("Offers") },
              ...(category ? [{ href: `/categories/${category.slug}`, label: category.shortName }] : []),
            ]}
          />
        </div>

        <div className="lg:grid lg:grid-cols-[3fr_2fr] lg:items-start lg:gap-12">
          <div className="flex flex-col">
            <OfferGallery
              images={offer.images}
              alt={offer.title}
              expired={expired}
              badge={badge}
              overlay={
                <div className="absolute inset-x-4 top-4 flex justify-between lg:hidden">
                  <IconLink href="/offers" variant="floating" size="lg" aria-label={t("Go back")}>
                    <ArrowLeft size={20} aria-hidden />
                  </IconLink>
                  <div className="flex gap-2">
                    <ShareButton title={offer.title} path={path} />
                    <SaveButton slug={offer.slug} size="lg" />
                  </div>
                </div>
              }
            />

            <div className="relative -mt-5 flex flex-col gap-4 rounded-t-3xl bg-white px-5 pt-6 lg:mt-8 lg:gap-6 lg:rounded-none lg:p-0">
              <div className="flex flex-col gap-4 lg:hidden">
                {titleBlock}
                <Divider />
              </div>

              <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-5">
                <DetailRow icon={Tag} label={t("Offer")}>
                  {offer.offerText}
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
              </div>

              <HowToGetSteps steps={offer.steps} />
              <TermsAccordion terms={offer.terms} />
              <MapCard address={offer.address} geo={business.geo} layout="split" />
              <p className="text-xs leading-relaxed text-faint">
                {t("Offer details are provided by the business. Please confirm with the store before you buy.")}
              </p>
            </div>
          </div>

          <aside className="sticky top-6 hidden flex-col gap-5 rounded-2xl border border-line bg-white p-7 shadow-card lg:flex">
            {titleBlock}
            <Divider />
            <div className="flex flex-col gap-2 text-sm">
              <p className="flex items-center gap-2">
                <CalendarDays size={16} className="text-muted" aria-hidden />
                {validity}
              </p>
              <p className="flex items-center gap-2">
                <Clock size={16} className="text-muted" aria-hidden />
                {offer.timings}
              </p>
            </div>
            {expired ? (
              <Button disabled block>
                {t("Offer expired")}
              </Button>
            ) : (
              <ButtonAnchor href={telHref(business.phone)} block>
                <Phone size={18} aria-hidden />
                {t("Call · {phone}", { phone: business.phone })}
              </ButtonAnchor>
            )}
            <div className="grid grid-cols-2 gap-2.5">
              {expired ? (
                <Button variant="outline" disabled>
                  <WhatsAppIcon size={18} />
                  WhatsApp
                </Button>
              ) : (
                <ButtonAnchor href={whatsappHref(business.whatsapp)} target="_blank" rel="noreferrer" variant="outline">
                  <WhatsAppIcon size={18} />
                  WhatsApp
                </ButtonAnchor>
              )}
              <ButtonAnchor
                href={directionsHref(business.geo.lat, business.geo.lng)}
                target="_blank"
                rel="noreferrer"
                variant="outline"
              >
                {t("Directions")}
              </ButtonAnchor>
            </div>
            <div className="flex justify-center gap-4">
              <SaveTextButton slug={offer.slug} />
              <ShareButton title={offer.title} path={path} variant="text" />
            </div>
          </aside>
        </div>
      </Container>

      {similar.length > 0 && (
        <section className="bg-surface py-8 lg:py-20">
          <Container>
            <SectionHeader title={t("Similar offers")} />
            <OfferCarousel offers={similar} />
          </Container>
        </section>
      )}

      {/* Room for the mobile action bar. */}
      <div aria-hidden className="h-24 lg:hidden" />
      <StickyActionBar contact={business} layout="offer" disabled={expired} />
    </>
  );
}

export function OfferDetailView({ slug }: { slug: string }) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <OfferContent slug={slug} />
    </Suspense>
  );
}
