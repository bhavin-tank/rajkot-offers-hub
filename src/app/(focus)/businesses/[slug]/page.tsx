import type { Metadata } from "next";
import { Suspense } from "react";
import { DetailSkeleton } from "@/components/layout/page-skeleton";
import Image from "next/image";
import Link from "next/link";
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
import { telHref } from "@/lib/utils";
import type { Business, OfferSummary } from "@/types";

export function generateStaticParams() {
  return getBusinessSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/businesses/[slug]">): Promise<Metadata> {
  const business = await getBusiness((await params).slug);
  if (!business) return {};
  return {
    title: business.name,
    description: `${business.categoryName} • ${business.areaName}, રાજકોટ. ${business.about}`,
  };
}

function Avatar({ className }: { className?: string }) {
  return (
    <span className={`flex items-center justify-center rounded-full border-4 border-white bg-surface shadow-card ${className}`}>
      <Store size={32} strokeWidth={1.6} aria-hidden />
    </span>
  );
}

function InfoRows({ business }: { business: Business }) {
  return (
    <div className="flex flex-col gap-4">
      <DetailRow icon={MapPin} label="સરનામું">
        {business.address}
      </DetailRow>
      <DetailRow icon={Phone} label="ફોન">
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
        <DetailRow icon={Globe} label="વેબસાઇટ">
          {business.website}
        </DetailRow>
      )}
    </div>
  );
}

function SubmitOfferLink() {
  return (
    <p className="text-sm text-muted">
      આ તમારો બિઝનેસ છે?{" "}
      <Link href="/submit-offer" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
        ઓફર સબમિટ કરો
        <ArrowRight size={14} aria-hidden />
      </Link>
    </p>
  );
}

function OffersTab({ active, expired }: { active: OfferSummary[]; expired: OfferSummary[] }) {
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
          title="હાલમાં કોઈ ચાલુ ઓફર નથી"
          hint="નવી ઓફર આવે ત્યારે અહીં દેખાશે."
          action={
            <ButtonLink href="/offers" variant="outline" className="h-11">
              બીજી ઓફર્સ જુઓ
            </ButtonLink>
          }
        />
      )}
      {expired.length > 0 && (
        <section>
          <h2 className="mb-4 text-xs font-semibold tracking-[0.04em] text-muted">પૂરી થયેલી ઓફર્સ</h2>
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

function InfoTab({ business }: { business: Business }) {
  return (
    <div className="flex flex-col gap-7 pt-5 lg:pt-8">
      <section>
        <h2 className="mb-2 text-lg font-semibold lg:text-[22px]">અમારા વિશે</h2>
        <p className="max-w-[640px] text-[15px] leading-relaxed text-muted lg:text-base">{business.about}</p>
      </section>
      <div className="lg:hidden">
        <InfoRows business={business} />
      </div>
      <section className="lg:hidden">
        <h2 className="mb-3 text-lg font-semibold">સમય</h2>
        <HoursTable hours={business.hours} />
      </section>
      <MapCard address={business.address} geo={business.geo} layout="split" />
      <section>
        <h2 className="mb-3 text-lg font-semibold lg:text-[22px]">ફોટા</h2>
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

async function BusinessContent({ params }: Pick<PageProps<"/businesses/[slug]">, "params">) {
  const business = await getBusiness((await params).slug);
  if (!business) notFound();
  const { active, expired } = await getBusinessOffers(business.slug);
  const path = `/businesses/${business.slug}`;
  const subtitle = `${business.categoryName} • ${business.areaName}, રાજકોટ`;

  return (
    <>
      <Container className="px-0 lg:px-5 lg:pt-6">
        <div className="relative aspect-video overflow-hidden bg-surface lg:aspect-auto lg:h-80 lg:rounded-2xl">
          <Image src={business.cover} alt="" fill priority sizes="(min-width: 1240px) 1200px, 100vw" className="object-cover" />
          <div className="absolute inset-x-4 top-4 flex justify-between lg:inset-x-auto lg:top-auto lg:right-5 lg:bottom-5">
            <IconLink href="/offers" variant="floating" size="lg" aria-label="પાછળ જાઓ" className="lg:hidden">
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
            કૉલ કરો · {business.phone}
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
              label: `ઓફર્સ (${active.length})`,
              content: <OffersTab active={active} expired={expired} />,
            },
            { value: "info", label: "માહિતી", content: <InfoTab business={business} /> },
          ]}
        />
      </Container>

      <StickyActionBar contact={business} layout="business" />
    </>
  );
}

export default function BusinessPage({ params }: PageProps<"/businesses/[slug]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <BusinessContent params={params} />
    </Suspense>
  );
}
