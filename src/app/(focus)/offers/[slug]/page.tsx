import type { Metadata } from "next";
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
import { getBusiness, getCategory, getOffer, getOfferSlugs, getSimilarOffers } from "@/lib/data";
import { formatRange } from "@/lib/format";
import { cn, directionsHref, telHref, whatsappHref } from "@/lib/utils";

export function generateStaticParams() {
  return getOfferSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/offers/[slug]">): Promise<Metadata> {
  const offer = await getOffer((await params).slug);
  if (!offer) return {};
  return {
    title: offer.title,
    description: `${offer.businessName}, ${offer.areaName} — ${offer.offerText}`,
    openGraph: { images: offer.images.slice(0, 1) },
  };
}

export default async function OfferPage({ params }: PageProps<"/offers/[slug]">) {
  const offer = await getOffer((await params).slug);
  if (!offer) notFound();
  const [business, category, similar] = await Promise.all([
    getBusiness(offer.businessSlug),
    getCategory(offer.categorySlug),
    getSimilarOffers(offer),
  ]);
  if (!business) notFound();

  const expired = offer.isExpired;
  const validity = `${formatRange(offer.validFrom, offer.validTo)}${expired ? " · પૂરી થઈ" : ""}`;
  const path = `/offers/${offer.slug}`;

  const badge = (
    <Badge variant={expired ? "expired" : "offer"} size="md">
      {expired ? "પૂરી થઈ" : offer.badge}
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
          આ ઓફર પૂરી થઈ ગઈ છે
        </div>
      )}

      <Container className="px-0 pb-8 lg:px-5 lg:pt-6 lg:pb-20">
        <div className="hidden lg:mb-6 lg:block">
          <Breadcrumb
            items={[
              { href: "/", label: "હોમ" },
              { href: "/offers", label: "ઓફર્સ" },
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
                  <IconLink href="/offers" variant="floating" size="lg" aria-label="પાછળ જાઓ">
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
                <DetailRow icon={Tag} label="ઓફર">
                  {offer.offerText}
                </DetailRow>
                <DetailRow icon={CalendarDays} label="માન્યતા">
                  {validity}
                </DetailRow>
                <DetailRow icon={Clock} label="સમય">
                  {offer.timings}
                </DetailRow>
                <DetailRow icon={MapPin} label="સરનામું">
                  {offer.address}
                </DetailRow>
              </div>

              <HowToGetSteps steps={offer.steps} />
              <TermsAccordion terms={offer.terms} />
              <MapCard address={offer.address} geo={business.geo} layout="split" />
              <p className="text-xs leading-relaxed text-faint">
                ઓફરની વિગતો બિઝનેસ દ્વારા આપવામાં આવી છે. ખરીદી પહેલાં દુકાન પર ખાતરી કરો.
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
                ઓફર પૂરી થઈ
              </Button>
            ) : (
              <ButtonAnchor href={telHref(business.phone)} block>
                <Phone size={18} aria-hidden />
                કૉલ કરો · {business.phone}
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
                દિશા
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
            <SectionHeader title="આવી બીજી ઓફર્સ" />
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
