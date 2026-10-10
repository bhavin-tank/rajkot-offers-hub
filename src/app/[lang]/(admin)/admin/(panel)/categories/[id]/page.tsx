import { CategoryForm } from "@/components/admin/category-form";
import { InlineAction } from "@/components/admin/inline-action";
import { AdminPage } from "@/components/admin/ui";
import { deleteCategoryAction, saveCategoryAction } from "@/lib/actions/admin";
import { orNotFound } from "@/lib/admin/load";
import { requireAdminUser } from "@/lib/auth/session";
import { getCategoryById } from "@/server/services/admin/catalog";

export const metadata = { title: "Category" };

export default async function CategoryPage({ params }: PageProps<"/[lang]/admin/categories/[id]">) {
  await requireAdminUser();
  const { id } = await params;
  const c = await orNotFound(getCategoryById(id));
  return (
    <AdminPage
      title={c.name.en}
      actions={
        <InlineAction action={deleteCategoryAction.bind(null, id)} variant="danger" confirm="Delete this category? Only unused categories can be deleted.">
          Delete
        </InlineAction>
      }
    >
      <CategoryForm
        isNew={false}
        action={saveCategoryAction.bind(null, id)}
        values={{
          slug: c.slug,
          name: c.name,
          shortName: c.shortName,
          icon: c.icon,
          image: c.image,
          description: c.description,
          subcategories: c.subcategories,
          inHomeRow: c.inHomeRow,
          featured: c.featured,
          sortOrder: c.sortOrder,
          isActive: c.isActive,
        }}
      />
    </AdminPage>
  );
}
