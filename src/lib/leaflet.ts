import type { Map as LeafletMap } from "leaflet";

type Leaflet = typeof import("leaflet");

export const PIN_CRIMSON = "#e11654";
export const PIN_NAVY = "#041c32";

/** A teardrop pin; `main` pins are crimson and larger so they stand out from the rest. */
export function pinHtml(main: boolean, label: string | number | null) {
  const size = main ? 40 : 30;
  const fill = main ? PIN_CRIMSON : PIN_NAVY;
  return `<svg width="${size}" height="${size * 1.25}" viewBox="0 0 32 40" aria-hidden="true" style="filter:drop-shadow(0 3px 4px rgb(0 0 0 / .3))">
    <path d="M16 39C14 30 3 25 3 14a13 13 0 1 1 26 0c0 11-11 16-13 25Z" fill="${fill}" stroke="#fff" stroke-width="2.5"/>
    <circle cx="16" cy="14" r="${main ? 5.5 : 4.5}" fill="#fff"/>
    ${label ? `<text x="16" y="18" text-anchor="middle" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="${fill}">${label}</text>` : ""}
  </svg>`;
}

export function pinIcon(L: Leaflet, main: boolean, label: string | number | null = null) {
  return L.divIcon({
    html: pinHtml(main, label),
    className: "",
    iconSize: main ? [40, 50] : [30, 37],
    iconAnchor: main ? [20, 49] : [15, 37],
    popupAnchor: [0, main ? -46 : -34],
  });
}

/**
 * An OpenStreetMap map in `target`. The tiles' licence requires the credit, so it stays, folded
 * behind a small "i" that opens it.
 */
export function createMap(L: Leaflet, target: HTMLElement, creditsLabel: string): LeafletMap {
  const map = L.map(target, { zoomControl: true, attributionControl: false, scrollWheelZoom: false });
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);

  const credit = new L.Control({ position: "bottomright" });
  credit.onAdd = () => {
    const wrap = L.DomUtil.create("div");
    wrap.style.cssText = "display:flex;align-items:center;gap:6px;margin:0 8px 8px 0;font:11px/1.2 Inter,system-ui,sans-serif";
    const link = document.createElement("a");
    link.href = "https://www.openstreetmap.org/copyright";
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = "© OpenStreetMap contributors";
    link.style.cssText = `display:none;background:rgb(255 255 255 / .9);color:${PIN_NAVY};padding:4px 8px;border-radius:6px`;
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "i";
    button.setAttribute("aria-label", creditsLabel);
    button.setAttribute("aria-expanded", "false");
    button.style.cssText = `width:22px;height:22px;border-radius:50%;border:0;background:rgb(255 255 255 / .9);color:${PIN_NAVY};font:italic 700 12px Georgia,serif;cursor:pointer;box-shadow:0 1px 4px rgb(0 0 0 / .25)`;
    button.onclick = () => {
      const open = link.style.display === "none";
      link.style.display = open ? "block" : "none";
      button.setAttribute("aria-expanded", String(open));
    };
    wrap.append(link, button);
    L.DomEvent.disableClickPropagation(wrap);
    return wrap;
  };
  credit.addTo(map);
  return map;
}
