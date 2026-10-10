import Link from "next/link";
import { InlineAction, ReasonAction } from "@/components/admin/inline-action";
import { OfferForm } from "@/components/admin/offer-form";
import { AdminPage, Card, formatDateTime, KeyValues, StatusBadge } from "@/components/admin/ui";
import { offerStatusAction, saveOfferAction } from "@/lib/actions/admin";
import { orNotFound } from "@/lib/admin/load";
import { formOptions } from "@/lib/admin/options";
import { requireAdminUser } from "@/lib/auth/session";
import { listAudit } from "@/server/services/audit";
import { getOffer } from "@/server/services/admin/offers";

export const metadata = { title: "Offer" };

export default async function OfferPage({ params }: PageProps<"/[lang]/admin/offers/[id]">) {
  await requireAdminUser();
  const { id } = await params;
  const [offer, options, history] = await Promise.all([orNotFound(getOffer(id)), formOptions(), listAudit({ entity: "offer", entityId: id, limit: 10 })]);
  const status = offerStatusAction.bind(null, id);
  const canApprove = ["draft", "pending", "rejected"].includes(offer.status);
  const isLive = offer.status === "approved" || offer.status === "expired";

  return (
    <AdminPage
      title={offer.title.en}
      description={
        <span className="flex flex-wrap items-center gap-2">
          <StatusBadge status={offer.status} /> {offer.businessName} · {offer.areaName.en}
          {isLive && (
            <Link href={`/offers/${offer.slug}`} target="_blank" className="text-primary hover:underline">
              View on site ↗
            </Link>
          )}
        </span>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <div className="order-2 lg:order-1">
          <OfferForm
            isNew={false}
            action={saveOfferAction.bind(null, id)}
            businesses={options.businesses}
            categories={options.categories}
            values={{
              businessId: offer.businessId.toHexString(),
              title: offer.title,
              badge: offer.badge,
              type: offer.type,
              discount: offer.discount,
              categorySlug: offer.categorySlug,
              subcategory: offer.subcategory,
              offerText: offer.offerText,
              images: offer.images,
              validFrom: offer.validFrom,
              validTo: offer.validTo,
              timings: offer.timings,
              steps: offer.steps.map((s) => s.text),
              terms: offer.terms,
              featured: offer.featured,
            }}
          />
        </div>
        <div className="order-1 flex flex-col gap-4 lg:order-2">
          <Card title="Moderation">
            <div className="flex flex-col gap-3">
              {offer.rejectionReason && offer.status === "rejected" && <p className="rounded-lg bg-red-50 p-2 text-sm text-danger">Rejected: {offer.rejectionReason}</p>}
              <div className="flex flex-wrap gap-2">
                {canApprove && (
                  <InlineAction action={status} fields={{ intent: "approve" }} variant="primary">
                    Approve and publish
                  </InlineAction>
                )}
                {offer.status === "draft" && (
                  <InlineAction action={status} fields={{ intent: "submit" }}>
                    Send to review queue
                  </InlineAction>
                )}
                {offer.status === "approved" && (
                  <InlineAction action={status} fields={{ intent: "pause" }}>
                    Pause
                  </InlineAction>
                )}
                {offer.status === "paused" && (
                  <InlineAction action={status} fields={{ intent: "unpause" }} variant="primary">
                    Resume
                  </InlineAction>
                )}
                <InlineAction action={status} fields={{ intent: offer.featured ? "unfeature" : "feature" }}>
                  {offer.featured ? "Unfeature" : "Feature"}
                </InlineAction>
                {offer.status !== "archived" && (
                  <InlineAction action={status} fields={{ intent: "archive" }} variant="danger" confirm="Archive this offer? It disappears from the site.">
                    Archive
                  </InlineAction>
                )}
              </div>
              {(offer.status === "pending" || offer.status === "draft") && (
                <ReasonAction action={status} fields={{ intent: "reject" }} label="Reject with a reason" placeholder="What should the owner fix?">
                  Reject
                </ReasonAction>
              )}
            </div>
          </Card>
          <Card title="Details">
            <KeyValues
              items={[
                ["Slug", offer.slug],
                ["Created", formatDateTime(offer.createdAt)],
                ["Published", formatDateTime(offer.publishedAt)],
                ["Updated", formatDateTime(offer.updatedAt)],
              ]}
            />
          </Card>
          <Card title="History">
            <ul className="flex flex-col gap-2 text-xs">
              {history.items.map((a) => (
                <li key={a._id!.toHexString()}>
                  <span className="font-medium">{a.action}</span> · {formatDateTime(a.createdAt)}
                  {a.reason && <span className="block text-muted">“{a.reason}”</span>}
                </li>
              ))}
              {!history.items.length && <li className="text-muted">No changes recorded yet.</li>}
            </ul>
          </Card>
        </div>
      </div>
    </AdminPage>
  );
}
