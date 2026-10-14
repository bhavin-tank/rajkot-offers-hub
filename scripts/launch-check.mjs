#!/usr/bin/env node
/**
 * Launch check: is the API ready for the site, and does the deployed site work?
 * Read-only: it never logs in, claims or reveals anything, so it is safe against production.
 *
 *   pnpm check:launch --site https://rajkotoffershub.com --api https://v2-api.rajkotoffershub.com/api
 *   (or SITE_URL / RAJKOT_API_URL in the environment; --platform rajkot-offers on the shared host)
 *
 * Exits 1 when anything fails; warnings are listed but do not fail the run.
 */

const args = Object.fromEntries(
  process.argv.slice(2).flatMap((arg, i, all) => (arg.startsWith("--") ? [[arg.slice(2), all[i + 1]]] : [])),
);
const SITE = (args.site ?? process.env.SITE_URL ?? "").replace(/\/+$/, "");
const API = (args.api ?? process.env.RAJKOT_API_URL ?? "").replace(/\/+$/, "");
const PLATFORM = args.platform ?? process.env.RAJKOT_API_PLATFORM;

if (!SITE && !API) {
  console.error("Usage: pnpm check:launch --site <site url> --api <api url>   (either may be left out)");
  process.exit(2);
}

const results = [];
const record = (area, name, status, detail = "") => results.push({ area, name, status, detail });
const pass = (area, name, detail) => record(area, name, "pass", detail);
const warn = (area, name, detail) => record(area, name, "warn", detail);
const fail = (area, name, detail) => record(area, name, "fail", detail);

async function get(url, { json = false, headers = {} } = {}) {
  const started = Date.now();
  try {
    const response = await fetch(url, { headers: { Accept: json ? "application/json" : "text/html", ...headers }, redirect: "follow", signal: AbortSignal.timeout(20_000) });
    const body = json ? await response.json().catch(() => null) : await response.text();
    return { status: response.status, body, ms: Date.now() - started, url: response.url };
  } catch (error) {
    return { status: 0, body: null, ms: Date.now() - started, error: error.cause?.code ?? error.message };
  }
}

const api = (path) => get(`${API}${path}`, { json: true, headers: PLATFORM ? { "X-Platform": PLATFORM } : {} });
const reason = (r) => (r.status ? `HTTP ${r.status}` : `unreachable (${r.error})`);

/** A sample offer and shop from the live feed, for the detail checks. */
let sample = null;

async function checkApi() {
  const A = "API";
  const feed = await api("/promotions?per_page=1");
  if (feed.status !== 200 || !Array.isArray(feed.body?.data)) {
    fail(A, "Offer feed (GET /promotions)", `${reason(feed)}. Is redesign/platforms deployed and this host listed in platform_domains?`);
    return;
  }
  const total = feed.body.meta?.total ?? 0;
  if (total > 0) pass(A, "Offer feed", `${total} live offers`);
  else warn(A, "Offer feed", "0 live offers: the site will open empty. Shops add offers in the business app; admins approve them");
  sample = feed.body.data[0] ?? null;

  const areas = await api("/promotions/areas");
  if (areas.status !== 200) fail(A, "Areas (GET /promotions/areas)", `${reason(areas)}. Needs Laravel PR #278`);
  else if (!areas.body.data?.length) warn(A, "Areas", "no areas yet (no live offers with an address)");
  else pass(A, "Areas", `${areas.body.data.length} areas`);

  const categories = await api("/promotions/categories");
  if (categories.status === 200 && categories.body.data?.length) pass(A, "Categories", `${categories.body.data.length} categories`);
  else fail(A, "Categories (GET /promotions/categories)", categories.status === 200 ? "no categories: seed the platform's taxonomy" : reason(categories));

  const nearest = await api("/promotions?sort=nearest&lat=22.304&lng=70.802&per_page=1");
  if (nearest.status !== 200) fail(A, "Nearest sort", reason(nearest));
  else if (nearest.body.data.length && !("distance_km" in nearest.body.data[0])) warn(A, "Distance on cards", "no distance_km: Laravel PR #282 is not deployed");
  else pass(A, "Nearest sort and distance");

  const pincode = await api("/locations/pincodes/360005");
  if (pincode.status === 200 && pincode.body.data?.district?.slug === "rajkot") pass(A, "Pincode lookup", "360005 → Rajkot");
  else fail(A, "Pincode lookup (GET /locations/pincodes/360005)", pincode.status === 404 ? "not found: run `php artisan locations:import`" : reason(pincode));

  if (sample) {
    const detail = await api(`/promotions/${sample.id}`);
    if (detail.status === 200) pass(A, "Offer detail", sample.title);
    else fail(A, "Offer detail", reason(detail));
    const shop = await api(`/businesses/${sample.business.slug}`);
    if (shop.status === 200) pass(A, "Shop profile", sample.business.name);
    else fail(A, "Shop profile", reason(shop));
  }

  const slow = [feed, areas, categories].filter((r) => r.ms > 2000);
  if (slow.length) warn(A, "Speed", `${slow.length} read(s) took over 2 s`);
}

