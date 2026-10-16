import { api, orUndefined } from "@/lib/api/client";
import { toBusiness } from "@/lib/api/mappers";
import type { BusinessResource, Page } from "@/lib/api/types";
import { toIsoDay } from "@/lib/format";
import type { Business } from "@/types";

/** A shop's public profile. Phone and WhatsApp come back masked for guests. */
export async function getBusiness(slug: string): Promise<Business | undefined> {
  const resource = await orUndefined(api<{ data: BusinessResource }>(`/businesses/${encodeURIComponent(slug)}`));
  return resource && toBusiness(resource.data);
}

/** Every listed shop's slug and when its profile last changed, for static params and the sitemap. */
export async function getBusinessIndex(): Promise<{ slug: string; updatedAt?: string }[]> {
  const shops: { slug: string; updatedAt?: string }[] = [];
  for (let page = 1; page <= 50; page++) {
    const result = await api<Page<{ slug: string; updated_at?: string }>>("/businesses", { query: { per_page: 100, page } });
    shops.push(...result.data.map((b) => ({ slug: b.slug, updatedAt: b.updated_at ? toIsoDay(new Date(b.updated_at)) : undefined })));
    if (page >= result.meta.last_page) break;
  }
  return shops;
}
