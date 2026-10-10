# Rajkot Offers Hub

Local offers from shops, cafés and salons in Rajkot. Built with Next.js 16 (App Router, Cache Components), React 19, Tailwind CSS 4 and TypeScript.

## Run

The catalog lives in MongoDB. Locally, run MongoDB (`brew services start mongodb-community`, or Docker:
`docker run -d -p 27017:27017 mongo:8`), then:

```bash
pnpm install
cp .env.example .env.local   # MONGODB_URI, MONGODB_DB
pnpm db:seed    # loads the sample catalog from src/lib/mock (replaces areas, categories, businesses, offers)
pnpm dev        # http://localhost:3000
pnpm build      # production build (needs the database: pages are prerendered from it)
pnpm lint
pnpm typecheck
```

`pnpm db:indexes` creates any missing indexes without touching data. Sample offer dates are relative to the
day you seed, so re-seed to get fresh "ending soon" and expired offers.

## Structure

```
src/
  proxy.ts         locale routing: English at /, Gujarati at /gu (remembers the choice in a cookie)
  app/
    api/v1/        JSON API route handlers (public/… today); thin: parse → call → respond
    [lang]/        every route lives under the language segment (en | gu)
    [lang]/(main)/ browsing pages: header, footer and mobile tab bar
                   home, offers, categories, saved, contact, how-it-works
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
    businesses/    contact actions, opening hours
    forms/         submit-offer and contact forms
    marketing/     search bar, CTA, step and promise blocks
    icons/         brand and category icons
  assets/          brand logo (imported through next/image)
  hooks/           client hooks (saved offers in localStorage)
  lib/
    data/          cached data getters ("use cache"), the only API the pages use
    mock/          sample records, loaded into MongoDB by `pnpm db:seed`
    actions/       server actions
    validation/    form rules shared by client and server
    filters.ts     offer filter options and URL query helpers
    format.ts      Dates, times and opening status
  types/           domain types
  server/          backend, free of Next.js imports so it can move to its own service later
    db/            MongoDB client, document types, indexes, seed script
    services/      queries that return domain types (offers, catalog, businesses, slugs)
    validators/    zod schemas for API input
    lib/           JSON envelope, language helpers
```

## API

Public endpoints live under `/api/v1/public` and answer `{ data, meta? }` or `{ error: { code, message, fields? } }`.
Every endpoint takes `?lang=en|gu`. See the API development spec for the full plan (users, business owners, admins).

| Endpoint | Returns |
| --- | --- |
| `GET /offers` | Live offers; `q, category, sub, areas, type, validity, sort, page, limit` |
| `GET /offers/:slug` | One offer (live or past) with its business and category |
| `GET /offers/:slug/similar`, `/offers/today`, `/offers/latest` | Offer cards; `limit` |
| `POST /offers/batch` | Cards for `{ slugs: [...] }` (≤ 100), e.g. saved offers |
| `GET /categories`, `/categories/:slug` | Categories with live offer counts; `area` |
| `GET /areas` | Areas; `withCounts=true` adds counts and `meta.totalOffers` |
| `GET /businesses/:slug`, `/businesses/:slug/offers` | Profile; live and past offers |
| `GET /slugs` | Every public slug |

`GET /api/v1/health` pings the database. Reads are cached with `"use cache"` and tagged (`offers`, `catalog`,
`businesses`, `slugs` in `src/lib/data/cache.ts`); writes in later phases revalidate those tags.

## Conventions

- Pages stay thin: they read data through `@/lib/data` and compose components.
- Components are Server Components by default; `"use client"` only on interactive leaves.
- Design tokens (colours, shadows, fonts) live in `src/app/globals.css` under `@theme`.
- Filter state lives in the URL, so every list view is shareable and works without JavaScript.
- Saved offers are stored only in the browser (`localStorage`) until user accounts arrive.
- Offers are live from `validFrom` to `validTo` (Rajkot calendar days) while `status` is `approved`;
  `isExpired` and `daysLeft` are worked out when read, never stored.
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
- Catalog text is stored in MongoDB as `{ en, gu? }` and resolved to one language by the services, so pages
  render catalog fields as they are. `src/lib/i18n/content.ts` supplies the Gujarati when seeding, and still
  translates subcategory chips (subcategories stay English because they are URL filter values).
- Links and GET forms use `Link` / `Form` from `@/components/i18n/link`, which add the `/gu` prefix.
- Dates, times and opening status take a locale (`src/lib/format.ts`).