async function checkSite() {
  const S = "Site";
  const home = await get(`${SITE}/`);
  if (home.status !== 200) {
    fail(S, "Home page", `${reason(home)}. Is the site deployed and is RAJKOT_API_URL set?`);
    return;
  }
  pass(S, "Home page", `${home.ms} ms`);
  if (!SITE.startsWith("https://")) warn(S, "HTTPS", "the site URL is not https");

  const canonical = home.body.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/)?.[1];
  const siteHost = new URL(SITE).host;
  if (canonical && new URL(canonical).host !== siteHost) {
    fail(S, "Canonical domain", `pages point search engines at ${new URL(canonical).host}, not ${siteHost}: update site.url in src/lib/site.ts`);
  } else if (canonical) pass(S, "Canonical domain", siteHost);

  const pages = ["/offers", "/categories", "/how-it-works", "/contact", "/submit-offer", "/login", "/privacy", "/terms", "/saved"];
  for (const path of pages) {
    const page = await get(`${SITE}${path}`);
    if (page.status === 200) pass(S, path);
    else fail(S, path, reason(page));
  }

  if (sample) {
    const offer = await get(`${SITE}/offers/${sample.slug}-${sample.id}`);
    if (offer.status === 200 && offer.body.includes(sample.title.slice(0, 20))) pass(S, "Offer page", sample.title);
    else fail(S, "Offer page", offer.status === 200 ? "page loaded without the offer's title" : reason(offer));
    const shop = await get(`${SITE}/businesses/${sample.business.slug}`);
    if (shop.status === 200) pass(S, "Shop page", sample.business.name);
    else fail(S, "Shop page", reason(shop));
  } else if (API) {
    warn(S, "Offer and shop pages", "skipped: no live offer to open");
  }

  const missing = await get(`${SITE}/this-page-does-not-exist-launch-check`);
  if (missing.status === 404) pass(S, "Unknown pages are 404");
  else fail(S, "Unknown pages are 404", `got ${reason(missing)}`);

  const contact = await get(`${SITE}/contact`);
  if (contact.status === 200 && /98XXX|XXXXX/.test(contact.body)) fail(S, "Contact WhatsApp number", "still the placeholder: set site.whatsapp in src/lib/site.ts");
  else if (contact.status === 200) pass(S, "Contact WhatsApp number");

  const sitemap = await get(`${SITE}/sitemap.xml`);
  if (sitemap.status !== 200 || !sitemap.body.includes("<urlset")) fail(S, "Sitemap", reason(sitemap));
  else {
    const urls = sitemap.body.match(/<loc>/g)?.length ?? 0;
    const foreign = sitemap.body.match(/<loc>https?:\/\/([^/<]+)/)?.[1];
    if (foreign && foreign !== siteHost) fail(S, "Sitemap", `URLs use ${foreign}, not ${siteHost}`);
    else pass(S, "Sitemap", `${urls} URLs`);
  }

  const robots = await get(`${SITE}/robots.txt`);
  if (robots.status === 200 && /sitemap/i.test(robots.body)) pass(S, "robots.txt");
  else fail(S, "robots.txt", reason(robots));
}

if (API) await checkApi();
if (SITE) await checkSite();

const icon = { pass: "✓", warn: "!", fail: "✗" };
let area = "";
for (const r of results) {
  if (r.area !== area) {
    area = r.area;
    console.log(`\n${area}${area === "API" ? ` (${API})` : ` (${SITE})`}`);
  }
  console.log(`  ${icon[r.status]} ${r.name}${r.detail ? ` — ${r.detail}` : ""}`);
}
const count = (status) => results.filter((r) => r.status === status).length;
console.log(`\n${count("pass")} passed, ${count("warn")} warnings, ${count("fail")} failed`);
process.exit(count("fail") ? 1 : 0);
