"use client";

import Image from "next/image";
import { Link } from "@/components/i18n/link";
import { Clock, MapPin, Tag } from "lucide-react";
import type { ReactNode } from "react";
import type { OfferSummary } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/display";
import { RatingInline } from "@/components/ui/rating";
import { formatDistance, formatRupees, formatUntil } from "@/lib/format";
import { useLocale, useT } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import { SaveButton } from "./save-button";
import { offerPath } from "@/lib/paths";

interface OfferCardProps {
  offer: OfferSummary;
  /** Image sizes hint for next/image. */
  sizes?: string;
  priority?: boolean;
  /** Extra content under the card body (e.g. "expires soon" line). */
  footer?: ReactNode;
  className?: string;
}

/** The offer tile used in every list, grid and carousel. */
export function OfferCard({
  offer,
  sizes = "(min-width: 1024px) 380px, 100vw",
  priority,
  footer,
  className,
}: OfferCardProps) {
  const t = useT();
  const locale = useLocale();
  const expired = offer.isExpired;
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition-shadow hover:shadow-card",
        className,
      )}
    >
      <div className={cn("relative aspect-[16/9] overflow-hidden bg-surface sm:aspect-[4/3]", expired && "opacity-65 grayscale")}>
        <Image
          src={offer.images[0]}
          alt=""
          fill
          sizes={sizes}
          priority={priority}
          className={cn(
            "transition-transform duration-300 group-hover:scale-[1.03]",
            offer.imageIsLogo ? "object-contain p-8" : "object-cover",
          )}
        />
        <Badge variant={expired ? "expired" : "offer"} className="absolute top-3 left-3">
          {expired ? t("Expired") : offer.badge}
        </Badge>
      </div>
      <div className={cn("flex flex-col gap-1.5 px-4 pt-4 pb-[18px]", expired && "opacity-65")}>
        <h3 className="line-clamp-2 text-base leading-[1.45] font-semibold">
          <Link href={offerPath(offer)} className="after:absolute after:inset-0 after:content-['']">
            {offer.title}
          </Link>
        </h3>
        <p className="text-sm text-muted">
          {offer.businessName}
          {offer.distanceKm !== undefined && (
            <>
              {" · "}
              <span className="font-medium text-ink">{formatDistance(offer.distanceKm, t)}</span>
            </>
          )}
        </p>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] text-muted">
          <span className="inline-flex items-center gap-1">
            <MapPin size={14} aria-hidden />
            {offer.areaName}
          </span>
          <span aria-hidden className="text-line-strong">
            •
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock size={14} aria-hidden />
            {formatUntil(offer.validTo, locale)}
          </span>
          {offer.rating && (
            <>
              <span aria-hidden className="text-line-strong">
                •
              </span>
              <RatingInline rating={offer.rating} />
            </>
          )}
        </p>
        {offer.minSpend && (
          <p className="flex items-center gap-1 text-[13px] text-muted">
            <Tag size={14} aria-hidden />
            {t("On bills of {amount} or more", { amount: formatRupees(offer.minSpend) })}
          </p>
        )}
      </div>
      {footer && <div className="relative z-10 mt-auto px-4 pb-4">{footer}</div>}
      <SaveButton slug={offer.slug} className="absolute top-3 right-3 z-10" />
    </article>
  );
}

export function OfferCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <Skeleton className="aspect-[16/9] rounded-none sm:aspect-[4/3]" />
      <div className="flex flex-col gap-2.5 p-4">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3.5 w-2/5" />
        <Skeleton className="h-3 w-3/5" />
      </div>
    </div>
  );
}

/** Responsive grid: 1 column on mobile, 2 on tablet, 3 (or 4) on desktop. */
export function OfferGrid({
  offers,
  columns = 3,
  className,
}: {
  offers: OfferSummary[];
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6",
        columns === 3 && "lg:grid-cols-3",
        columns === 4 && "lg:grid-cols-4",
        className,
      )}
    >
      {offers.map((offer, i) => (
        <OfferCard
          key={offer.slug}
          offer={offer}
          priority={i < 2}
          sizes={
            columns === 4
              ? "(min-width: 1024px) 285px, (min-width: 640px) 50vw, 100vw"
              : "(min-width: 1024px) 384px, (min-width: 640px) 50vw, 100vw"
          }
        />
      ))}
    </div>
  );
}

export function OfferGridSkeleton({ count = 6, columns = 3 }: { count?: number; columns?: 3 | 4 }) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6", columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4")}>
      {Array.from({ length: count }, (_, i) => (
        <OfferCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Horizontal scroller on mobile; becomes a grid on desktop. */
export function OfferCarousel({ offers, desktopColumns = 4 }: { offers: OfferSummary[]; desktopColumns?: 3 | 4 }) {
  return (
    <div
      className={cn(
        "no-scrollbar -mx-5 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-1",
        "lg:mx-0 lg:grid lg:gap-6 lg:overflow-visible lg:px-0",
        desktopColumns === 4
          ? "lg:grid-cols-4 lg:[&>*:nth-child(n+5)]:hidden"
          : "lg:grid-cols-3 lg:[&>*:nth-child(n+4)]:hidden",
      )}
    >
      {offers.map((offer) => (
        <OfferCard
          key={offer.slug}
          offer={offer}
          sizes="(min-width: 1024px) 285px, 85vw"
          className="w-[85vw] max-w-[340px] shrink-0 snap-start lg:w-auto lg:max-w-none"
        />
      ))}
    </div>
  );
}
