# Rajkot Offers Hub

Local offers from shops, cafés and salons in Rajkot. Built with Next.js 16 (App Router, Cache Components), React 19, Tailwind CSS 4 and TypeScript.

## Run

The data comes from the BSurefy API (the `bsurefy-laravel` project), where Rajkot Offers is the
`rajkot-offers` platform. Offers, shops, categories, areas, login and moderation all live there;
shop owners use the separate business app. This site is the shoppers' web front end.

```bash
pnpm install
cp .env.example .env.local   # RAJKOT_API_URL (and MEDIA_PUBLIC_URL for the API's images)
pnpm dev
pnpm build      # needs the API: pages are prerendered from it
pnpm lint
pnpm typecheck
```

**Local API:** run `bsurefy-laravel` on `http://api.rajkotoffers.test:8000` (the host picks the
platform; `PLATFORM_HOSTS` must map `rajkot-offers=api.rajkotoffers.test` when seeding). In
`APP_ENV=local` the API returns login codes in its response, and this site shows them on the login
screen in development builds.

## Deploy (Cloudflare Workers)

The site runs on Cloudflare Workers through [OpenNext](https://opennext.js.org/cloudflare)
(`wrangler.jsonc`, `open-next.config.ts`). Prerendered pages and the "use cache" API reads are kept in
the R2 bucket `rajkot-offers-hub-cache`, with a Durable Object queue refreshing them in the background;
`next/image` resizes through Cloudflare Images.

**Once, from this folder** (`npx wrangler login` first):

```bash
npx wrangler r2 bucket create rajkot-offers-hub-cache
npx wrangler secret put API_FRONTEND_KEY      # the API's WEB_FRONTEND_KEY
```

**Deploy from Git (Workers Builds):** Cloudflare dashboard → Workers & Pages → Create → Import a
repository → `bsurefy-tech/rajkot-offers-hub`, then in the Worker's **Settings → Build**:

| Setting | Value |
|---|---|
| Production branch | `develop` (switch to `main` once releases go through it) |
| Build command | `pnpm exec opennextjs-cloudflare build` |
| Deploy command | `pnpm exec opennextjs-cloudflare deploy` |
| Build variables | `PNPM_VERSION=12.4.1` (the image defaults to pnpm 10), `RAJKOT_API_URL=https://v2-api.rajkotoffershub.com`, `MEDIA_PUBLIC_URL` (the API's public media URL, Laravel's `AWS_URL`), optional `NEXT_PUBLIC_OWNER_APP_ANDROID_URL` / `_IOS_URL` |

Pages are prerendered from the API during the build, so the build variables matter as much as the
runtime ones (`vars` in `wrangler.jsonc`, plus the `API_FRONTEND_KEY` secret). Then add the custom
domain `rajkotoffershub.com` under the Worker's **Settings → Domains & Routes**.

**From your machine:** `pnpm run deploy` (build and deploy) or `pnpm run upload` (a new version
without sending traffic to it). `pnpm preview` runs the built worker locally (copy `.dev.vars.example`
to `.dev.vars`).

- The worker is about 3 MB gzipped, above the free plan's 3 MB limit: the account needs Workers Paid.
- `patches/@opennextjs__cloudflare@1.20.10.patch` fixes a 500 on every page with Next.js 16.4
  (opennextjs-cloudflare#1448: `preview-props.json` was not bundled). Drop it, and the exact version
  pin, once a release includes the fix.
- `proxy.ts` runs as Node.js middleware, which OpenNext marks experimental on Cloudflare; it works
  here (language routing, 404s and session renewal were tested in workerd).

## Launch check

A read-only check of the API and the deployed site (it never logs in, claims or reveals anything):

```bash
pnpm check:launch --site https://rajkotoffershub.com --api https://v2-api.rajkotoffershub.com
```

It checks that the API serves the Rajkot platform (offers, areas, categories, nearest sort, pincode
lookup, an offer and a shop), and that the site's pages, an offer page, a shop page, 404s, the sitemap
and robots.txt work and point at the right domain. It exits 1 on any failure; warnings (no live offers
yet, PR #282 not deployed, slow reads) don't fail it. Either `--site` or `--api` can be left out.

## Structure

```
src/
  proxy.ts         locale routing: English at /, Gujarati at /gu (remembers the choice in a cookie)
  app/
    [lang]/        every route lives under the language segment (en | gu)
    [lang]/(main)/ browsing pages: header, footer and mobile tab bar
                   home, offers, categories, saved, contact, how-it-works, login, account
    [lang]/(focus)/ detail and task pages: desktop header only, each page draws its
                   own mobile top bar or action bar
                   offers/[slug], businesses/[slug], categories/[slug], submit-offer
    not-found.tsx  404
  components/
    ui/            design-system primitives with no domain knowledge
                   (button, chip, badge, field, input, checkbox, tabs, accordion, sheet, toast…)
    layout/        header, footer, nav, container, section headers, skeletons
    offers/        offer card, grid, carousel, filters, sort, gallery, share, save
    categories/    category tiles, banners, area pills
    businesses/    contact actions (numbers revealed after login), opening hours
    auth/          login (mobile → WhatsApp code or MPIN) and account forms
    marketing/     search bar, CTA, step and promise blocks
    icons/         brand and category icons
  assets/          brand logo (imported through next/image)
  hooks/           client hooks (saved offers in localStorage)
  lib/
    data/          cached data getters ("use cache"), the only API the pages use
    api/           BSurefy API client, response types, mappers to the site's types
    auth/          session cookies and renewal
    mock/          image URL helper for marketing images
    actions/       server actions
    filters.ts     offer filter options and URL query helpers
    format.ts      Dates, times and opening status
  types/           domain types
```

## How the site uses the API

| Site | API |
|---|---|
| Offer lists, filters, search, sort | `GET /promotions` (`category`, `areas`, `type`, `ends_within_days`, `sort`, `q`) |
| Offer page | `GET /promotions/{id}` — URLs are `/offers/<slug>-<id>` |
| Shop page, its live and past offers | `GET /businesses/{slug}`, `GET /promotions?business=` (`&lifecycle=ended`) |
| Categories and areas with counts | `GET /promotions/categories` (`areas`), `GET /promotions/areas` |
| Login (WhatsApp code once, then a 6-digit MPIN) | `POST /auth/request`, `/auth/verify`, `/auth/mpin`, `/auth/refresh`, `/auth/logout` |
| Account | `GET/PUT /user/profile`, `POST /auth/mpin` (change) |
| Shop phone and WhatsApp | masked for guests; `POST /businesses/{slug}/contact-reveal` after login |
| Offer codes | `POST /promotions/{id}/reveal-code` (shop-wide code, guests too); `POST /promotions/{id}/claims` + `GET /promotion-claims` (personal codes with QR, login) |
| Offer stats for shops | `POST /promotions/{id}/events` (`detail_view`, `call`, `whatsapp`, `directions`, `share`) |
| Delete account | `DELETE /user/account` |
| "Near me" (pincode → location) | `GET /locations/pincodes/{pincode}`; feeds take `lat`/`lng` (`sort=nearest`, cards get `distance_km`) |

- `src/lib/api/` holds the client, the response types and the mappers to the site's types in `src/types`.
- `src/lib/data` getters cache guest reads for a few minutes (`"use cache"`); the API caches too.
- Tokens live in httpOnly cookies (`ro_at`, `ro_rt`); server actions renew them, and the proxy renews
  them before `/login` and `/account` render. The browser never calls the API directly.
- "Submit an offer" points shop owners to the business app (`NEXT_PUBLIC_OWNER_APP_*_URL`).
- **Visitor IP:** every API call comes from this server, so request-time calls (login, token refresh,
  code reveals, offer stats) send the visitor's IP in `X-Client-IP` with `API_FRONTEND_KEY` (the API's
  `WEB_FRONTEND_KEY`). Without it the API rate-limits and counts all visitors as one. The IP is read from
  `x-real-ip` / `x-forwarded-for`, so the host in front of this server must set those (Vercel and nginx do).
- **Legal:** `/privacy` and `/terms` (English only), linked from the footer and the login screen.
- **Near me:** the location sheet takes the browser's GPS, or a pincode looked up in the API's India Post
  data. Only Rajkot counts: a pincode outside Rajkot district, or GPS more than 50 km from the city, is
  refused. The point is kept in the `ro_near` cookie (rounded to about 100 m, never in the URL, so shared
  links carry no location); offer lists then send it to the API for the "Nearest first" sort and the
  "· 1.2 km" on each card. The area list stays the shops' own areas (`/promotions/areas`): India Post
  names are post offices and would not match them.

## Conventions

- Pages stay thin: they read data through `@/lib/data` and compose components.
- Components are Server Components by default; `"use client"` only on interactive leaves.
- Design tokens (colours, shadows, fonts) live in `src/app/globals.css` under `@theme`.
- Filter state lives in the URL, so every list view is shareable and works without JavaScript.
- Saved offers are stored only in the browser (`localStorage`); the saved page fetches their cards.
- `isExpired` and `daysLeft` are worked out from the API's `lifecycle` and `ends_at` when read.
- `lucide-react` is pinned to 1.52.0 to respect pnpm's minimum release age; brand icons
  (Instagram, WhatsApp) are drawn in `components/icons/brand.tsx` because Lucide no longer ships them.

## Languages

English is the default and has no URL prefix (`/offers`); Gujarati is served under `/gu` (`/gu/offers`).
The header and footer have a language toggle that keeps the current page and query string and saves the
choice in a `NEXT_LOCALE` cookie, which `src/proxy.ts` uses to open the site in that language next time.

- The English text is the translation key: `t("Add another offer")`. Use `await getT()` in Server
  Components and `useT()` in Client Components (`src/lib/i18n`).
- `src/lib/i18n/messages.ts` holds the Gujarati for every interface string. Keys are typed, so a `t()` call
  with text missing from that file fails `tsc`. Use `{name}` placeholders for dynamic values.
- Catalog text (offers, shops, categories) comes from the API in English only; the interface strings are
  translated.
- Links and GET forms use `Link` / `Form` from `@/components/i18n/link`, which add the `/gu` prefix.
- Dates, times and opening status take a locale (`src/lib/format.ts`).
