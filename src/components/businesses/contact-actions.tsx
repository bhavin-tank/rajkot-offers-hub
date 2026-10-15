import { Navigation, Phone } from "lucide-react";
import { InstagramIcon, WhatsAppIcon } from "@/components/icons/brand";
import { TrackedAnchor } from "@/components/offers/track";
import { Button, buttonClass } from "@/components/ui/button";
import { getT } from "@/lib/i18n/server";
import { cn, directionsHref, instagramHref } from "@/lib/utils";
import { ContactLink } from "./contact-link";

interface Contact {
  slug: string;
  phone: string;
  whatsapp: string;
  contactMasked: boolean;
  geo: { lat: number; lng: number };
  instagram?: string;
}

const external = { target: "_blank", rel: "noreferrer" } as const;

const tileClass = "flex h-[72px] w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl bg-surface text-xs font-medium hover:bg-canvas";
const whatsappTileClass = "flex h-[72px] w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl bg-whatsapp-soft text-xs font-medium text-whatsapp-ink hover:bg-whatsapp/15";

/** Mobile bar fixed to the bottom of offer and business pages: WhatsApp, directions and call. */
export async function StickyActionBar({
  contact,
  disabled,
  offerId,
  children,
}: {
  contact: Contact;
  /** Shown above the buttons, inside the same bar (an offer's code). */
  children?: React.ReactNode;
  /** On an offer page: taps count towards that offer's stats. */
  offerId?: string;
  /** Expired offer: call and WhatsApp are disabled. */
  disabled?: boolean;
}) {
  const t = await getT();
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex flex-col gap-3 border-t border-line bg-white px-5 pt-3 pb-[max(20px,env(safe-area-inset-bottom))] lg:hidden">
      {children}
      <div className="flex gap-2.5">
        {disabled ? (
          <Button variant="outline" iconOnly disabled aria-label="WhatsApp">
            <WhatsAppIcon size={20} />
          </Button>
        ) : (
          <ContactLink business={contact.slug} kind="whatsapp" number={contact.whatsapp} masked={contact.contactMasked} offerId={offerId} className={buttonClass({ variant: "whatsappSolid", iconOnly: true })}>
            <WhatsAppIcon size={20} />
            <span className="sr-only">WhatsApp</span>
          </ContactLink>
        )}
        <TrackedAnchor
          href={directionsHref(contact.geo.lat, contact.geo.lng)}
          {...external}
          offerId={offerId}
          event="directions"
          className={buttonClass({ variant: "outline", className: "px-4" })}
        >
          <Navigation size={18} aria-hidden />
          {t("Directions")}
        </TrackedAnchor>
        {disabled ? (
          <Button disabled className="flex-1">
            {t("Offer expired")}
          </Button>
        ) : (
          <ContactLink business={contact.slug} kind="call" number={contact.phone} masked={contact.contactMasked} offerId={offerId} className={buttonClass({ className: "flex-1" })}>
            <Phone size={18} aria-hidden />
            {t("Call")}
          </ContactLink>
        )}
      </div>
    </div>
  );
}

/** Grey icon tiles (call, WhatsApp, directions, Instagram). */
export async function ActionTiles({ contact, includeCall, className }: { contact: Contact; includeCall?: boolean; className?: string }) {
  const t = await getT();
  const tiles: { label: string; icon: React.ReactNode; href?: string; contact?: "call" | "whatsapp"; ext?: boolean }[] = [
    ...(includeCall ? [{ label: t("Call"), icon: <Phone size={22} aria-hidden />, contact: "call" as const }] : []),
    { label: "WhatsApp", icon: <WhatsAppIcon size={22} />, contact: "whatsapp" },
    { label: t("Directions"), icon: <Navigation size={22} aria-hidden />, href: directionsHref(contact.geo.lat, contact.geo.lng), ext: true },
    ...(contact.instagram
      ? [{ label: "Instagram", icon: <InstagramIcon size={22} />, href: instagramHref(contact.instagram), ext: true }]
      : []),
  ];
  return (
    <ul className={cn("grid gap-2.5", tiles.length === 4 ? "grid-cols-4" : "grid-cols-3", className)}>
      {tiles.map((tile) => (
        <li key={tile.label}>
          {tile.contact ? (
            <ContactLink
              business={contact.slug}
              kind={tile.contact}
              number={tile.contact === "call" ? contact.phone : contact.whatsapp}
              masked={contact.contactMasked}
              className={tile.contact === "whatsapp" ? whatsappTileClass : tileClass}
            >
              {tile.icon}
              {tile.label}
            </ContactLink>
          ) : (
            <a href={tile.href} {...(tile.ext ? external : {})} className={tileClass}>
              {tile.icon}
              {tile.label}
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
