import Link from "next/link";
import { AdminPage, LinkButton, StatusBadge, Table, Td } from "@/components/admin/ui";
import { requireAdminUser } from "@/lib/auth/session";
import { listAllCategories } from "@/server/services/admin/catalog";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  await requireAdminUser();
  const categories = await listAllCategories();
  return (
    <AdminPage title="Categories" actions={<LinkButton href="/admin/categories/new">New category</LinkButton>}>
      <Table head={["Order", "Category", "Subcategories", "Home row", "Status"]}>
        {categories.map((c) => (
          <tr key={c._id!.toHexString()} className="hover:bg-surface-2">
            <Td className="text-muted">{c.sortOrder}</Td>
            <Td>
              <Link href={`/admin/categories/${c._id}`} className="font-medium hover:underline">
                {c.name.en}
              </Link>
              <p className="text-xs text-muted">
                {c.slug}
                {c.name.gu && ` · ${c.name.gu}`}
              </p>
            </Td>
            <Td className="text-xs">{c.subcategories.map((s) => s.value).join(", ") || "—"}</Td>
            <Td>{c.inHomeRow ? "Yes" : "—"}{c.featured && " · Banner"}</Td>
            <Td>
              <StatusBadge status={c.isActive ? "active" : "archived"} />
            </Td>
          </tr>
        ))}
      </Table>
    </AdminPage>
  );
}
