import type { Metadata } from "next";
import Image from "next/image";
import { PencilLine, ShieldCheck } from "lucide-react";
import { InstagramIcon } from "@/components/icons/brand";
import { SubmitOfferForm } from "@/components/forms/submit-offer-form";
import { Container } from "@/components/layout/container";
import { MobileTopBar } from "@/components/layout/header";
import { getAreas, getCategories } from "@/lib/data";
import { img } from "@/lib/mock/images";

export const metadata: Metadata = {
  title: "Submit an offer",
  description: "List your shop's offer for free and reach customers in Rajkot.",
};

const how = [
  { icon: PencilLine, text: "Fill in the offer details" },
  { icon: ShieldCheck, text: "Our team will verify it" },
  { icon: InstagramIcon, text: "Once approved, the offer appears on the website and Instagram" },
];

function Intro({ large }: { large?: boolean }) {
  return (
    <div>
      <h1 className={large ? "text-4xl leading-tight font-bold" : "text-2xl leading-[1.3] font-bold"}>
        Take your offer to Rajkot
      </h1>
      <p className={large ? "mt-3 max-w-[440px] text-base text-muted" : "mt-2 text-sm text-muted"}>
        Send us your shop’s offer. Our team will verify the details and publish it.
      </p>
    </div>
  );
}

function HowSteps({ large }: { large?: boolean }) {
  return (
    <ol className="flex flex-col gap-3 lg:gap-4">
      {how.map(({ icon: Icon, text }, i) => (
        <li key={text} className="flex items-center gap-3">
          <span
            className={
              large
                ? "flex size-10 shrink-0 items-center justify-center rounded-full bg-white"
                : "flex size-9 shrink-0 items-center justify-center rounded-full border border-line bg-surface"
            }
          >
            <Icon size={18} aria-hidden />
          </span>
          <span>
            {large && <span className="block text-xs text-faint">Step {i + 1}</span>}
            <span className={large ? "text-[15px]" : "text-sm"}>{text}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

export default async function SubmitOfferPage() {
  const [categories, areas] = await Promise.all([getCategories(), Promise.resolve(getAreas())]);
  const options = categories.map(({ slug, shortName }) => ({ slug, shortName }));

  return (
    <>
      <MobileTopBar title="Submit an offer" backHref="/" />
      <div className="lg:bg-surface">
        <Container className="pt-5 pb-7 lg:grid lg:grid-cols-[2fr_3fr] lg:items-start lg:gap-16 lg:pt-16 lg:pb-20">
          <div className="hidden flex-col gap-8 lg:flex">
            <Intro large />
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src={img("photo-1441986300917-64674bd600d8", 900)}
                alt=""
                fill
                sizes="440px"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold">How it works</h2>
              <HowSteps large />
            </div>
          </div>

          <div className="lg:rounded-2xl lg:border lg:border-line lg:bg-white lg:p-10 lg:shadow-form">
            <SubmitOfferForm
              categories={options}
              areas={areas}
              mobileIntro={
                <div className="flex flex-col gap-6">
                  <Intro />
                  <HowSteps />
                </div>
              }
            />
          </div>
        </Container>
      </div>
    </>
  );
}
