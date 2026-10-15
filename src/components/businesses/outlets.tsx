import { MapPin, Navigation } from "lucide-react";
import type { Outlet } from "@/types";
import { AccordionItem } from "@/components/ui/accordion";
import { buttonClass } from "@/components/ui/button";
import { RatingInline } from "@/components/ui/rating";
import { getT } from "@/lib/i18n/server";
import { directionsHref } from "@/lib/utils";
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

/** Compact outlet list for the desktop sidebar: numbered like the map's pins, each with its address and open status. */
export async function OutletSideCard({ outlets }: { outlets: Outlet[] }) {
  const t = await getT();
  const many = outlets.length > 1;
  return (
    <section className="rounded-2xl border border-line bg-white p-6">
      <h2 className="text-xs font-semibold tracking-[0.06em] text-muted uppercase">{many ? `${t("Outlets")} (${outlets.length})` : t("Address")}</h2>
      <ul className="mt-4 flex flex-col divide-y divide-line">
        {outlets.map((outlet, i) => (
          <li key={outlet.id} className="flex gap-3 py-4 first:pt-0 last:pb-0">
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
              <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-2">
                <OpenStatusPill hours={outlet.hours} />
                {outlet.geo && (
                  <a
                    href={directionsHref(outlet.geo.lat, outlet.geo.lng)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover"
                  >
                    <Navigation size={15} aria-hidden />
                    {t("Directions")}
                  </a>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
