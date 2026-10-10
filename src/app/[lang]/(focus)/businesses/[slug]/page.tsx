import type { Metadata } from "next";
import { Suspense } from "react";
import { DetailSkeleton } from "@/components/layout/page-skeleton";
import Image from "next/image";
import { Link } from "@/components/i18n/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Globe, MapPin, Phone, Store, Tag } from "lucide-react";
import { InstagramIcon } from "@/components/icons/brand";
import { ActionTiles, StickyActionBar } from "@/components/businesses/contact-actions";
import { HoursTable, OpenStatusPill } from "@/components/businesses/opening-hours";
import { Container } from "@/components/layout/container";
import { OfferCard } from "@/components/offers/offer-card";
import { MapCard } from "@/components/offers/offer-sections";
import { ShareButton } from "@/components/offers/share-button";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { DetailRow, Divider, EmptyState } from "@/components/ui/display";
import { IconLink } from "@/components/ui/icon-button";
import { Tabs } from "@/components/ui/tabs";
import { getBusiness, getBusinessOffers, getBusinessSlugs } from "@/lib/data";
import { getT } from "@/lib/i18n/server";
import { telHref } from "@/lib/utils";
import type { Business, OfferSummary } from "@/types";

export function generateStaticParams() {
  return getBusinessSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/businesses/[slug]">): Promise<Metadata> {
  const [t, business] = await Promise.all([getT(), params.then((p) => getBusiness(p.slug))]);
  if (!business) return {};
  return {
    title: business.name,
    description: t("{category} • {area}, Rajkot. {about}", {
      category: business.categoryName,
      area: business.areaName,
      about: business.about,
    }),
  };
}

function Avatar({ className }: { className?: string }) {
  return (
    <span className={`relative flex items-center justify-center rounded-full border-4 border-white bg-surface shadow-card ${className}`}>
      <Store size={32} strokeWidth={1.6} aria-hidden />
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
        <a href={telHref(business.phone)} className="hover:text-primary">
          {business.phone}
        </a>
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

async function SubmitOfferLink() {
  const t = await getT();
  return (
    <p className="text-sm text-muted">
      {t("Is this your business?")}{" "}
      <Link href="/submit-offer" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
        {t("Submit an offer")}
        <ArrowRight size={14} aria-hidden />
      </Link>
    </p>
  );
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
      <SubmitOfferLink />
    </div>
  );
}

async function InfoTab({ business }: { business: Business }) {
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
      <MapCard address={business.address} geo={business.geo} layout="split" />
      <section>
        <h2 className="mb-3 text-lg font-semibold lg:text-[22px]">{t("Photos")}</h2>
        <ul className="grid grid-cols-3 gap-2 lg:gap-4">
          {business.photos.map((src) => (
            <li key={src} className="relative aspect-square overflow-hidden rounded-xl bg-surface lg:aspect-[4/3]">
              <Image src={src} alt="" fill sizes="(min-width: 1024px) 270px, 33vw" className="object-cover" />
            </li>
          ))}
        </ul>
      </section>
      <div className="lg:hidden">
        <SubmitOfferLink />
      </div>
    </div>
  );
}

async function BusinessContent({ params }: Pick<PageProps<"/[lang]/businesses/[slug]">, "params">) {
  const t = await getT();
  const business = await getBusiness((await params).slug);
  if (!business) notFound();
  const { active, expired } = await getBusinessOffers(business.slug);
  const path = `/businesses/${business.slug}`;
  const subtitle = t("{category} • {area}, Rajkot", { category: business.categoryName, area: business.areaName });

  return (
    <>
      <Container className="px-0 lg:px-5 lg:pt-6">
        <div className="relative aspect-video overflow-hidden bg-surface lg:aspect-auto lg:h-80 lg:rounded-2xl">
          <Image src={business.cover} alt="" fill priority sizes="(min-width: 1240px) 1200px, 100vw" className="object-cover" />
          <div className="absolute inset-x-4 top-4 flex justify-between lg:inset-x-auto lg:top-auto lg:right-5 lg:bottom-5">
            <IconLink href="/offers" variant="floating" size="lg" aria-label={t("Go back")} className="lg:hidden">
              <ArrowLeft size={20} aria-hidden />
            </IconLink>
            <div className="lg:hidden">
              <ShareButton title={business.name} path={path} />
            </div>
            <div className="hidden lg:block">
              <ShareButton title={business.name} path={path} variant="pill" />
            </div>
          </div>
        </div>
      </Container>

      <Container className="pb-28 lg:grid lg:grid-cols-[340px_1fr] lg:items-start lg:gap-12 lg:pb-20">
        {/* Mobile identity block. */}
        <div className="flex flex-col gap-4 lg:hidden">
          <Avatar className="-mt-10 size-20" />
          <div>
            <h1 className="text-[26px] leading-tight font-semibold">{business.name}</h1>
            <p className="mt-1 text-sm text-muted">{subtitle}</p>
          </div>
          <OpenStatusPill hours={business.hours} className="self-start" />
          <ActionTiles contact={business} includeCall className="mt-1" />
        </div>

        {/* Desktop sidebar. */}
        <aside className="sticky top-6 -mt-12 hidden flex-col gap-5 rounded-2xl border border-line bg-white p-6 shadow-card lg:flex">
          <Avatar className="-mt-16 size-[88px]" />
          <div>
            <h1 className="text-[28px] leading-tight font-semibold">{business.name}</h1>
            <p className="mt-1 text-sm text-muted">{subtitle}</p>
          </div>
          <OpenStatusPill hours={business.hours} className="self-start" />
          <ButtonAnchor href={telHref(business.phone)} block>
            <Phone size={18} aria-hidden />
            {t("Call · {phone}", { phone: business.phone })}
          </ButtonAnchor>
          <ActionTiles contact={business} />
          <Divider />
          <InfoRows business={business} />
          <Divider />
          <HoursTable hours={business.hours} compact />
          <SubmitOfferLink />
        </aside>

        <Tabs
          className="mt-6 lg:mt-8"
          items={[
            {
              value: "offers",
              label: t("Offers ({count})", { count: active.length }),
              content: <OffersTab active={active} expired={expired} />,
            },
            { value: "info", label: t("Info"), content: <InfoTab business={business} /> },
          ]}
        />
      </Container>

      <StickyActionBar contact={business} layout="business" />
    </>
  );
}

export default function BusinessPage({ params }: PageProps<"/[lang]/businesses/[slug]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <BusinessContent params={params} />
    </Suspense>
  );
}
