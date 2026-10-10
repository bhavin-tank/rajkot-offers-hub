import type { Metadata } from "next";
import { Link } from "@/components/i18n/link";
import { ArrowRight, ChevronRight, Mail, MapPin } from "lucide-react";
import { InstagramIcon, WhatsAppIcon } from "@/components/icons/brand";
import { ContactForm } from "@/components/forms/contact-form";
import { Container } from "@/components/layout/container";
import { Eyebrow } from "@/components/ui/display";
import { getT } from "@/lib/i18n/server";
import { site } from "@/lib/site";
import { instagramHref, whatsappHref } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("Contact"),
    description: t("Questions, suggestions or offer details: tell Rajkot Offers Hub."),
  };
}

async function ReportBox() {
  const t = await getT();
  return (
    <div className="rounded-2xl bg-surface p-5">
      <p className="text-sm leading-relaxed">{t("Spotted an incorrect offer? Tell us and we will look into it.")}</p>
      <Link
        href="#message"
        className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
      >
        {t("Report it")}
        <ArrowRight size={14} aria-hidden />
      </Link>
    </div>
  );
}

export default async function ContactPage() {
  const t = await getT();
  const channels = [
    { title: "WhatsApp", value: site.whatsapp, icon: <WhatsAppIcon size={20} />, href: whatsappHref(site.whatsapp) },
    { title: t("Email"), value: site.email, icon: <Mail size={20} aria-hidden />, href: `mailto:${site.email}` },
    { title: "Instagram", value: site.instagram, icon: <InstagramIcon size={20} />, href: instagramHref(site.instagram) },
    { title: t("Location"), value: t(site.location), icon: <MapPin size={20} aria-hidden /> },
  ];

  return (
    <>
      <Container className="pt-8 pb-8 lg:pt-20 lg:pb-12">
        <Eyebrow>{t("Contact")}</Eyebrow>
        <h1 className="mt-2 text-[32px] leading-tight font-bold lg:text-[52px]">{t("Contact us")}</h1>
        <p className="mt-3 text-base text-muted lg:text-lg">{t("Questions, suggestions or offer details: let us know.")}</p>
      </Container>

      <Container className="flex flex-col gap-8 pb-10 lg:grid lg:grid-cols-[2fr_3fr] lg:items-start lg:gap-12 lg:pb-20">
        <div className="flex flex-col gap-3">
          {channels.map((c) => {
            const body = (
              <>
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface">{c.icon}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{c.title}</span>
                  <span className="block truncate text-sm text-muted">{c.value}</span>
                </span>
                {c.href && <ChevronRight size={18} className="text-muted" aria-hidden />}
              </>
            );
            const classes = "flex items-center gap-3 rounded-2xl border border-line p-4 transition-colors";
            return c.href ? (
              <a key={c.title} href={c.href} target="_blank" rel="noreferrer" className={`${classes} hover:border-ink`}>
                {body}
              </a>
            ) : (
              <div key={c.title} className={classes}>
                {body}
              </div>
            );
          })}
          <div className="mt-3 hidden lg:block">
            <ReportBox />
          </div>
        </div>

        <div className="-mx-5 bg-surface px-5 py-8 lg:mx-0 lg:bg-transparent lg:p-0">
          <div className="rounded-2xl bg-white p-5 lg:border lg:border-line lg:p-8 lg:shadow-card">
            <ContactForm />
          </div>
          <div className="mt-6 lg:hidden">
            <ReportBox />
          </div>
        </div>
      </Container>
    </>
  );
}
