import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { InstagramIcon } from "@/components/icons/brand";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { cn, instagramHref } from "@/lib/utils";
import { site } from "@/lib/site";

/** "For businesses" call to action with an image. */
export function BusinessCta({ image }: { image: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white lg:grid lg:grid-cols-[1.1fr_1fr]">
      <div className="relative aspect-video lg:order-2 lg:aspect-auto lg:min-h-[400px]">
        <Image src={image} alt="" fill sizes="(min-width: 1024px) 570px, 100vw" className="object-cover" />
      </div>
      <div className="flex flex-col items-start gap-3 p-5 lg:justify-center lg:gap-4 lg:px-14 lg:py-16">
        <h2 className="text-[22px] leading-[1.3] font-semibold lg:text-4xl lg:leading-tight">
          Take your offer to Rajkot
        </h2>
        <p className="text-[15px] leading-relaxed text-muted lg:text-lg">
          List your shop’s offer for free and reach local customers.
        </p>
        <ButtonLink href="/submit-offer" className="mt-2 w-full lg:w-auto lg:px-7">
          Submit an offer
        </ButtonLink>
      </div>
    </div>
  );
}

interface StepCardProps {
  n: number;
  icon: LucideIcon;
  title: string;
  text: string;
}

/** Numbered step: a row on mobile, a tall card on desktop. */
export function StepCard({ n, icon: Icon, title, text }: StepCardProps) {
  return (
    <li className="relative flex gap-4 rounded-2xl border border-line bg-white p-5 lg:flex-col lg:p-7">
      <span aria-hidden className="w-9 shrink-0 text-[40px] leading-none font-bold text-input lg:absolute lg:top-6 lg:right-7 lg:w-auto lg:text-[56px]">
        {n}
      </span>
      <div className="flex flex-col gap-2 lg:gap-4">
        <Icon size={24} strokeWidth={1.6} aria-hidden />
        <h3 className="text-[17px] font-semibold lg:text-xl">{title}</h3>
        <p className="text-sm leading-normal text-muted lg:text-[15px]">{text}</p>
      </div>
    </li>
  );
}

export function PromiseItem({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <li className="flex gap-4 lg:flex-col">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-line bg-white lg:size-12">
        <Icon size={22} strokeWidth={1.6} aria-hidden />
      </span>
      <div>
        <h3 className="text-base font-semibold lg:text-lg">{title}</h3>
        <p className="mt-1 text-sm leading-normal text-muted lg:text-[15px]">{text}</p>
      </div>
    </li>
  );
}

/** "Follow us on Instagram" band. */
export function FollowBand({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between", className)}>
      <div>
        <p className="text-lg font-semibold lg:text-2xl">Follow us on Instagram for daily offers</p>
        <p className="mt-1 text-[15px] text-muted lg:text-base">{site.instagram}</p>
      </div>
      <ButtonAnchor
        href={instagramHref(site.instagram)}
        target="_blank"
        rel="noreferrer"
        variant="outline"
        className="h-11 self-start lg:h-12 lg:self-auto"
      >
        <InstagramIcon size={18} />
        Follow
      </ButtonAnchor>
    </div>
  );
}

/** Centred success panel (form submitted). */
export function SuccessPanel({
  icon: Icon,
  title,
  text,
  actions,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  actions: ReactNode;
}) {
  return (
    <div className="flex min-h-[460px] flex-col items-center justify-center px-6 py-12 text-center lg:min-h-[560px]">
      <span className="flex size-24 items-center justify-center rounded-full bg-success-soft text-success">
        <Icon size={44} strokeWidth={2} aria-hidden />
      </span>
      <h2 className="mt-6 text-2xl font-bold">{title}</h2>
      <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-muted">{text}</p>
      <div className="mt-8 flex w-full max-w-sm flex-col gap-3">{actions}</div>
    </div>
  );
}
