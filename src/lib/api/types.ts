/** Response shapes of the BSurefy API, as far as this site reads them. */

export interface Page<T> {
  data: T[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}

export interface Media {
  id: string;
  url: string;
  thumb_url: string | null;
}

export type PromotionType = "percent_off" | "amount_off" | "buy_x_get_y" | "free_gift" | "custom";
export type RedemptionMode = "walk_in" | "shared_code" | "unique_claim";
export type Lifecycle = "draft" | "pending_review" | "rejected" | "taken_down" | "paused" | "scheduled" | "live" | "ended" | "expired";

export interface BusinessCaption {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  area: string | null;
  logo_url: string | null;
}

export interface PromotionCard {
  id: string;
  business_id: string;
  title: string;
  slug: string;
  headline: string | null;
  value_label: string;
  type: PromotionType;
  discount_percent: number | null;
  redemption_mode: RedemptionMode;
  starts_at: string;
  ends_at: string;
  lifecycle: Lifecycle;
  is_available_now: boolean;
  is_featured: boolean;
  saves_count: number;
  is_saved: boolean;
  cover_url: string | null;
  cover_thumb_url: string | null;
  /** Only when the feed was sent lat/lng; null when the shop has no location. */
  distance_km?: number | null;
  created_at?: string;
  business: BusinessCaption;
}

export interface Branch {
  id: string;
  name: string;
  is_main: boolean;
  area: string | null;
  city: string | null;
  latitude: string | null;
  longitude: string | null;
}

export interface PromotionDetail extends PromotionCard {
  description: string | null;
  terms: string | null;
  discount_amount: number | null;
  buy_quantity: number | null;
  get_quantity: number | null;
  free_item: string | null;
  available_days: number[] | null;
  available_from: string | null;
  available_until: string | null;
  ended_at: string | null;
  categories: { id: string; slug: string; name: string }[];
  cover: Media | null;
  gallery: Media[];
  created_at: string;
  valid_at: Branch[];
  claim_refusal: string | null;
}

export interface Address {
  address_line1: string | null;
  address_line2: string | null;
  area: string | null;
  landmark: string | null;
  city: string | null;
  postal_code: string | null;
  latitude: string | null;
  longitude: string | null;
  is_primary: boolean;
}

export interface Phone {
  country_code: string;
  phone_number: string;
  full_number: string;
  is_primary: boolean;
  is_whatsapp: boolean;
  whatsapp_url: string | null;
}

export interface Link {
  type: "website" | "facebook" | "instagram" | "twitter" | "linkedin" | "youtube" | "google_maps" | "other";
  url: string;
}

export type BusinessHours = Partial<Record<"mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun", { open: string; close: string }[]>>;

export interface BusinessResource {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  business_hours: BusinessHours | null;
  categories: { id: string; slug: string; name: string; is_primary?: boolean }[];
  addresses: Address[];
  phones: Phone[];
  links: Link[];
  is_contact_masked: boolean;
  logo: Media | null;
  cover: Media | null;
  gallery: Media[];
  updated_at: string;
  live_promotions_count?: number;
}

export interface CategoryChip {
  id: string;
  slug: string;
  name: string;
  icon_url: string | null;
  promotions_count: number;
}

export interface AreaCount {
  slug: string;
  name: string;
  city: string | null;
  promotions_count: number;
}

export interface ApiUser {
  id: string;
  name: string | null;
  email: string | null;
  country_code: string | null;
  phone_number: string | null;
  phone_verified_at: string | null;
  mpin_required: boolean;
}

export interface TokenPair {
  user: ApiUser;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

/** `GET /locations/pincodes/{pincode}` (India Post data). */
export interface PincodeLookup {
  pincode: string;
  state: { code: string; name: string };
  district: { slug: string; name: string; city: string };
  city: string;
  latitude: number | null;
  longitude: number | null;
  areas: { name: string; office_type: string; is_delivery: boolean }[];
}
