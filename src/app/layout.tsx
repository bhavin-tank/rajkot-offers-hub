import type { Metadata, Viewport } from "next";
import { Anek_Gujarati, Inter } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import { site } from "@/lib/site";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

const anek = Anek_Gujarati({
  variable: "--font-anek",
  subsets: ["gujarati", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — રાજકોટની ઓફર્સ`, template: `%s · ${site.name}` },
  description: "રાજકોટની દુકાનો, કેફે અને સલૂનની તાજી ઓફર્સ એક જ જગ્યાએ.",
  openGraph: { siteName: site.name, locale: "gu_IN", type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="gu" className={`${inter.variable} ${anek.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
