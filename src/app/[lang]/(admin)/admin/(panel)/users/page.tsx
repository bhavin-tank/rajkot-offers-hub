import { AddAdminForm, UserControls } from "@/components/admin/user-forms";
import { AdminPage, Card, FilterTabs, formatDateTime, listHref, Pagination, SearchForm, Table, Td } from "@/components/admin/ui";
import { addAdminAction, updateUserAction } from "@/lib/actions/admin";
import { requireAdminUser } from "@/lib/auth/session";
import { formatMobile } from "@/server/lib/mobile";
import { listUsers } from "@/server/services/admin/users";
import { listQuery } from "@/server/validators/admin";

export const metadata = { title: "Users" };

export default async function UsersPage({ searchParams }: PageProps<"/[lang]/admin/users">) {
  const actor = await requireAdminUser();
  const query = listQuery.parse(await searchParams);
  const { items, total, page, limit } = await listUsers(query);
  const isSuper = actor.role === "superadmin";
  return (
    <AdminPage title="Users" description="Everyone who can sign in. Blocking someone signs them out everywhere.">
      {isSuper && (
        <Card title="Add an admin">
          <AddAdminForm action={addAdminAction} />
        </Card>
      )}
      <FilterTabs
        base="/admin/users"
        current={query.status}
        extra={{ q: query.q }}
        items={[{ label: "All" }, { value: "superadmin", label: "Superadmins" }, { value: "admin", label: "Admins" }, { value: "business", label: "Business owners" }, { value: "user", label: "Users" }]}
      />
      <SearchForm q={query.q} placeholder="Name or mobile" hidden={{ status: query.status }} />
      <Table head={["User", "Last sign-in", "Role and status"]} empty={items.length ? undefined : "No users found."}>
        {items.map((u) => (
          <tr key={u._id!.toHexString()}>
            <Td>
              <span className="font-medium">{u.name ?? formatMobile(u.mobile)}</span>
              {u.name && <p className="text-xs text-muted">{formatMobile(u.mobile)}</p>}
              {u._id!.toHexString() === actor.id && <p className="text-xs text-primary">You</p>}
            </Td>
            <Td className="text-xs whitespace-nowrap text-muted">{formatDateTime(u.lastLoginAt)}</Td>
            <Td>
              {u._id!.toHexString() === actor.id ? (
                <span className="text-sm capitalize">{u.role}</span>
              ) : (
                <UserControls action={updateUserAction.bind(null, u._id!.toHexString())} role={u.role} status={u.status} canChangeRole={isSuper} />
              )}
            </Td>
          </tr>
        ))}
      </Table>
      <Pagination page={page} limit={limit} total={total} href={(p) => listHref("/admin/users", { status: query.status, q: query.q, page: p })} />
    </AdminPage>
  );
}
