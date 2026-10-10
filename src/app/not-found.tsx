import { Footer } from "@/components/layout/footer";
import { DesktopHeader, MobileHeader } from "@/components/layout/header";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <DesktopHeader />
      <MobileHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-8 pt-10 pb-14 text-center lg:min-h-[560px] lg:p-20">
        <p aria-hidden className="text-[72px] leading-none font-bold tracking-[-0.03em] text-input lg:text-[120px]">
          404
        </p>
        <h1 className="mt-4 text-2xl font-semibold lg:text-4xl">આ પેજ મળ્યું નથી</h1>
        <p className="mt-3 max-w-[520px] text-[15px] leading-relaxed text-muted lg:text-[17px]">
          લિંક બદલાઈ ગઈ હોય અથવા પેજ હવે ઉપલબ્ધ ન હોય એવું બની શકે.
        </p>
        <div className="mt-8 flex w-full flex-col gap-3 lg:w-auto lg:flex-row">
          <ButtonLink href="/" className="lg:px-7">
            હોમ પર જાઓ
          </ButtonLink>
          <ButtonLink href="/offers" variant="outline" className="lg:px-7">
            ઓફર્સ જુઓ
          </ButtonLink>
        </div>
      </main>
      <Footer />
    </>
  );
}
