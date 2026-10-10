import { Navigation, Phone } from "lucide-react";
import { InstagramIcon, WhatsAppIcon } from "@/components/icons/brand";
import { Button, ButtonAnchor } from "@/components/ui/button";
import { getT } from "@/lib/i18n/server";
import { cn, directionsHref, instagramHref, telHref, whatsappHref } from "@/lib/utils";

interface Contact {
  phone: string;
  whatsapp: string;
  geo: { lat: number; lng: number };
  instagram?: string;
}

const external = { target: "_blank", rel: "noreferrer" } as const;

/** Mobile bar fixed to the bottom of offer and business pages. */
export async function StickyActionBar({
  contact,
  layout,
  disabled,
}: {
  contact: Contact;
  /** "offer": WhatsApp icon + directions + call. "business": WhatsApp + call. */
  layout: "offer" | "business";
  /** Expired offer: call and WhatsApp are disabled. */
  disabled?: boolean;
}) {
  const t = await getT();
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2.5 border-t border-line bg-white px-5 pt-3 pb-[max(20px,env(safe-area-inset-bottom))] lg:hidden">
      {layout === "offer" ? (
        <>
          {disabled ? (
            <Button variant="outline" iconOnly disabled aria-label="WhatsApp">
              <WhatsAppIcon size={20} />
            </Button>
          ) : (
            <ButtonAnchor href={whatsappHref(contact.whatsapp)} {...external} variant="outline" iconOnly aria-label="WhatsApp">
              <WhatsAppIcon size={20} />
            </ButtonAnchor>
          )}
          <ButtonAnchor href={directionsHref(contact.geo.lat, contact.geo.lng)} {...external} variant="outline" className="px-4">
            <Navigation size={18} aria-hidden />
            {t("Directions")}
          </ButtonAnchor>
        </>
      ) : (
        <ButtonAnchor href={whatsappHref(contact.whatsapp)} {...external} variant="outline" className="flex-1">
          <WhatsAppIcon size={18} />
          WhatsApp
        </ButtonAnchor>
      )}
      {disabled ? (
        <Button disabled className="flex-1">
          {t("Offer expired")}
        </Button>
      ) : (
        <ButtonAnchor href={telHref(contact.phone)} className={cn(layout === "offer" ? "flex-1" : "flex-[1.4]")}>
          <Phone size={18} aria-hidden />
          {t("Call")}
        </ButtonAnchor>
      )}
    </div>
  );
}

/** Grey icon tiles (call, WhatsApp, directions, Instagram). */
export async function ActionTiles({ contact, includeCall, className }: { contact: Contact; includeCall?: boolean; className?: string }) {
  const t = await getT();
  const tiles = [
    ...(includeCall ? [{ label: t("Call"), icon: <Phone size={22} aria-hidden />, href: telHref(contact.phone), ext: false }] : []),
    { label: "WhatsApp", icon: <WhatsAppIcon size={22} />, href: whatsappHref(contact.whatsapp), ext: true },
    { label: t("Directions"), icon: <Navigation size={22} aria-hidden />, href: directionsHref(contact.geo.lat, contact.geo.lng), ext: true },
    ...(contact.instagram
      ? [{ label: "Instagram", icon: <InstagramIcon size={22} />, href: instagramHref(contact.instagram), ext: true }]
      : []),
  ];
  return (
    <ul className={cn("grid gap-2.5", tiles.length === 4 ? "grid-cols-4" : "grid-cols-3", className)}>
      {tiles.map((tile) => (
        <li key={tile.label}>
          <a
            href={tile.href}
            {...(tile.ext ? external : {})}
            className="flex h-[72px] flex-col items-center justify-center gap-1.5 rounded-2xl bg-surface text-xs font-medium hover:bg-canvas"
          >
            {tile.icon}
            {tile.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
