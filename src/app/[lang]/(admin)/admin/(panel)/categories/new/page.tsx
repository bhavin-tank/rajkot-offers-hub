import { CategoryForm } from "@/components/admin/category-form";
import { AdminPage } from "@/components/admin/ui";
import { saveCategoryAction } from "@/lib/actions/admin";
import { requireAdminUser } from "@/lib/auth/session";

export const metadata = { title: "New category" };

export default async function NewCategoryPage() {
  await requireAdminUser();
  return (
    <AdminPage title="New category">
      <CategoryForm
        isNew
        action={saveCategoryAction.bind(null, null)}
        values={{ slug: "", name: { en: "" }, shortName: { en: "" }, icon: "gift", image: "", description: { en: "" }, subcategories: [], inHomeRow: false, featured: false, sortOrder: 100, isActive: true }}
      />
    </AdminPage>
  );
}
