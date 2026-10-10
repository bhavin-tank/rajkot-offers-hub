# Rajkot Offers Hub

Local offers from shops, cafés and salons in Rajkot. Built with Next.js 16 (App Router, Cache Components), React 19, Tailwind CSS 4 and TypeScript.

## Run

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build    # production build
pnpm lint
```

## Structure

```
src/
  proxy.ts         locale routing: English at /, Gujarati at /gu (remembers the choice in a cookie)
  app/
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
    data/          async data getters, the only API the pages use
    mock/          mock records; replace lib/data/catalog.ts to use a real API
    actions/       server actions
    validation/    form rules shared by client and server
    filters.ts     offer filter options and URL query helpers
    format.ts      Dates, times and opening status
  types/           domain types
```

## Conventions

- Pages stay thin: they read data through `@/lib/data` and compose components.
- Components are Server Components by default; `"use client"` only on interactive leaves.
- Design tokens (colours, shadows, fonts) live in `src/app/globals.css` under `@theme`.
- Filter state lives in the URL, so every list view is shareable and works without JavaScript.
- Saved offers are stored only in the browser (`localStorage`).
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
- `src/lib/i18n/content.ts` holds the Gujarati for the mock catalog (offers, businesses, categories, areas).
  The data layer applies it, so pages render catalog fields as they are.
- Links and GET forms use `Link` / `Form` from `@/components/i18n/link`, which add the `/gu` prefix.
- Dates, times and opening status take a locale (`src/lib/format.ts`).
