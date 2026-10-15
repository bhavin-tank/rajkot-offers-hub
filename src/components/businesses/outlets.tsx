import { Navigation } from "lucide-react";
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
