import type { Metadata } from "next";
import Image from "next/image";
import { BadgeCheck, FileText, Globe, List, MapPin, Search, Send, ShieldCheck, Store } from "lucide-react";
import { Container, Section } from "@/components/layout/container";
import { FollowBand, PromiseItem, StepCard } from "@/components/marketing/blocks";
import { AccordionItem } from "@/components/ui/accordion";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/display";
import { img } from "@/lib/mock/images";

export const metadata: Metadata = {
  title: "How it works",
  description: "How Rajkot Offers Hub works for customers and businesses.",
};

const customerSteps = [
  { icon: Search, title: "Find an offer", text: "Search by category, area or keyword." },
  { icon: FileText, title: "Check the details", text: "Check the validity, terms and address." },
  { icon: Store, title: "Visit the store", text: "Show the offer and enjoy the discount." },
];

const businessSteps = [
  { icon: Send, title: "Send your offer", text: "Fill in your offer details in a simple form." },
  { icon: ShieldCheck, title: "Verification", text: "Our team checks the details." },
  { icon: Globe, title: "Publishing", text: "Approved offers appear on the website and Instagram." },
];

const promises = [
  { icon: BadgeCheck, title: "Genuine offers", text: "We do not publish false or misleading offers." },
  { icon: List, title: "Clear information", text: "Every offer lists its validity and terms." },
  { icon: MapPin, title: "Local focus", text: "Only for Rajkot." },
];

const faqs = [
  {
    q: "How do I use an offer?",
    a: "Open the offer, read the validity and terms, then visit the store and show the offer. No coupon or app is needed. It is a good idea to confirm with the store before you buy.",
  },
  {
    q: "How do I know an offer is genuine?",
    a: "Each offer is sent in by the business itself and we check the basic details. Stock or timings can still change, so for a big purchase it is wise to call the store and confirm first.",
  },
  {
    q: "How do I add my shop's offer?",
    a: 'Fill in the offer, validity, address and contact details in the "Submit an offer" form. Listing an offer is free. We will let you know after verification.',
  },
  {
    q: "How long does it take for an offer to be published?",
    a: "Usually 1–2 working days. If details are missing we will contact you, which may take a little longer.",
  },
];

function Steps({ title, steps }: { title: string; steps: typeof customerSteps }) {
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

export default function HowItWorksPage() {
  return (
    <>
      <section className="py-8 lg:py-20">
        <Container className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="flex flex-col gap-4">
            <Eyebrow>About us</Eyebrow>
            <h1 className="text-[32px] leading-tight font-bold lg:text-[52px] lg:leading-[1.15]">
              Rajkot’s offers, now easy to find
            </h1>
            <p className="max-w-[520px] text-base leading-relaxed text-muted lg:text-lg">
              Rajkot Offers Hub brings offers from Rajkot’s local shops, cafés and salons together in one place.
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
        <Steps title="For customers" steps={customerSteps} />
        <ButtonLink href="/offers" variant="outline" className="mt-6 w-full lg:mt-10 lg:w-auto lg:px-7">
          Browse offers
        </ButtonLink>
      </Section>

      <Section>
        <Steps title="For businesses" steps={businessSteps} />
        <ButtonLink href="/submit-offer" className="mt-6 w-full lg:mt-10 lg:w-auto lg:px-7">
          Submit an offer
        </ButtonLink>
      </Section>

      <Section tone="surface">
        <h2 className="mb-6 text-2xl font-semibold lg:mb-10 lg:text-[32px]">Our promise</h2>
        <ul className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-12">
          {promises.map((p) => (
            <PromiseItem key={p.title} {...p} />
          ))}
        </ul>
      </Section>

      <Section>
        <div className="lg:grid lg:grid-cols-[1fr_2fr] lg:gap-16">
          <h2 className="mb-4 text-2xl font-semibold lg:text-[32px]">Frequently asked questions</h2>
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
