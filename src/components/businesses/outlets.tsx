import { ChevronDown, MapPin, Navigation, Phone } from "lucide-react";
import type { OpeningHours, Outlet } from "@/types";
import { WhatsAppIcon } from "@/components/icons/brand";
import { ShareButton } from "@/components/offers/share-button";
import { AccordionItem } from "@/components/ui/accordion";
import { buttonClass } from "@/components/ui/button";
import { RatingInline } from "@/components/ui/rating";
import { getT } from "@/lib/i18n/server";
import { directionsHref } from "@/lib/utils";
import { ContactLink } from "./contact-link";
import { HoursTable, OpenStatusPill } from "./opening-hours";

/** A chain's outlets: address, whether it is open now, weekly hours and directions for each. */
export async function OutletList({ outlets }: { outlets: Outlet[] }) {
  const t = await getT();
  return (
    <section aria-label={t("Outlets")}>
      <h2 className="mb-3 text-lg font-semibold lg:text-[22px]">
        {t("Outlets")} <span className="font-normal text-muted">({outlets.length})</span>
      </h2>
      <ul className="flex flex-col gap-3">
        {outlets.map((outlet) => (
          <li key={outlet.id} className="flex flex-col gap-3 rounded-2xl border border-line p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[15px] font-semibold">
                  {outlet.name}
                  {outlet.isMain && !/main/i.test(outlet.name) && <span className="ml-2 text-xs font-medium text-muted">{t("Main outlet")}</span>}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{outlet.address}</p>
                {outlet.rating && <RatingInline rating={outlet.rating} className="mt-1.5 text-[13px] text-muted" />}
              </div>
              {outlet.geo && (
                <a
                  href={directionsHref(outlet.geo.lat, outlet.geo.lng)}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonClass({ variant: "outline", className: "h-[38px] shrink-0 px-3.5 text-sm" })}
                >
                  <Navigation size={16} aria-hidden />
                  {t("Directions")}
                </a>
              )}
            </div>
            <OpenStatusPill hours={outlet.hours} className="self-start" />
            <AccordionItem variant="card" title={t("Opening hours")}>
              <HoursTable hours={outlet.hours} compact />
            </AccordionItem>
          </li>
        ))}
      </ul>
    </section>
  );
}

interface SideContact {
  slug: string;
  name: string;
  phone: string;
  whatsapp: string;
  contactMasked: boolean;
  geo: { lat: number; lng: number };
  hours: OpeningHours[];
}

/**
 * Desktop sidebar: one card per outlet, numbered like the map's pins. Each has its address, whether it is open,
 * four icon buttons (call, WhatsApp, directions, share) and its weekly hours folded away until opened.
 */
export async function OutletSideCards({ outlets, contact, path }: { outlets: Outlet[]; contact: SideContact; path: string }) {
  const t = await getT();
  const many = outlets.length > 1;
  const iconClass = (variant: "primary" | "outline" | "whatsapp") => buttonClass({ variant, size: "sm", block: true, className: "px-0" });
  return (
    <>
      {outlets.map((outlet, i) => {
        const geo = outlet.geo ?? contact.geo;
        const hours = outlet.hours.length ? outlet.hours : contact.hours;
        return (
          <section key={outlet.id} className="overflow-hidden rounded-2xl border border-line bg-white">
            <div className="flex flex-col gap-4 p-6">
              <div className="flex gap-3">
                {many ? (
                  <span aria-hidden className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">
                    {i + 1}
                  </span>
                ) : (
                  <MapPin size={20} aria-hidden className="mt-0.5 shrink-0 text-muted" />
                )}
                <div className="min-w-0 flex-1">
                  {many && (
                    <p className="text-[15px] font-semibold">
                      {outlet.name}
                      {outlet.isMain && !/main/i.test(outlet.name) && <span className="ml-2 text-xs font-medium text-muted">{t("Main outlet")}</span>}
                    </p>
                  )}
                  <p className={many ? "mt-0.5 text-sm leading-relaxed text-muted" : "text-[15px] leading-relaxed font-medium"}>{outlet.address}</p>
                </div>
              </div>
              <OpenStatusPill hours={hours} className="self-start" />
              <div className="grid grid-cols-4 gap-2">
                <ContactLink business={contact.slug} kind="call" number={contact.phone} masked={contact.contactMasked} className={iconClass("primary")}>
                  <Phone size={18} aria-hidden />
                  <span className="sr-only">{t("Call")}</span>
                </ContactLink>
                <ContactLink business={contact.slug} kind="whatsapp" number={contact.whatsapp} masked={contact.contactMasked} className={iconClass("whatsapp")}>
                  <WhatsAppIcon size={18} />
                  <span className="sr-only">WhatsApp</span>
                </ContactLink>
                <a href={directionsHref(geo.lat, geo.lng)} target="_blank" rel="noreferrer" className={iconClass("outline")}>
                  <Navigation size={18} aria-hidden />
                  <span className="sr-only">{t("Directions")}</span>
                </a>
                <ShareButton title={contact.name} path={path} variant="tile" />
              </div>
            </div>
            <details className="group border-t border-line">
              <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-4 text-sm font-semibold [&::-webkit-details-marker]:hidden">
                {t("Hours")}
                <ChevronDown aria-hidden className="size-[18px] text-muted transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-6 pb-5">
                <HoursTable hours={hours} compact />
              </div>
            </details>
          </section>
        );
      })}
    </>
  );
}
