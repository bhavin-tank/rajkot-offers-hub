export const site = {
  name: "Rajkot Offers Hub",
  city: "રાજકોટ",
  tagline: "રાજકોટની સ્થાનિક ઓફર્સ, એક જ જગ્યાએ.",
  domain: "rajkotoffers.in",
  url: "https://rajkotoffers.in",
  instagram: "@rajkotoffershub",
  email: "hello@rajkotoffers.in",
  whatsapp: "+91 98XXX XXXXX",
  location: "રાજકોટ, ગુજરાત",
} as const;

export const mainNav = [
  { href: "/", label: "હોમ" },
  { href: "/offers", label: "ઓફર્સ" },
  { href: "/categories", label: "કેટેગરી" },
  { href: "/how-it-works", label: "કેવી રીતે કામ કરે છે" },
] as const;

export const footerNav = [...mainNav, { href: "/contact", label: "સંપર્ક" }] as const;
