import type { Metadata, Viewport } from "next";
import { Anek_Gujarati, Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { LoginProvider } from "@/components/auth/login-dialog";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import { ToastProvider } from "@/components/ui/toast";
import { hasLocale } from "@/lib/i18n/config";
import { LocaleProvider } from "@/lib/i18n/client";
import { getLocale, getT } from "@/lib/i18n/server";
import { DEFAULT_SHARE_IMAGE } from "@/lib/seo";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import "../globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

const anek = Anek_Gujarati({
  variable: "--font-anek",
  subsets: ["gujarati", "latin"],
  weight: ["400", "500", "600", "700"],
  // Only Gujarati pages use it, so it loads on demand instead of being preloaded everywhere.
  preload: false,
});

/**
 * Every page is rendered per request. Prerendered pages (and the Cache Components that build them)
 * are refreshed at request time, and that hangs on Cloudflare Workers once an entry expires.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  return {
    metadataBase: new URL(site.url),
    title: { default: `${site.name} — ${t("Offers in Rajkot")}`, template: `%s · ${site.name}` },
    description: t("Fresh offers from Rajkot's shops, cafés and salons, all in one place."),
    applicationName: site.name,
    openGraph: {
      siteName: site.name,
      locale: locale === "gu" ? "gu_IN" : "en_IN",
      type: "website",
      images: [DEFAULT_SHARE_IMAGE],
    },
    twitter: { card: "summary_large_image", images: [DEFAULT_SHARE_IMAGE] },
    // Search Console ownership check; set the token in the deployment's environment.
    verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
  };
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  return (
    <html lang={lang} className={cn(inter.variable, lang === "gu" && anek.variable)}>
      <body className="flex min-h-dvh flex-col">
        <LocaleProvider locale={lang}>
          <ToastProvider>
            <LoginProvider>{children}</LoginProvider>
            <ScrollToTop />
          </ToastProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
