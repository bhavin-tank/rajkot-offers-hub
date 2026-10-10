import Link from "next/link";
import { AdminPage, FilterTabs, formatDateTime, listHref, Pagination, SearchForm, StatusBadge, Table, Td } from "@/components/admin/ui";
import { requireAdminUser } from "@/lib/auth/session";
import { formatMobile } from "@/server/lib/mobile";
import { listSubmissions } from "@/server/services/admin/submissions";
import { listQuery } from "@/server/validators/admin";

export const metadata = { title: "Submissions" };

const TABS = [
  { value: "open", label: "To handle" },
  { value: "converted", label: "Converted" },
  { value: "rejected", label: "Rejected" },
  { value: "spam", label: "Spam" },
  { label: "All" },
];

export default async function SubmissionsPage({ searchParams }: PageProps<"/[lang]/admin/submissions">) {
  await requireAdminUser();
  const params = await searchParams;
  const query = listQuery.parse({ status: "open", ...params });
  const { items, total, page, limit } = await listSubmissions(query);
  return (
    <AdminPage title="Submissions" description="Offers sent through the public “Submit an offer” form. Oldest first while they wait.">
      <FilterTabs base="/admin/submissions" current={params.status === undefined ? "open" : query.status} items={TABS.map((t) => (t.value === undefined ? { ...t, value: "all" } : t))} />
      <SearchForm q={query.q} placeholder="Business, title or mobile" hidden={{ status: query.status }} />
      <Table head={["Offer", "Business", "Contact", "Photos", "Status", "Received"]} empty={items.length ? undefined : "Nothing here."}>
        {items.map((s) => (
          <tr key={s._id!.toHexString()} className="hover:bg-surface-2">
            <Td>
              <Link href={`/admin/submissions/${s._id}`} className="font-medium hover:underline">
                {s.title}
              </Link>
              <p className="text-xs text-muted">
                {s.startDate} → {s.endDate}
              </p>
            </Td>
            <Td>
              {s.businessName}
              <p className="text-xs text-muted">
                {s.categorySlug} · {s.areaSlug}
              </p>
            </Td>
            <Td className="whitespace-nowrap">
              {s.ownerName}
              <p className="text-xs text-muted">{formatMobile(s.mobile)}</p>
            </Td>
            <Td>{s.images.length}</Td>
            <Td>
              <StatusBadge status={s.status} />
            </Td>
            <Td className="text-xs whitespace-nowrap text-muted">{formatDateTime(s.createdAt)}</Td>
          </tr>
        ))}
      </Table>
      <Pagination page={page} limit={limit} total={total} href={(p) => listHref("/admin/submissions", { status: query.status, q: query.q, page: p })} />
    </AdminPage>
  );
}
