import { MainShell } from "@/components/layout/shells";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <MainShell>{children}</MainShell>;
}
