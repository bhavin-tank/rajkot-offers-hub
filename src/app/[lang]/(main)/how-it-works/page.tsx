import type { Metadata } from "next";
import Image from "next/image";
import {
  BadgeCheck,
  FileText,
  Globe,
  List,
  type LucideIcon,
  MapPin,
  Search,
  Send,
  ShieldCheck,
  Store,
} from "lucide-react";
import { Container, Section } from "@/components/layout/container";
import { PromiseItem, StepCard } from "@/components/marketing/blocks";
import { FollowBand } from "@/components/marketing/promos";
import { AccordionItem } from "@/components/ui/accordion";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/display";
import { getT } from "@/lib/i18n/server";
import { img } from "@/lib/mock/images";
import { faqLd, JsonLd, pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return pageMetadata({
    title: t("How it works"),
    description: t("How Rajkot Offers Hub works for customers and businesses."),
    path: "/how-it-works",
  });
}

interface StepData {
  icon: LucideIcon;
  title: string;
  text: string;
}

function Steps({ title, steps }: { title: string; steps: StepData[] }) {
  return (
    <>
      <h2 className="mb-6 text-2xl font-semibold lg:mb-10 lg:text-[32px]">{title}</h2>
      <ol className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-6">
        {steps.map((step, i) => (
          <StepCard key={step.title} n={i + 1} {...step} />
        ))}
      </ol>
    </>
  );
}

export default async function HowItWorksPage() {
  const t = await getT();

  const customerSteps: StepData[] = [
    { icon: Search, title: t("Find an offer"), text: t("Search by category, area or keyword.") },
    { icon: FileText, title: t("Check the details"), text: t("Check the validity, terms and address.") },
    { icon: Store, title: t("Visit the store"), text: t("Show the offer and enjoy the discount.") },
  ];

  const businessSteps: StepData[] = [
    { icon: Send, title: t("Send your offer"), text: t("Fill in your offer details in a simple form.") },
    { icon: ShieldCheck, title: t("Verification"), text: t("Our team checks the details.") },
    { icon: Globe, title: t("Publishing"), text: t("Approved offers appear on the website and Instagram.") },
  ];

  const promises: StepData[] = [
    { icon: BadgeCheck, title: t("Genuine offers"), text: t("We do not publish false or misleading offers.") },
    { icon: List, title: t("Clear information"), text: t("Every offer lists its validity and terms.") },
    { icon: MapPin, title: t("Local focus"), text: t("Only for Rajkot.") },
  ];

  const faqs = [
    {
      q: t("How do I use an offer?"),
      a: t("Open the offer, read the validity and terms, then visit the store and show the offer. No coupon or app is needed. It is a good idea to confirm with the store before you buy."),
    },
    {
      q: t("How do I know an offer is genuine?"),
      a: t("Each offer is sent in by the business itself and we check the basic details. Stock or timings can still change, so for a big purchase it is wise to call the store and confirm first."),
    },
    {
      q: t("How do I add my shop's offer?"),
      a: t('Fill in the offer, validity, address and contact details in the "Submit an offer" form. Listing an offer is free. We will let you know after verification.'),
    },
    {
      q: t("How long does it take for an offer to be published?"),
      a: t("Usually 1–2 working days. If details are missing we will contact you, which may take a little longer."),
    },
  ];

  return (
    <>
      <JsonLd data={faqLd(faqs)} />
      <section className="py-8 lg:py-20">
        <Container className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="flex flex-col gap-4">
            <Eyebrow>{t("About us")}</Eyebrow>
            <h1 className="text-[32px] leading-tight font-bold lg:text-[52px] lg:leading-[1.15]">
              {t("Rajkot’s offers, now easy to find")}
            </h1>
            <p className="max-w-[520px] text-base leading-relaxed text-muted lg:text-lg">
              {t("Rajkot Offers Hub brings offers from Rajkot’s local shops, cafés and salons together in one place.")}
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image
              src={img("photo-1504674900247-0877df9cc836", 1000)}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 570px, 100vw"
              className="object-cover"
            />
          </div>
        </Container>
      </section>

      <Section tone="surface">
        <Steps title={t("For customers")} steps={customerSteps} />
        <ButtonLink href="/offers" variant="outline" className="mt-6 w-full lg:mt-10 lg:w-auto lg:px-7">
          {t("Browse offers")}
        </ButtonLink>
      </Section>

      <Section>
        <Steps title={t("For businesses")} steps={businessSteps} />
        <ButtonLink href="/submit-offer" className="mt-6 w-full lg:mt-10 lg:w-auto lg:px-7">
          {t("Submit an offer")}
        </ButtonLink>
      </Section>

      <Section tone="surface">
        <h2 className="mb-6 text-2xl font-semibold lg:mb-10 lg:text-[32px]">{t("Our promise")}</h2>
        <ul className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-12">
          {promises.map((p) => (
            <PromiseItem key={p.title} {...p} />
          ))}
        </ul>
      </Section>

      <Section>
        <div className="lg:grid lg:grid-cols-[1fr_2fr] lg:gap-16">
          <h2 className="mb-4 text-2xl font-semibold lg:text-[32px]">{t("Frequently asked questions")}</h2>
          <div>
            {faqs.map((faq, i) => (
              <AccordionItem key={faq.q} title={faq.q} defaultOpen={i === 0}>
                {faq.a}
              </AccordionItem>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="surface" compact>
        <FollowBand />
      </Section>
    </>
  );
}
