import Link from "next/link";
import { AdminPage, formatDateTime, listHref, Pagination, Table, Td } from "@/components/admin/ui";
import { requireAdminUser } from "@/lib/auth/session";
import { formatMobile } from "@/server/lib/mobile";
import { listAudit } from "@/server/services/audit";

export const metadata = { title: "Audit log" };

const LINKS: Record<string, string> = { offer: "offers", business: "businesses", submission: "submissions", category: "categories" };

export default async function AuditPage({ searchParams }: PageProps<"/[lang]/admin/audit">) {
  await requireAdminUser();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const entity = typeof params.entity === "string" ? params.entity : undefined;
  const limit = 50;
  const { items, total } = await listAudit({ entity, page, limit });
  return (
    <AdminPage title="Audit log" description="Every change made by an admin, newest first.">
      <Table head={["When", "Who", "Action", "Record", "Reason"]} empty={items.length ? undefined : "Nothing recorded yet."}>
        {items.map((a) => (
          <tr key={a._id!.toHexString()}>
            <Td className="text-xs whitespace-nowrap text-muted">{formatDateTime(a.createdAt)}</Td>
            <Td className="whitespace-nowrap">{formatMobile(a.actorMobile)}</Td>
            <Td className="font-medium">{a.action}</Td>
            <Td>
              {LINKS[a.entity] ? (
                <Link className="text-primary hover:underline" href={`/admin/${LINKS[a.entity]}/${a.entityId}`}>
                  {a.entity}
                </Link>
              ) : (
                a.entity
              )}
            </Td>
            <Td className="text-xs">{a.reason ?? ""}</Td>
          </tr>
        ))}
      </Table>
      <Pagination page={page} limit={limit} total={total} href={(p) => listHref("/admin/audit", { entity, page: p })} />
    </AdminPage>
  );
}
