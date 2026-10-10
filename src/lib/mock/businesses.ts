import type { OpeningHours } from "@/types";
import { img } from "./images";

export interface BusinessRecord {
  slug: string;
  name: string;
  categorySlug: string;
  areaSlug: string;
  cover: string;
  about: string;
  addressLine: string;
  instagram?: string;
  website?: string;
  hours?: OpeningHours[];
  photos?: string[];
  geo: { lat: number; lng: number };
}

/** Monday–Saturday 10:00–21:00, Sunday 11:00–19:00. */
export const defaultHours: OpeningHours[] = [0, 1, 2, 3, 4, 5, 6].map((day) =>
  day === 6
    ? { day, opens: "11:00", closes: "19:00" }
    : { day, opens: "10:00", closes: "21:00" },
);

const boutiquePhotos = [
  "photo-1441986300917-64674bd600d8",
  "photo-1434389677669-e08b4cac3105",
  "photo-1490481651871-ab68de25d43d",
  "photo-1558769132-cb1aea458c5e",
  "photo-1445205170230-053b83016050",
  "photo-1567401893414-76b7b1e5a7a5",
].map((id) => img(id, 500));

export const businesses: BusinessRecord[] = [
  {
    slug: "sample-boutique",
    name: "Sample Boutique",
    categorySlug: "fashion",
    areaSlug: "kalawad-road",
    cover: img("photo-1441986300917-64674bd600d8", 1600),
    about:
      "Women's kurtis, sarees and dress material in Rajkot since 2015. New designs every season, with options for everyday and festive wear.",
    addressLine: "12, Sample Complex, Kalawad Road",
    instagram: "@sampleboutique",
    website: "sampleboutique.in",
    photos: boutiquePhotos,
    geo: { lat: 22.2916, lng: 70.7711 },
  },
  {
    slug: "sample-cafe",
    name: "Sample Café",
    categorySlug: "food",
    areaSlug: "kalawad-road",
    cover: img("photo-1495474472287-4d71bcdd2085", 1600),
    about: "A small café on Kalawad Road for catching up with friends. Fresh coffee, sandwiches and desserts.",
    addressLine: "4, Sample Arcade, Kalawad Road",
    instagram: "@samplecafe",
    geo: { lat: 22.2898, lng: 70.7745 },
  },
  {
    slug: "sample-salon",
    name: "Sample Salon",
    categorySlug: "beauty",
    areaSlug: "race-course",
    cover: img("photo-1560066984-138dadb4c035", 1600),
    about: "Haircuts, hair spa and skin care services for men and women.",
    addressLine: "7, Sample Plaza, Race Course Road",
    instagram: "@samplesalon",
    geo: { lat: 22.3008, lng: 70.7916 },
  },
  {
    slug: "sample-dining",
    name: "Sample Dining",
    categorySlug: "food",
    areaSlug: "university-road",
    cover: img("photo-1504674900247-0877df9cc836", 1600),
    about: "Gujarati and Punjabi thalis for family dining.",
    addressLine: "21, Sample Heights, University Road",
    geo: { lat: 22.2885, lng: 70.7655 },
  },
  {
    slug: "sample-footwear",
    name: "Sample Footwear",
    categorySlug: "fashion",
    areaSlug: "150-feet-ring-road",
    cover: img("photo-1542291026-7eec264c27ff", 1600),
    about: "A large collection of sports, casual and formal footwear.",
    addressLine: "3, Sample Mall, 150 Feet Ring Road",
    geo: { lat: 22.2777, lng: 70.7766 },
  },
  {
    slug: "sample-electronics",
    name: "Sample Electronics",
    categorySlug: "electronics",
    areaSlug: "mavdi",
    cover: img("photo-1505740420928-5e560c06d30e", 1600),
    about: "Mobiles, earbuds and all accessories in one place.",
    addressLine: "9, Sample Market, Mavdi Main Road",
    geo: { lat: 22.2615, lng: 70.7843 },
  },
  {
    slug: "sample-fitness",
    name: "Sample Fitness",
    categorySlug: "fitness",
    areaSlug: "nana-mava",
    cover: img("photo-1534438327276-14e5300c3a48", 1600),
    about: "A gym with modern equipment and trainers. Open from 6 AM.",
    addressLine: "15, Sample Square, Nana Mava Road",
    hours: [0, 1, 2, 3, 4, 5, 6].map((day) =>
      day === 6
        ? { day, opens: null, closes: null }
        : { day, opens: "06:00", closes: "22:00" },
    ),
    geo: { lat: 22.2755, lng: 70.7671 },
  },
  {
    slug: "sample-jewellers",
    name: "Sample Jewellers",
    categorySlug: "fashion",
    areaSlug: "palace-road",
    cover: img("photo-1515562141207-7a88fb7ce338", 1600),
    about: "Traditional and new designs in silver and imitation jewellery.",
    addressLine: "18, Sample Bazaar, Palace Road",
    geo: { lat: 22.3016, lng: 70.8022 },
  },
  {
    slug: "sample-pizzeria",
    name: "Sample Pizzeria",
    categorySlug: "food",
    areaSlug: "gondal-road",
    cover: img("photo-1513104890138-7c749659a591", 1600),
    about: "Wood-fired pizzas and pasta. Takeaway and dine-in.",
    addressLine: "6, Sample Corner, Gondal Road",
    geo: { lat: 22.2803, lng: 70.8034 },
  },
  {
    slug: "sample-coffee-house",
    name: "Sample Coffee House",
    categorySlug: "food",
    areaSlug: "kalawad-road",
    cover: img("photo-1554118811-1e0d58224f24", 1600),
    about: "Known for cold coffee, shakes and brownies.",
    addressLine: "27, Sample Hub, Kalawad Road",
    geo: { lat: 22.2921, lng: 70.7689 },
  },
  {
    slug: "sample-spa",
    name: "Sample Spa",
    categorySlug: "beauty",
    areaSlug: "amin-marg",
    cover: img("photo-1540555700478-4be289fbecef", 1600),
    about: "Facials, cleanups and relaxing massages.",
    addressLine: "2, Sample Residency, Amin Marg",
    geo: { lat: 22.2862, lng: 70.7801 },
  },
  {
    slug: "sample-home-services",
    name: "Sample Home Services",
    categorySlug: "services",
    areaSlug: "raiya-road",
    cover: img("photo-1581578731548-c64695cc6952", 1600),
    about: "Professional cleaning for sofas, carpets and whole homes.",
    addressLine: "11, Sample Point, Raiya Road",
    geo: { lat: 22.3005, lng: 70.7712 },
  },
  {
    slug: "sample-bakery",
    name: "Sample Bakery",
    categorySlug: "food",
    areaSlug: "yagnik-road",
    cover: img("photo-1486427944299-d1955d23e34d", 1600),
    about: "Fresh cakes, cookies and bread. Custom cakes to order.",
    addressLine: "5, Sample Chowk, Yagnik Road",
    geo: { lat: 22.2953, lng: 70.7951 },
  },
  {
    slug: "sample-ice-cream",
    name: "Sample Ice Cream",
    categorySlug: "food",
    areaSlug: "raiya-road",
    cover: img("photo-1497034825429-c343d7c6a68f", 1600),
    about: "Ice cream and sundaes in 40+ flavours.",
    addressLine: "8, Sample Avenue, Raiya Road",
    geo: { lat: 22.3021, lng: 70.7735 },
  },
  {
    slug: "sample-sweets",
    name: "Sample Sweets",
    categorySlug: "festival",
    areaSlug: "yagnik-road",
    cover: img("photo-1567401893414-76b7b1e5a7a5", 1600),
    about: "Sweets, savouries and gift boxes for festivals.",
    addressLine: "14, Sample Lane, Yagnik Road",
    geo: { lat: 22.2961, lng: 70.7938 },
  },
  {
    slug: "sample-home-decor",
    name: "Sample Home Decor",
    categorySlug: "home",
    areaSlug: "150-feet-ring-road",
    cover: img("photo-1555041469-a586c61ea9bc", 1600),
    about: "Home decor, lighting and furniture.",
    addressLine: "20, Sample Center, 150 Feet Ring Road",
    geo: { lat: 22.2742, lng: 70.7781 },
  },
];
