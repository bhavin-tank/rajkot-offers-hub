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
  title: "કેવી રીતે કામ કરે છે",
  description: "Rajkot Offers Hub ગ્રાહકો અને બિઝનેસ માટે કેવી રીતે કામ કરે છે.",
};

const customerSteps = [
  { icon: Search, title: "ઓફર શોધો", text: "કેટેગરી, વિસ્તાર અથવા સર્ચથી ઓફર શોધો." },
  { icon: FileText, title: "વિગતો જુઓ", text: "માન્યતા, શરતો અને સરનામું તપાસો." },
  { icon: Store, title: "દુકાન પર જાઓ", text: "ઓફર બતાવો અને છૂટનો લાભ લો." },
];

const businessSteps = [
  { icon: Send, title: "ઓફર મોકલો", text: "સરળ ફોર્મમાં તમારી ઓફરની વિગતો ભરો." },
  { icon: ShieldCheck, title: "ચકાસણી", text: "અમારી ટીમ વિગતો તપાસે છે." },
  { icon: Globe, title: "પ્રકાશન", text: "મંજૂર ઓફર વેબસાઇટ અને Instagram પર દેખાય છે." },
];

const promises = [
  { icon: BadgeCheck, title: "સાચી ઓફર્સ", text: "ખોટી કે ભ્રામક ઓફર્સ પ્રકાશિત નથી કરતા." },
  { icon: List, title: "સ્પષ્ટ માહિતી", text: "દરેક ઓફરમાં માન્યતા અને શરતો." },
  { icon: MapPin, title: "સ્થાનિક ફોકસ", text: "ફક્ત રાજકોટ માટે." },
];

const faqs = [
  {
    q: "ઓફરનો લાભ કેવી રીતે લેવો?",
    a: "ઓફરની વિગત ખોલો, માન્યતા અને શરતો વાંચો, અને દુકાન પર જઈને આ ઓફર બતાવો. કોઈ કૂપન કે એપની જરૂર નથી. ખરીદી પહેલાં દુકાન પર એક વાર ખાતરી કરી લેવી સારી.",
  },
  {
    q: "ઓફર ખરેખર માન્ય છે કે નહીં તે કેવી રીતે જાણવું?",
    a: "દરેક ઓફર બિઝનેસ પોતે મોકલે છે અને અમે તેની મૂળભૂત વિગતો તપાસીએ છીએ. છતાં સ્ટૉક કે સમયમાં ફેરફાર થઈ શકે છે, તેથી મોટી ખરીદી પહેલાં દુકાનને કૉલ કરીને પુષ્ટિ કરવી સલાહભર્યું છે.",
  },
  {
    q: "મારી દુકાનની ઓફર કેવી રીતે ઉમેરું?",
    a: '"ઓફર સબમિટ કરો" ફોર્મમાં ઓફર, માન્યતા, સરનામું અને સંપર્ક ભરો. ઓફર લિસ્ટ કરવી મફત છે. ચકાસણી પછી અમે તમને જાણ કરીશું.',
  },
  {
    q: "ઓફર પ્રકાશિત થવામાં કેટલો સમય લાગે?",
    a: "સામાન્ય રીતે 1–2 કામકાજના દિવસ. વિગતો અધૂરી હોય તો અમે તમારો સંપર્ક કરીશું, જેથી થોડો વધુ સમય લાગી શકે.",
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
            <Eyebrow>અમારા વિશે</Eyebrow>
            <h1 className="text-[32px] leading-tight font-bold lg:text-[52px] lg:leading-[1.15]">
              રાજકોટની ઓફર્સ, હવે શોધવામાં સરળ
            </h1>
            <p className="max-w-[520px] text-base leading-relaxed text-muted lg:text-lg">
              Rajkot Offers Hub રાજકોટની સ્થાનિક દુકાનો, કેફે અને સલૂનની ઓફર્સ એક જ જગ્યાએ લાવે છે.
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
        <Steps title="ગ્રાહકો માટે" steps={customerSteps} />
        <ButtonLink href="/offers" variant="outline" className="mt-6 w-full lg:mt-10 lg:w-auto lg:px-7">
          ઓફર્સ જુઓ
        </ButtonLink>
      </Section>

      <Section>
        <Steps title="બિઝનેસ માટે" steps={businessSteps} />
        <ButtonLink href="/submit-offer" className="mt-6 w-full lg:mt-10 lg:w-auto lg:px-7">
          ઓફર સબમિટ કરો
        </ButtonLink>
      </Section>

      <Section tone="surface">
        <h2 className="mb-6 text-2xl font-semibold lg:mb-10 lg:text-[32px]">અમારું વચન</h2>
        <ul className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-12">
          {promises.map((p) => (
            <PromiseItem key={p.title} {...p} />
          ))}
        </ul>
      </Section>

      <Section>
        <div className="lg:grid lg:grid-cols-[1fr_2fr] lg:gap-16">
          <h2 className="mb-4 text-2xl font-semibold lg:text-[32px]">વારંવાર પૂછાતા પ્રશ્નો</h2>
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
