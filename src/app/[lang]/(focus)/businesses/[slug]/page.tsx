import type { Metadata } from "next";
import { Suspense } from "react";
import { DetailSkeleton } from "@/components/layout/page-skeleton";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Globe, MapPin, Navigation, Phone, Store, Tag } from "lucide-react";
import { InstagramIcon, WhatsAppIcon } from "@/components/icons/brand";
import { ActionTiles, StickyActionBar } from "@/components/businesses/contact-actions";
import { ContactLink } from "@/components/businesses/contact-link";
import { OutletList } from "@/components/businesses/outlets";
import { PhotoMosaic } from "@/components/businesses/photo-mosaic";
import { HoursTable, OpenStatusPill } from "@/components/businesses/opening-hours";
import { Container } from "@/components/layout/container";
import { OfferCard } from "@/components/offers/offer-card";
import { MapCard } from "@/components/offers/offer-sections";
import { ReviewList } from "@/components/offers/reviews";
import { ShareButton } from "@/components/offers/share-button";
import { ButtonLink, buttonClass } from "@/components/ui/button";
import { DetailRow, Divider, EmptyState } from "@/components/ui/display";
import { IconLink } from "@/components/ui/icon-button";
import { SectionTabs } from "@/components/ui/section-tabs";
import { getBusiness, getBusinessOffers, getBusinessReviews } from "@/lib/data";
import { getT } from "@/lib/i18n/server";
import { directionsHref } from "@/lib/utils";
import { breadcrumbLd, JsonLd, localBusinessLd, pageMetadata } from "@/lib/seo";
import type { Business, OfferSummary, Rating, Review } from "@/types";
import { RatingInline } from "@/components/ui/rating";

export async function generateMetadata({ params }: PageProps<"/[lang]/businesses/[slug]">): Promise<Metadata> {
  const [t, business] = await Promise.all([getT(), params.then((p) => getBusiness(p.slug))]);
  if (!business) notFound();
  const vars = { business: business.name, category: business.categoryName, area: business.areaName };
  return pageMetadata({
    title: t("{business}, {area}, Rajkot: offers, hours and address", vars),
    description: t("{category} • {area}, Rajkot. {about}", { ...vars, about: business.about }),
    path: `/businesses/${business.slug}`,
    image: business.cover,
  });
}

/** The shop's logo, or a store icon until it has one. */
function Avatar({ logo, className }: { logo?: string; className?: string }) {
  return (
    <span className={`relative flex items-center justify-center overflow-hidden rounded-full border-4 border-white bg-surface shadow-card ${className}`}>
      {logo ? <Image src={logo} alt="" fill sizes="96px" className="object-cover" /> : <Store size={32} strokeWidth={1.6} aria-hidden />}
    </span>
  );
}

async function InfoRows({ business }: { business: Business }) {
  const t = await getT();
  return (
    <div className="flex flex-col gap-4">
      <DetailRow icon={MapPin} label={t("Address")}>
        {business.address}
      </DetailRow>
      <DetailRow icon={Phone} label={t("Phone")}>
        <ContactLink business={business.slug} kind="call" number={business.phone} masked={business.contactMasked} className="cursor-pointer text-left hover:text-primary">
          {business.contactMasked ? `${business.phone} · ${t("Log in to see the number")}` : business.phone}
        </ContactLink>
      </DetailRow>
      {business.instagram && (
        <DetailRow icon={InstagramIcon} label="Instagram">
          {business.instagram}
        </DetailRow>
      )}
      {business.website && (
        <DetailRow icon={Globe} label={t("Website")}>
          {business.website}
        </DetailRow>
      )}
    </div>
  );
}

/** The shop's overall rating: its outlets' ratings combined, else the average of its few reviews. */
function overallRating(business: Business, reviews: { items: Review[]; total: number }): Rating | undefined {
  const rated = business.outlets.flatMap((o) => (o.rating ? [o.rating] : []));
  const count = rated.reduce((sum, r) => sum + r.count, 0);
  if (count) return { avg: rated.reduce((sum, r) => sum + r.avg * r.count, 0) / count, count };
  if (reviews.total && reviews.items.length === reviews.total) {
    return { avg: reviews.items.reduce((sum, r) => sum + r.rating, 0) / reviews.total, count: reviews.total };
  }
  return undefined;
}

