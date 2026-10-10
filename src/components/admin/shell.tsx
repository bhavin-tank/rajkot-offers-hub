import Link from "next/link";
import type { ReactNode } from "react";
import { signOutAction } from "@/lib/actions/admin";
import { requireAdminUser } from "@/lib/auth/session";
import { formatMobile } from "@/server/lib/mobile";
import { dashboardCounts } from "@/server/services/admin/dashboard";
import { AdminNav } from "./nav";

/** Sidebar (top bar on phones) with queue counts, and the signed-in admin. */
export async function AdminShell({ children }: { children: ReactNode }) {
  // Session first: it makes the render dynamic before anything reads the clock.
  const user = await requireAdminUser();
  const counts = await dashboardCounts();
  const items = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/offers", label: "Offers", count: counts.pendingOffers },
    { href: "/admin/submissions", label: "Submissions", count: counts.openSubmissions },
    { href: "/admin/businesses", label: "Businesses" },
    { href: "/admin/categories", label: "Categories" },
    { href: "/admin/areas", label: "Areas" },
    { href: "/admin/reports", label: "Reports", count: counts.openReports },
    { href: "/admin/messages", label: "Messages", count: counts.newMessages },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/audit", label: "Audit log" },
  ];
  return (
    <div className="min-h-dvh bg-surface lg:grid lg:grid-cols-[232px_1fr]">
      <aside className="sticky top-0 z-20 flex flex-col gap-3 border-b border-line bg-white px-4 py-3 lg:h-dvh lg:border-r lg:border-b-0 lg:py-5">
        <div className="flex items-center justify-between lg:mb-3 lg:block">
          <Link href="/admin" className="text-base font-semibold">
            Rajkot Offers <span className="text-primary">Admin</span>
          </Link>
          <Link href="/" className="text-xs text-muted hover:text-ink lg:mt-1 lg:block">
            View site ↗
          </Link>
        </div>
        <AdminNav items={items} />
        <div className="mt-auto hidden border-t border-line pt-3 text-xs lg:block">
          <p className="font-medium">{user.name ?? formatMobile(user.mobile)}</p>
          <p className="text-muted capitalize">{user.role}</p>
          <form action={signOutAction} className="mt-2">
            <button className="cursor-pointer text-muted underline hover:text-ink">Sign out</button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 px-4 py-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-6xl">{children}</div>
        <form action={signOutAction} className="mt-10 text-center lg:hidden">
          <button className="cursor-pointer text-xs text-muted underline">Sign out ({formatMobile(user.mobile)})</button>
        </form>
      </main>
    </div>
  );
}
