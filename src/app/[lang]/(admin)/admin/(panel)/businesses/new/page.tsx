import { BusinessForm } from "@/components/admin/business-form";
import { AdminPage } from "@/components/admin/ui";
import { saveBusinessAction } from "@/lib/actions/admin";
import { formOptions } from "@/lib/admin/options";
import { requireAdminUser } from "@/lib/auth/session";
import { DEFAULT_HOURS, RAJKOT_CENTER } from "@/server/services/admin/businesses";

export const metadata = { title: "New business" };

export default async function NewBusinessPage() {
  await requireAdminUser();
  const { categories, areas } = await formOptions();
  return (
    <AdminPage title="New business">
      <BusinessForm
        isNew
        action={saveBusinessAction.bind(null, null)}
        categories={categories}
        areas={areas}
        values={{
          name: "",
          categorySlug: "",
          areaSlug: "",
          about: { en: "" },
          addressLine: "",
          postalCode: "",
          phone: "",
          whatsapp: "",
          hours: DEFAULT_HOURS,
          cover: "",
          photos: [],
          lat: RAJKOT_CENTER.lat,
          lng: RAJKOT_CENTER.lng,
        }}
      />
    </AdminPage>
  );
}
