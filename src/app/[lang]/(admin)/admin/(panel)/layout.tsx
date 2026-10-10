import type { ReactNode } from "react";
import { Suspense } from "react";
import { AdminShell } from "@/components/admin/shell";

function Loading() {
  return <div className="flex min-h-dvh items-center justify-center bg-surface text-sm text-muted">Loading…</div>;
}

export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<Loading />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
