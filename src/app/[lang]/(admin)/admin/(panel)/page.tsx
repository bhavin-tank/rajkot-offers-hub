import Link from "next/link";
import { AdminPage, Card, formatDateTime } from "@/components/admin/ui";
import { requireAdminUser } from "@/lib/auth/session";
import { formatMobile } from "@/server/lib/mobile";
import { dashboardCounts } from "@/server/services/admin/dashboard";

export const metadata = { title: "Dashboard" };

function Stat({ label, value, href, alert }: { label: string; value: number; href: string; alert?: boolean }) {
  return (
    <Link href={href} className="rounded-xl border border-line bg-white p-4 hover:border-line-strong">
      <p className="text-sm text-muted">{label}</p>
      <p className={`mt-1 text-3xl font-semibold ${alert && value ? "text-primary" : ""}`}>{value}</p>
    </Link>
  );
}

export default async function DashboardPage() {
  const user = await requireAdminUser();
  const c = await dashboardCounts();
  return (
    <AdminPage title="Dashboard" description={`Signed in as ${user.name ?? formatMobile(user.mobile)} (${user.role}).`}>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Offers waiting for review" value={c.pendingOffers} href="/admin/offers?status=pending" alert />
        <Stat label="New submissions" value={c.openSubmissions} href="/admin/submissions?status=open" alert />
        <Stat label="Open reports" value={c.openReports} href="/admin/reports?status=open" alert />
        <Stat label="New messages" value={c.newMessages} href="/admin/messages?status=new" alert />
        <Stat label="Live offers" value={c.liveOffers} href="/admin/offers?status=approved" />
        <Stat label="Ending in 3 days" value={c.endingSoon} href="/admin/offers?status=approved" />
        <Stat label="Active businesses" value={c.businesses} href="/admin/businesses?status=active" />
      </div>
      <Card title="Offers by status">
        <div className="flex flex-wrap gap-4 text-sm">
          {Object.entries(c.offersByStatus).map(([status, count]) => (
            <Link key={status} href={`/admin/offers?status=${status}`} className="capitalize hover:underline">
              {status}: <strong>{count}</strong>
            </Link>
          ))}
        </div>
        {c.oldestOpenSubmissionAt && <p className="mt-3 text-xs text-muted">Oldest open submission: {formatDateTime(c.oldestOpenSubmissionAt)}</p>}
      </Card>
    </AdminPage>
  );
}
