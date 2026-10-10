import Link from "next/link";
import { ArrowRight, MapPin, Navigation, Store } from "lucide-react";
import type { OfferStep } from "@/types";
import { AccordionItem } from "@/components/ui/accordion";
import { ButtonAnchor } from "@/components/ui/button";
import { cn, directionsHref } from "@/lib/utils";

/** Store icon, name and area, linking to the business profile. */
export function BusinessRow({
  slug,
  name,
  area,
}: {
  slug: string;
  name: string;
  area: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface">
        <Store size={20} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold">{name}</p>
        <p className="truncate text-[13px] text-muted">{area}, Rajkot</p>
      </div>
      <Link
        href={`/businesses/${slug}`}
        className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline"
      >
        View store
        <ArrowRight size={15} aria-hidden />
      </Link>
    </div>
  );
}

/** "How to get this offer" box with numbered steps. */
export function HowToGetSteps({ steps }: { steps: OfferStep[] }) {
  return (
    <section className="rounded-2xl bg-surface p-5 lg:p-6">
      <h2 className="mb-4 text-base font-semibold lg:text-lg">How to get this offer</h2>
      <ol className="flex flex-col gap-3 lg:grid lg:grid-cols-3 lg:gap-4">
        {steps.map((step, i) => (
          <li key={step.text} className="flex items-center gap-3 text-[15px]">
            <span className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-white text-[13px] font-semibold">
              {i + 1}
            </span>
            {step.text}
          </li>
        ))}
      </ol>
    </section>
  );
}

export function TermsAccordion({ terms }: { terms: string[] }) {
  return (
    <AccordionItem variant="card" title="Terms and conditions" defaultOpen>
      <ul className="flex flex-col gap-2.5">
        {terms.map((term) => (
          <li key={term} className="flex gap-2.5 text-[13px] leading-relaxed text-muted lg:text-sm">
            <span aria-hidden className="mt-[9px] size-1 shrink-0 rounded-full bg-faint" />
            {term}
          </li>
        ))}
      </ul>
    </AccordionItem>
  );
}

/** Map placeholder with address and a directions button. */
export function MapCard({
  address,
  geo,
  layout = "stacked",
  className,
}: {
  address: string;
  geo: { lat: number; lng: number };
  layout?: "stacked" | "split";
  className?: string;
}) {
  return (
    <section
      aria-label="Map"
      className={cn(
        "overflow-hidden rounded-2xl border border-line",
        layout === "split" && "lg:grid lg:grid-cols-2",
        className,
      )}
    >
      <div className={cn("map-stripes relative flex h-[140px] items-center justify-center", layout === "split" && "lg:h-full lg:min-h-[180px]")}>
        <span className="flex size-9 items-center justify-center rounded-full bg-ink text-white shadow-float">
          <MapPin size={18} aria-hidden />
        </span>
      </div>
      <div className="flex flex-col items-start gap-3 p-4 lg:p-5">
        {layout === "split" && <p className="text-xs text-muted">Address</p>}
        <p className="text-sm leading-relaxed">{address}</p>
        <ButtonAnchor
          href={directionsHref(geo.lat, geo.lng)}
          target="_blank"
          rel="noreferrer"
          variant="outline"
          className="h-[38px] px-4 text-sm"
        >
          <Navigation size={16} aria-hidden />
          Get directions
        </ButtonAnchor>
      </div>
    </section>
  );
}
