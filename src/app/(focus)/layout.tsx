import { Footer } from "@/components/layout/footer";
import { DesktopHeader } from "@/components/layout/header";

/**
 * Detail and task pages. On mobile each page draws its own top bar and
 * sticky action bar, so the shared header and footer show on desktop only.
 */
export default function FocusLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DesktopHeader />
      <main className="flex-1">{children}</main>
      <Footer className="hidden lg:block" />
    </>
  );
}
