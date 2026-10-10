import type { MessageKey } from "@/lib/i18n/translate";

export const site = {
  name: "Rajkot Offers Hub",
  city: "Rajkot",
  tagline: "Local offers in Rajkot, all in one place.",
  domain: "rajkotoffers.in",
  url: "https://rajkotoffers.in",
  instagram: "@rajkotoffershub",
  email: "hello@rajkotoffers.in",
  whatsapp: "+91 98XXX XXXXX",
  location: "Rajkot, Gujarat",
} as const;

export const mainNav = [
  { href: "/", label: "Home" },
  { href: "/offers", label: "Offers" },
  { href: "/categories", label: "Categories" },
  { href: "/how-it-works", label: "How it works" },
] as const satisfies readonly { href: string; label: MessageKey }[];

export const footerNav = [...mainNav, { href: "/contact", label: "Contact" }] as const satisfies readonly {
  href: string;
  label: MessageKey;
}[];
