import Link from "next/link";
import { AdminPage, FilterTabs, LinkButton, listHref, Pagination, SearchForm, StatusBadge, Table, Td, formatDay } from "@/components/admin/ui";
import { requireAdminUser } from "@/lib/auth/session";
import { listOffers } from "@/server/services/admin/offers";
import { listQuery } from "@/server/validators/admin";

export const metadata = { title: "Offers" };

const TABS = [
  { label: "All" },
  { value: "pending", label: "Waiting for review" },
  { value: "approved", label: "Live" },
  { value: "draft", label: "Drafts" },
  { value: "paused", label: "Paused" },
  { value: "rejected", label: "Rejected" },
  { value: "expired", label: "Expired" },
  { value: "archived", label: "Archived" },
];

export default async function OffersPage({ searchParams }: PageProps<"/[lang]/admin/offers">) {
  await requireAdminUser();
  const query = listQuery.parse(await searchParams);
  const { items, total, page, limit } = await listOffers(query);
  return (
    <AdminPage title="Offers" actions={<LinkButton href="/admin/offers/new">New offer</LinkButton>}>
      <FilterTabs base="/admin/offers" current={query.status} items={TABS} extra={{ q: query.q }} />
      <SearchForm q={query.q} placeholder="Title, business or slug" hidden={{ status: query.status }} />
      <Table head={["Offer", "Business", "Dates", "Status", "Updated"]} empty={items.length ? undefined : "No offers here."}>
        {items.map((o) => (
          <tr key={o._id!.toHexString()} className="hover:bg-surface-2">
            <Td>
              <Link href={`/admin/offers/${o._id}`} className="font-medium hover:underline">
                {o.title.en}
              </Link>
              <p className="text-xs text-muted">{o.badge.en}{o.featured && " · Featured"}</p>
            </Td>
            <Td>
              {o.businessName}
              <p className="text-xs text-muted">{o.areaName.en}</p>
            </Td>
            <Td className="whitespace-nowrap">
              {formatDay(o.validFrom)} – {formatDay(o.validTo)}
            </Td>
            <Td>
              <StatusBadge status={o.status} />
            </Td>
            <Td className="text-xs whitespace-nowrap text-muted">{o.updatedAt.toLocaleDateString("en-IN")}</Td>
          </tr>
        ))}
      </Table>
      <Pagination page={page} limit={limit} total={total} href={(p) => listHref("/admin/offers", { status: query.status, q: query.q, page: p })} />
    </AdminPage>
  );
}
