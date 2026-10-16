import type { Metadata } from "next";
import Image from "next/image";
import { CategoryIconRow } from "@/components/categories/category-tiles";
import { Container, Section, SectionHeader } from "@/components/layout/container";
import { BusinessCta } from "@/components/marketing/promos";
import { HeroSlider } from "@/components/marketing/hero-slider";
import { NearMeLink } from "@/components/marketing/near-me-link";
import { SearchBar } from "@/components/marketing/search-bar";
import { FollowedOffers } from "@/components/offers/followed-offers";
import { OfferCarousel, OfferGrid } from "@/components/offers/offer-card";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/display";
import { getCategories, getFeaturedOffers, getHeroSlides, getLatestOffers, getTodayOffers } from "@/lib/data";
import { getT } from "@/lib/i18n/server";
import { img } from "@/lib/mock/images";
import { JsonLd, pageMetadata, siteLd } from "@/lib/seo";
import { site } from "@/lib/site";

const heroImages = [
  img("photo-1441986300917-64674bd600d8", 900),
  img("photo-1495474472287-4d71bcdd2085", 600),
  img("photo-1560066984-138dadb4c035", 600),
];

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return pageMetadata({
    title: `${site.name}: ${t("Offers, discounts and deals in Rajkot")}`,
    description: t("Fresh offers from Rajkot's shops, cafés and salons, all in one place."),
    path: "/",
    absoluteTitle: true,
  });
}

export default async function HomePage() {
  const t = await getT();
  const [categories, today, latest, featured, hero] = await Promise.all([
    getCategories(),
    getTodayOffers(),
    getLatestOffers(),
    getFeaturedOffers(),
    getHeroSlides(),
  ]);
  const homeCategories = categories.filter((c) => c.inHomeRow);

  return (
    <>
      <JsonLd data={siteLd(t("Fresh offers from Rajkot's shops, cafés and salons, all in one place."))} />
      <section className="bg-white pt-6 pb-8 lg:py-20">
        <Container className="lg:grid lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="lg:max-w-[520px]">
            <Eyebrow className="lg:text-[15px]">{t("For Rajkot")}</Eyebrow>
            <h1 className="mt-2 text-[34px] leading-[1.25] font-bold tracking-[-0.01em] lg:mt-3 lg:text-[56px] lg:leading-[1.15] lg:tracking-[-0.015em]">
              {t("What’s on offer today?")}
            </h1>
            <p className="mt-3 text-base leading-[1.55] text-muted lg:mt-4 lg:text-lg lg:leading-relaxed">
              {t("Fresh offers from Rajkot’s shops, cafés and salons, all in one place.")}
            </p>
            <SearchBar variant="hero" className="mt-6 lg:mt-8" />
            <NearMeLink className="mt-4" />
          </div>
          <div aria-hidden className="hidden h-[440px] grid-cols-[1.15fr_1fr] grid-rows-2 gap-4 lg:grid">
            {heroImages.map((src, i) => (
              <div key={src} className={i === 0 ? "relative row-span-2 overflow-hidden rounded-2xl" : "relative overflow-hidden rounded-2xl"}>
                <Image src={src} alt="" fill priority sizes="320px" className="object-cover" />
              </div>
            ))}
          </div>
        </Container>
      </section>

      {hero.slides.length > 0 && (
        <Section className="pt-0 lg:pt-0">
          <HeroSlider slides={hero.slides} autoplayMs={hero.autoplayMs} loop={hero.loop} />
        </Section>
      )}

      <FollowedOffers framed />

      <Section className="pt-0 lg:pt-0">
        <SectionHeader title={t("Category")} />
        <CategoryIconRow categories={homeCategories} />
      </Section>

      <Section tone="surface">
        <SectionHeader title={t("Today's offers")} href="/offers?sort=ending" />
        <OfferCarousel offers={today} />
      </Section>

      {featured.length > 0 && (
        <Section>
          <SectionHeader title={t("Featured offers")} href="/offers" />
          <OfferCarousel offers={featured} />
        </Section>
      )}

      <Section tone={featured.length > 0 ? "surface" : "white"}>
        <SectionHeader title={t("New offers")} />
        <OfferGrid offers={latest} />
        <div className="mt-6 flex justify-center lg:mt-10">
          <ButtonLink href="/offers" variant="outline" className="w-full lg:w-auto lg:px-7">
            {t("See all offers")}
          </ButtonLink>
        </div>
      </Section>

      <Section tone={featured.length > 0 ? "white" : "surface"}>
        <BusinessCta image={img("photo-1567401893414-76b7b1e5a7a5", 1200)} />
      </Section>
    </>
  );
}
