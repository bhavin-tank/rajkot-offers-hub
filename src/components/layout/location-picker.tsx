"use client";

import { Check, ChevronDown, MapPin } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Link } from "@/components/i18n/link";
import { Sheet } from "@/components/ui/sheet";
import { splitLocale } from "@/lib/i18n/config";
import { useT } from "@/lib/i18n/client";
import { formatOfferCount } from "@/lib/format";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { AreaWithCount } from "@/types";

interface LocationPickerProps {
  areas: AreaWithCount[];
  /** Live offers across all of Rajkot. */
  total: number;
}

const pillClass =
  "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border bg-white pr-2.5 pl-2.5 text-[13px] font-medium lg:h-10 lg:px-3.5 lg:text-sm";

/**
 * Header city pill. Opens a list of Rajkot's areas; picking one filters
 * offers by it, "All Rajkot" clears the filter. The choice lives in the
 * URL (`?area=`), so it can be shared and needs no extra storage.
 */
export function LocationPicker(props: LocationPickerProps) {
  const t = useT();
  return (
    // Reading the query string needs a Suspense boundary; until it resolves the pill reads "Rajkot".
    <Suspense
      fallback={
        <button type="button" disabled className={cn(pillClass, "border-line")}>
          <MapPin size={15} aria-hidden />
          {t(site.city)}
          <ChevronDown size={14} className="text-muted" aria-hidden />
        </button>
      }
    >
      <Picker {...props} />
    </Suspense>
  );
}

function Picker({ areas, total }: LocationPickerProps) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selected = searchParams.getAll("area").flatMap((value) => value.split(",")).filter(Boolean);
  const single = selected.length === 1 ? areas.find((area) => area.slug === selected[0]) : undefined;
  const label = selected.length === 0 ? t(site.city) : single ? single.name : t("{count} areas", { count: selected.length });
  const narrowed = selected.length > 0;

  // Area filters work on the offers list and on category pages; anywhere else goes to the offers list.
  const { path } = splitLocale(pathname);
  const onFilterPage = path === "/offers" || path.startsWith("/categories/");

  function hrefFor(slug?: string) {
    const params = new URLSearchParams(onFilterPage ? searchParams.toString() : "");
    params.delete("area");
    params.delete("page");
    if (slug) params.set("area", slug);
    const query = params.toString();
    return `${onFilterPage ? path : "/offers"}${query ? `?${query}` : ""}`;
  }

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-label={t("Choose your area")}
        onClick={() => setOpen(true)}
        className={cn(pillClass, narrowed ? "border-primary text-primary" : "border-line hover:border-input")}
      >
        <MapPin size={15} aria-hidden />
        <span className="max-w-[110px] truncate lg:max-w-[200px]">{label}</span>
        <ChevronDown size={14} className={narrowed ? "" : "text-muted"} aria-hidden />
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title={t("Choose your area")}>
        <ul className="flex flex-col gap-0.5 pb-1">
          <AreaRow
            href={hrefFor()}
            selected={!narrowed}
            name={t("All Rajkot")}
            count={formatOfferCount(total, t)}
            onPick={() => setOpen(false)}
          />
          <li aria-hidden className="mx-3 my-1 h-px bg-line" />
          {areas.map((area) => (
            <AreaRow
              key={area.slug}
              href={hrefFor(area.slug)}
              selected={selected.length === 1 && selected[0] === area.slug}
              name={area.name}
              count={formatOfferCount(area.offerCount, t)}
              onPick={() => setOpen(false)}
            />
          ))}
        </ul>
      </Sheet>
    </>
  );
}

function AreaRow({
  href,
  selected,
  name,
  count,
  onPick,
}: {
  href: string;
  selected: boolean;
  name: string;
  count: string;
  onPick: () => void;
}) {
  return (
    <li>
      <Link
        href={href}
        scroll={false}
        aria-current={selected ? "true" : undefined}
        onClick={onPick}
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] transition-colors",
          selected ? "bg-primary-soft font-medium" : "hover:bg-surface",
        )}
      >
        {selected ? (
          <Check size={18} className="shrink-0 text-primary" aria-hidden />
        ) : (
          <MapPin size={18} className="shrink-0 text-faint" aria-hidden />
        )}
        <span className="flex-1">{name}</span>
        <span className={cn("text-[13px]", selected ? "text-primary" : "text-muted")}>{count}</span>
      </Link>
    </li>
  );
}
