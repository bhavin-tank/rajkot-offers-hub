import Link from "next/link";
import { NoteForm } from "@/components/admin/note-form";
import { AdminPage, FilterTabs, formatDateTime, listHref, Pagination, StatusBadge, Table, Td } from "@/components/admin/ui";
import { resolveReportAction } from "@/lib/actions/admin";
import { requireAdminUser } from "@/lib/auth/session";
import { collections } from "@/server/db/models";
import { formatMobile } from "@/server/lib/mobile";
import { listReports } from "@/server/services/admin/inbox";
import { listQuery } from "@/server/validators/admin";

export const metadata = { title: "Reports" };

const REASONS: Record<string, string> = {
  expired: "Offer has ended",
  wrong_info: "Wrong details",
  not_honoured: "Shop didn't honour it",
  offensive: "Offensive",
  other: "Other",
};

export default async function ReportsPage({ searchParams }: PageProps<"/[lang]/admin/reports">) {
  await requireAdminUser();
  const params = await searchParams;
  const query = listQuery.parse({ status: "open", ...params });
  const { items, total, page, limit } = await listReports(query);
  const { offers } = await collections();
  const titles = new Map(
    (await offers.find({ _id: { $in: items.map((r) => r.offerId) } }, { projection: { title: 1 } }).toArray()).map((o) => [o._id.toHexString(), o.title.en]),
  );
  return (
    <AdminPage title="Reports" description="Problems visitors reported on offers. To take an offer down, open it and pause it.">
      <FilterTabs
        base="/admin/reports"
        current={query.status}
        items={[{ value: "open", label: "Open" }, { value: "actioned", label: "Actioned" }, { value: "dismissed", label: "Dismissed" }, { value: "all", label: "All" }]}
      />
      <Table head={["Offer", "Problem", "Reported", "Resolution"]} empty={items.length ? undefined : "No reports."}>
        {items.map((r) => (
          <tr key={r._id!.toHexString()}>
            <Td>
              <Link href={`/admin/offers/${r.offerId}`} className="font-medium hover:underline">
                {titles.get(r.offerId.toHexString()) ?? r.offerSlug}
              </Link>
              <div className="mt-1">
                <StatusBadge status={r.status} />
              </div>
            </Td>
            <Td>
              {REASONS[r.reason] ?? r.reason}
              {r.details && <p className="text-xs text-muted">{r.details}</p>}
              {r.mobile && <p className="text-xs text-muted">{formatMobile(r.mobile)}</p>}
            </Td>
            <Td className="text-xs whitespace-nowrap text-muted">{formatDateTime(r.createdAt)}</Td>
            <Td className="min-w-72">
              <NoteForm
                action={resolveReportAction.bind(null, r._id!.toHexString())}
                status={r.status}
                note={r.note}
                statuses={[
                  { value: "actioned", label: "Actioned" },
                  { value: "dismissed", label: "Dismissed" },
                ]}
              />
            </Td>
          </tr>
        ))}
      </Table>
      <Pagination page={page} limit={limit} total={total} href={(p) => listHref("/admin/reports", { status: query.status, page: p })} />
    </AdminPage>
  );
}