async function OffersTab({ active, expired }: { active: OfferSummary[]; expired: OfferSummary[] }) {
  const t = await getT();
  return (
    <div className="flex flex-col gap-6 pt-5 lg:pt-8">
      {active.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6">
          {active.map((offer) => (
            <OfferCard key={offer.slug} offer={offer} sizes="(min-width: 1024px) 400px, 100vw" />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Tag}
          size="md"
          title={t("No live offers right now")}
          hint={t("New offers will appear here.")}
          action={
            <ButtonLink href="/offers" variant="outline" className="h-11">
              {t("Browse other offers")}
            </ButtonLink>
          }
        />
      )}
      {expired.length > 0 && (
        <section>
          <h2 className="mb-4 text-xs font-semibold tracking-[0.04em] text-muted">{t("Past offers")}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6">
            {expired.map((offer) => (
              <OfferCard key={offer.slug} offer={offer} sizes="(min-width: 1024px) 400px, 100vw" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

async function PhotosTab({ business, images }: { business: Business; images: string[] }) {
  const t = await getT();
  return (
    <div className="pt-5 lg:pt-8">
      <h2 className="mb-3 text-lg font-semibold lg:text-[22px]">{t("Photos")}</h2>
      <ul className="grid grid-cols-3 gap-2 lg:gap-4">
        {images.map((src) => (
          <li key={src} className="relative aspect-square overflow-hidden rounded-xl bg-surface lg:aspect-[4/3]">
            <Image src={src} alt={t("Photo of {business}", { business: business.name })} fill sizes="(min-width: 1024px) 270px, 33vw" className="object-cover" />
          </li>
        ))}
      </ul>
    </div>
  );
}

function OutletsTab({ business }: { business: Business }) {
  return (
    <div className="pt-5 lg:pt-8">
      {business.outlets.length > 1 ? (
        <OutletList outlets={business.outlets} />
      ) : (
        <MapCard address={business.address} geo={business.geo} layout="split" />
      )}
    </div>
  );
}

async function AboutTab({ business }: { business: Business }) {
  const t = await getT();
  return (
    <div className="flex flex-col gap-7 pt-5 lg:pt-8">
      <section>
        <h2 className="mb-2 text-lg font-semibold lg:text-[22px]">{t("About us")}</h2>
        <p className="max-w-[640px] text-[15px] leading-relaxed text-muted lg:text-base">{business.about}</p>
      </section>
      <div className="lg:hidden">
        <InfoRows business={business} />
      </div>
      <section className="lg:hidden">
        <h2 className="mb-3 text-lg font-semibold">{t("Hours")}</h2>
        <HoursTable hours={business.hours} />
      </section>
    </div>
  );
}

async function BusinessContent({ params }: Pick<PageProps<"/[lang]/businesses/[slug]">, "params">) {
  const t = await getT();
  const business = await getBusiness((await params).slug);
  if (!business) notFound();
  const [{ active, expired }, reviews] = await Promise.all([
    getBusinessOffers(business.slug),
    getBusinessReviews(business.id, business.outlets),
  ]);
  const path = `/businesses/${business.slug}`;
  const subtitle = t("{category} • {area}, Rajkot", { category: business.categoryName, area: business.areaName });

  const crumbs = await breadcrumbLd([
    { name: t("Home"), path: "/" },
    { name: business.categoryName, path: `/offers/${business.categorySlug}` },
    { name: business.name, path },
  ]);

  const images = [...new Set([business.cover, ...business.photos])];
  const rating = overallRating(business, reviews);
  const mobileButtons = (
    <div className="absolute inset-x-4 top-4 flex justify-between lg:hidden">
      <IconLink href="/offers" variant="floating" size="lg" aria-label={t("Go back")}>
        <ArrowLeft size={20} aria-hidden />
      </IconLink>
      <ShareButton title={business.name} path={path} />
    </div>
  );

  return (
    <div className="lg:bg-surface lg:pt-6 lg:pb-16">
      <JsonLd data={await localBusinessLd(business, active)} />
      <JsonLd data={crumbs} />
      <Container className="px-0 lg:px-5">
        <div className="overflow-hidden lg:rounded-2xl lg:border lg:border-line lg:bg-white lg:shadow-card">
          <PhotoMosaic images={images} alt={business.name}>
            {mobileButtons}
          </PhotoMosaic>
          <div className="flex flex-col gap-4 px-5 pt-5 lg:gap-5 lg:px-8 lg:py-7">
            <div className="flex items-start gap-4">
              <Avatar logo={business.logo} className="size-16 shrink-0 lg:size-[72px]" />
              <div className="min-w-0 flex-1">
                <h1 className="text-[26px] leading-tight font-semibold lg:text-[32px]">{business.name}</h1>
                <p className="mt-1 text-sm text-muted lg:text-[15px]">{subtitle}</p>
              </div>
              <div className="hidden lg:block">
                <ShareButton title={business.name} path={path} variant="pill" />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
              {rating && <RatingInline rating={rating} className="text-sm" />}
              <OpenStatusPill hours={business.hours} />
              {business.outlets.length > 1 && <span>{t("{count} outlets", { count: business.outlets.length })}</span>}
            </div>
            <ActionTiles contact={business} includeCall className="lg:hidden" />
            <div className="hidden gap-3 lg:flex">
              <ContactLink business={business.slug} kind="call" number={business.phone} masked={business.contactMasked} className={buttonClass({ className: "px-6" })}>
                <Phone size={18} aria-hidden />
                {t("Call")}
              </ContactLink>
              <ContactLink business={business.slug} kind="whatsapp" number={business.whatsapp} masked={business.contactMasked} className={buttonClass({ variant: "whatsapp", className: "px-5" })}>
                <WhatsAppIcon size={18} />
                WhatsApp
              </ContactLink>
              <a href={directionsHref(business.geo.lat, business.geo.lng)} target="_blank" rel="noreferrer" className={buttonClass({ variant: "outline", className: "px-5" })}>
                <Navigation size={18} aria-hidden />
                {t("Directions")}
              </a>
            </div>
          </div>
        </div>
      </Container>

      <Container className="pb-28 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-6 lg:pb-0">
        <div className="mt-6 min-w-0 lg:mt-6 lg:rounded-2xl lg:border lg:border-line lg:bg-white lg:px-8 lg:pb-4 lg:shadow-card">
          <SectionTabs
            label={t("Page sections")}
            topBar={
              <div className="flex h-full items-center justify-between gap-1 border-b border-line px-2">
                <IconLink href="/offers" variant="plain" size="lg" aria-label={t("Go back")}>
                  <ArrowLeft size={22} aria-hidden />
                </IconLink>
                <p className="min-w-0 flex-1 truncate text-base font-semibold">{business.name}</p>
                <ShareButton title={business.name} path={path} variant="plain" />
              </div>
            }
            items={[
              {
                value: "offers",
                label: t("Offers ({count})", { count: active.length }),
                content: <OffersTab active={active} expired={expired} />,
              },
              ...(images.length > 1 ? [{ value: "photos", label: t("Photos"), content: <PhotosTab business={business} images={images} /> }] : []),
              {
                value: "outlets",
                label: business.outlets.length > 1 ? t("Outlets") : t("Outlet"),
                content: <OutletsTab business={business} />,
              },
              { value: "about", label: t("About us"), content: <AboutTab business={business} /> },
              ...(reviews.total
                ? [
                    {
                      value: "reviews",
                      label: t("Reviews"),
                      content: (
                        <div className="pt-5 lg:pt-8">
                          <ReviewList reviews={reviews.items} total={reviews.total} />
                        </div>
                      ),
                    },
                  ]
                : []),
            ]}
          />
        </div>

        {/* Desktop side cards; on a phone this information sits under About us. */}
        <aside className="sticky top-6 hidden max-h-[calc(100dvh-3rem)] flex-col gap-6 overflow-y-auto lg:flex [scrollbar-width:none]">
          <section className="flex flex-col gap-5 rounded-2xl border border-line bg-white p-6 shadow-card">
            <h2 className="text-xs font-semibold tracking-[0.06em] text-muted uppercase">{t("Contact")}</h2>
            <ContactLink business={business.slug} kind="call" number={business.phone} masked={business.contactMasked} className={buttonClass({ block: true })}>
              <Phone size={18} aria-hidden />
              {business.contactMasked ? t("Call") : t("Call · {phone}", { phone: business.phone })}
            </ContactLink>
            <ActionTiles contact={business} />
            <Divider />
            <InfoRows business={business} />
          </section>
          <section className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-6 shadow-card">
            <h2 className="text-xs font-semibold tracking-[0.06em] text-muted uppercase">{t("Hours")}</h2>
            <HoursTable hours={business.hours} compact />
          </section>
        </aside>
      </Container>

      <StickyActionBar contact={business} />
    </div>
  );
}

export default function BusinessPage({ params }: PageProps<"/[lang]/businesses/[slug]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <BusinessContent params={params} />
    </Suspense>
  );
}
