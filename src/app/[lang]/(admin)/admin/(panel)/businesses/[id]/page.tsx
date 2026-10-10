import Link from "next/link";
import { BusinessForm } from "@/components/admin/business-form";
import { InlineAction } from "@/components/admin/inline-action";
import { AdminPage, Card, formatDateTime, KeyValues, LinkButton, StatusBadge } from "@/components/admin/ui";
import { businessFlagAction, saveBusinessAction } from "@/lib/actions/admin";
import { orNotFound } from "@/lib/admin/load";
import { formOptions } from "@/lib/admin/options";
import { requireAdminUser } from "@/lib/auth/session";
import { businessOfferCounts, getBusiness } from "@/server/services/admin/businesses";

export const metadata = { title: "Business" };

export default async function BusinessPage({ params }: PageProps<"/[lang]/admin/businesses/[id]">) {
  await requireAdminUser();
  const { id } = await params;
  const business = await orNotFound(getBusiness(id));
  const [{ categories, areas }, counts] = await Promise.all([formOptions(), businessOfferCounts(business._id!)]);
  const flag = businessFlagAction.bind(null, id);

  return (
    <AdminPage
      title={business.name}
      description={
        <span className="flex flex-wrap items-center gap-2">
          <StatusBadge status={business.status} />
          {business.verified && <span className="text-open">✓ Verified</span>}
          {business.status === "active" && (
            <Link href={`/businesses/${business.slug}`} target="_blank" className="text-primary hover:underline">
              View on site ↗
            </Link>
          )}
        </span>
      }
      actions={<LinkButton href={`/admin/offers/new?business=${id}`}>New offer for this business</LinkButton>}
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <div className="order-2 lg:order-1">
          <BusinessForm
            isNew={false}
            action={saveBusinessAction.bind(null, id)}
            categories={categories}
            areas={areas}
            values={{
              name: business.name,
              categorySlug: business.categorySlug,
              areaSlug: business.areaSlug,
              about: business.about,
              addressLine: business.addressLine,
              postalCode: business.postalCode,
              phone: business.phone,
              whatsapp: business.whatsapp,
              instagram: business.instagram,
              website: business.website,
              hours: business.hours,
              cover: business.cover,
              photos: business.photos,
              lat: business.geo.coordinates[1],
              lng: business.geo.coordinates[0],
            }}
          />
        </div>
        <div className="order-1 flex flex-col gap-4 lg:order-2">
          <Card title="Status">
            <div className="flex flex-wrap gap-2">
              <InlineAction action={flag} fields={{ intent: business.verified ? "unverify" : "verify" }} variant={business.verified ? "outline" : "primary"}>
                {business.verified ? "Remove verified badge" : "Mark verified"}
              </InlineAction>
              {business.status === "suspended" ? (
                <InlineAction action={flag} fields={{ intent: "activate" }}>
                  Reactivate
                </InlineAction>
              ) : (
                <InlineAction action={flag} fields={{ intent: "suspend" }} variant="danger" confirm="Suspend this business? It is hidden and its live offers are paused.">
                  Suspend
                </InlineAction>
              )}
            </div>
          </Card>
          <Card title="Offers">
            <KeyValues items={Object.entries(counts).map(([status, n]) => [status, <Link key={status} className="hover:underline" href={`/admin/offers?q=${encodeURIComponent(business.name)}&status=${status}`}>{n}</Link>])} />
            {!Object.keys(counts).length && <p className="text-sm text-muted">No offers yet.</p>}
          </Card>
          <Card title="Details">
            <KeyValues
              items={[
                ["Slug", business.slug],
                ["Created", formatDateTime(business.createdAt)],
                ["Updated", formatDateTime(business.updatedAt)],
                ["Verified", formatDateTime(business.verifiedAt)],
              ]}
            />
          </Card>
        </div>
      </div>
    </AdminPage>
  );
}
