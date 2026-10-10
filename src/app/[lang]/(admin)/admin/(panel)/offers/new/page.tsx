import { OfferForm } from "@/components/admin/offer-form";
import { AdminPage } from "@/components/admin/ui";
import { saveOfferAction } from "@/lib/actions/admin";
import { formOptions } from "@/lib/admin/options";
import { requireAdminUser } from "@/lib/auth/session";
import { toIsoDay, addDays } from "@/lib/format";
import { DEFAULT_STEPS, DEFAULT_TERMS, DEFAULT_TIMINGS, withGujarati } from "@/server/lib/i18n";

export const metadata = { title: "New offer" };

export default async function NewOfferPage({ searchParams }: PageProps<"/[lang]/admin/offers/new">) {
  await requireAdminUser();
  const { business } = await searchParams;
  const options = await formOptions();
  const today = toIsoDay(new Date());
  return (
    <AdminPage title="New offer">
      <OfferForm
        isNew
        action={saveOfferAction.bind(null, null)}
        businesses={options.businesses}
        categories={options.categories}
        values={{
          businessId: typeof business === "string" ? business : "",
          title: { en: "" },
          badge: { en: "" },
          type: "percent",
          discount: 0,
          categorySlug: "",
          images: [],
          validFrom: today,
          validTo: addDays(today, 14),
          timings: withGujarati(DEFAULT_TIMINGS),
          steps: DEFAULT_STEPS.map(withGujarati),
          terms: DEFAULT_TERMS.map(withGujarati),
          featured: false,
        }}
      />
    </AdminPage>
  );
}
