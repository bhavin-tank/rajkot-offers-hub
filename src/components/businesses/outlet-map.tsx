"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import { useT } from "@/lib/i18n/client";
import { cn, directionsHref } from "@/lib/utils";

export interface MapOutlet {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  /** The highlighted pin: the shop's main outlet. */
  main: boolean;
  /** Shown on the pin when the shop has several outlets, matching the outlet list beside the map. */
  number?: number;
}

/** A teardrop pin; the shop's main outlet is crimson and larger so it stands out from its other outlets. */
function pinHtml(main: boolean, number: number | null) {
  const size = main ? 40 : 30;
  const fill = main ? "#e11654" : "#041c32";
  return `<svg width="${size}" height="${size * 1.25}" viewBox="0 0 32 40" aria-hidden="true" style="filter:drop-shadow(0 3px 4px rgb(0 0 0 / .3))">
    <path d="M16 39C14 30 3 25 3 14a13 13 0 1 1 26 0c0 11-11 16-13 25Z" fill="${fill}" stroke="#fff" stroke-width="2.5"/>
    <circle cx="16" cy="14" r="${main ? 5.5 : 4.5}" fill="#fff"/>
    ${number ? `<text x="16" y="18" text-anchor="middle" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="${fill}">${number}</text>` : ""}
  </svg>`;
}

/**
 * OpenStreetMap showing the shop's outlets, the main one highlighted. Leaflet is only loaded
 * on screens wide enough to show the map (desktop), and only when the card scrolls into view.
 */
export function OutletMap({ outlets, className }: { outlets: MapOutlet[]; className?: string }) {
  const t = useT();
  const box = useRef<HTMLDivElement>(null);
  const directions = t("Directions");
  const mapCredits = t("Map credits");

  useEffect(() => {
    const el = box.current;
    if (!el || outlets.length === 0 || !window.matchMedia("(min-width: 1024px)").matches) return;

    let map: import("leaflet").Map | undefined;
    let cancelled = false;

    async function start(target: HTMLElement) {
      const L = (await import("leaflet")).default;
      if (cancelled) return;
      const instance = L.map(target, { zoomControl: true, attributionControl: false, scrollWheelZoom: false });
      map = instance;
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(instance);

      // OpenStreetMap's licence requires the credit, so it stays, folded behind a small "i" that opens it.
      const credit = new L.Control({ position: "bottomright" });
      credit.onAdd = () => {
        const wrap = L.DomUtil.create("div");
        wrap.style.cssText = "display:flex;align-items:center;gap:6px;margin:0 8px 8px 0;font:11px/1.2 Inter,system-ui,sans-serif";
        const link = document.createElement("a");
        link.href = "https://www.openstreetmap.org/copyright";
        link.target = "_blank";
        link.rel = "noreferrer";
        link.textContent = "© OpenStreetMap contributors";
        link.style.cssText = "display:none;background:rgb(255 255 255 / .9);color:#041c32;padding:4px 8px;border-radius:6px";
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = "i";
        button.setAttribute("aria-label", mapCredits);
        button.setAttribute("aria-expanded", "false");
        button.style.cssText = "width:22px;height:22px;border-radius:50%;border:0;background:rgb(255 255 255 / .9);color:#041c32;font:italic 700 12px Georgia,serif;cursor:pointer;box-shadow:0 1px 4px rgb(0 0 0 / .25)";
        button.onclick = () => {
          const open = link.style.display === "none";
          link.style.display = open ? "block" : "none";
          button.setAttribute("aria-expanded", String(open));
        };
        wrap.append(link, button);
        L.DomEvent.disableClickPropagation(wrap);
        return wrap;
      };
      credit.addTo(instance);

      const many = outlets.length > 1;
      const bounds = L.latLngBounds([]);
      let highlighted: import("leaflet").Marker | undefined;
      // The highlighted pin is drawn last so it sits above its neighbours.
      [...outlets].sort((a, b) => Number(a.main) - Number(b.main)).forEach((outlet) => {
        const number = outlet.number ?? null;
        const icon = L.divIcon({
          html: pinHtml(outlet.main, number),
          className: "",
          iconSize: outlet.main ? [40, 50] : [30, 37],
          iconAnchor: outlet.main ? [20, 49] : [15, 37],
          popupAnchor: [0, outlet.main ? -46 : -34],
        });
        const popup = document.createElement("div");
        const name = document.createElement("strong");
        name.textContent = outlet.name;
        const address = document.createElement("p");
        address.textContent = outlet.address;
        address.style.margin = "4px 0 6px";
        const link = document.createElement("a");
        link.href = directionsHref(outlet.lat, outlet.lng);
        link.target = "_blank";
        link.rel = "noreferrer";
        link.textContent = directions;
        link.style.color = "#e11654";
        link.style.fontWeight = "600";
        popup.append(name, address, link);
        const marker = L.marker([outlet.lat, outlet.lng], { icon, title: outlet.name, zIndexOffset: outlet.main ? 1000 : 0 }).addTo(instance).bindPopup(popup);
        if (outlet.main) highlighted = marker;
        bounds.extend([outlet.lat, outlet.lng]);
      });

      if (many) instance.fitBounds(bounds, { padding: [36, 36], maxZoom: 16 });
      else instance.setView(bounds.getCenter(), 15);
      // A shop with one outlet shows its name and address right away; with several, the crimson pin does the highlighting.
      if (!many) highlighted?.openPopup();
    }

    // Wait until the card is near the screen so the map's code and tiles are not fetched for nothing.
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();
        void start(el);
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);

    return () => {
      cancelled = true;
      observer.disconnect();
      map?.remove();
    };
  }, [outlets, directions, mapCredits]);

  return <div ref={box} role="region" aria-label={t("Map")} className={cn("relative isolate z-0 h-[260px] bg-surface map-stripes", className)} />;
}
