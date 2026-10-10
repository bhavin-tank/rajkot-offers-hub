import Link from "next/link";
import { AdminPage, FilterTabs, LinkButton, listHref, Pagination, SearchForm, StatusBadge, Table, Td } from "@/components/admin/ui";
import { requireAdminUser } from "@/lib/auth/session";
import { listBusinesses } from "@/server/services/admin/businesses";
import { listQuery } from "@/server/validators/admin";

export const metadata = { title: "Businesses" };

export default async function BusinessesPage({ searchParams }: PageProps<"/[lang]/admin/businesses">) {
  await requireAdminUser();
  const query = listQuery.parse(await searchParams);
  const { items, total, page, limit } = await listBusinesses(query);
  return (
    <AdminPage title="Businesses" actions={<LinkButton href="/admin/businesses/new">New business</LinkButton>}>
      <FilterTabs
        base="/admin/businesses"
        current={query.status}
        extra={{ q: query.q }}
        items={[{ label: "All" }, { value: "active", label: "Active" }, { value: "suspended", label: "Suspended" }, { value: "pending", label: "Pending" }]}
      />
      <SearchForm q={query.q} placeholder="Name, area or phone" hidden={{ status: query.status }} />
      <Table head={["Business", "Category · area", "Phone", "Status"]} empty={items.length ? undefined : "No businesses found."}>
        {items.map((b) => (
          <tr key={b._id!.toHexString()} className="hover:bg-surface-2">
            <Td>
              <Link href={`/admin/businesses/${b._id}`} className="font-medium hover:underline">
                {b.name}
              </Link>
              {b.verified && <span className="ml-2 text-xs text-open">✓ Verified</span>}
              <p className="text-xs text-muted">{b.slug}</p>
            </Td>
            <Td>
              {b.categorySlug} · {b.areaSlug}
            </Td>
            <Td className="whitespace-nowrap">{b.phone}</Td>
            <Td>
              <StatusBadge status={b.status} />
            </Td>
          </tr>
        ))}
      </Table>
      <Pagination page={page} limit={limit} total={total} href={(p) => listHref("/admin/businesses", { status: query.status, q: query.q, page: p })} />
    </AdminPage>
  );
}
