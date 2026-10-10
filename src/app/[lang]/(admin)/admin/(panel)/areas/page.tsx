import { AreaForm } from "@/components/admin/area-form";
import { InlineAction } from "@/components/admin/inline-action";
import { AdminPage, Card } from "@/components/admin/ui";
import { deleteAreaAction, saveAreaAction } from "@/lib/actions/admin";
import { requireAdminUser } from "@/lib/auth/session";
import { listAllAreas } from "@/server/services/admin/catalog";

export const metadata = { title: "Areas" };

export default async function AreasPage() {
  await requireAdminUser();
  const areas = await listAllAreas();
  return (
    <AdminPage title="Areas" description="Rajkot areas shown in the location picker and area pages. Slugs are fixed once created.">
      <Card title="Add an area">
        <AreaForm isNew action={saveAreaAction.bind(null, null)} values={{ slug: "", name: { en: "" }, sortOrder: (areas.at(-1)?.sortOrder ?? 0) + 1, isActive: true }} />
      </Card>
      <Card title={`${areas.length} areas`}>
        <ul className="flex flex-col divide-y divide-line">
          {areas.map((a) => (
            <li key={a._id!.toHexString()} className="flex flex-col gap-2 py-3 lg:flex-row lg:items-start">
              <div className="flex-1">
                <AreaForm action={saveAreaAction.bind(null, a._id!.toHexString())} values={{ slug: a.slug, name: a.name, sortOrder: a.sortOrder, isActive: a.isActive }} />
              </div>
              <InlineAction action={deleteAreaAction.bind(null, a._id!.toHexString())} variant="danger" confirm={`Delete ${a.name.en}? Only areas with no businesses can be deleted.`}>
                Delete
              </InlineAction>
            </li>
          ))}
        </ul>
      </Card>
    </AdminPage>
  );
}
