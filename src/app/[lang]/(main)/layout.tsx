import { Footer } from "@/components/layout/footer";
import { DesktopHeader, MobileHeader } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/nav-links";

/** Browsing pages: full header, footer and the mobile tab bar. */
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DesktopHeader />
      <MobileHeader />
      <main className="flex-1">{children}</main>
      <Footer className="pb-16 lg:pb-0" />
      <BottomNav />
    </>
  );
}
