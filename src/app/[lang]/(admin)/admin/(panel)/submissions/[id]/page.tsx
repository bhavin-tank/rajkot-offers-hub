import Link from "next/link";
import { ConvertForm } from "@/components/admin/convert-form";
import { InlineAction, ReasonAction } from "@/components/admin/inline-action";
import { AdminPage, Card, formatDateTime, KeyValues, StatusBadge } from "@/components/admin/ui";
import { convertSubmissionAction, rejectSubmissionAction, reviewSubmissionAction } from "@/lib/actions/admin";
import { orNotFound } from "@/lib/admin/load";
import { requireAdminUser } from "@/lib/auth/session";
import { whatsappHref } from "@/lib/utils";
import { formatMobile } from "@/server/lib/mobile";
import { businessOptions } from "@/server/services/admin/businesses";
import { getSubmission, matchingBusinesses } from "@/server/services/admin/submissions";

export const metadata = { title: "Submission" };

const BADGES: Record<string, string> = { percent: "% OFF", flat: "₹ OFF", bogo: "1 + 1", combo: "COMBO", other: "OFFER" };

export default async function SubmissionPage({ params }: PageProps<"/[lang]/admin/submissions/[id]">) {
  await requireAdminUser();
  const { id } = await params;
  const submission = await orNotFound(getSubmission(id));
  const [matches, businesses] = await Promise.all([matchingBusinesses(submission), businessOptions()]);
  const open = submission.status === "new" || submission.status === "in_review";
  const reject = rejectSubmissionAction.bind(null, id);

  return (
    <AdminPage
      title={submission.title}
      description={
        <span className="flex items-center gap-2">
          <StatusBadge status={submission.status} /> Received {formatDateTime(submission.createdAt)}
        </span>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-5">
          <Card title="Offer">
            <KeyValues
              items={[
                ["Title", submission.title],
                ["Type", submission.type],
                ["Description", <span key="d" className="whitespace-pre-line">{submission.description}</span>],
                ["Terms", submission.terms ? <span className="whitespace-pre-line">{submission.terms}</span> : null],
                ["Dates", `${submission.startDate} → ${submission.endDate}`],
              ]}
            />
          </Card>
          <Card title="Business">
            <KeyValues
              items={[
                ["Name", submission.businessName],
                ["Category", submission.categorySlug],
                ["Area", submission.areaSlug],
                ["Address", submission.address],
                ["Owner", submission.ownerName],
                [
                  "Mobile",
                  <a key="m" className="text-primary hover:underline" href={whatsappHref(submission.mobile)} target="_blank" rel="noreferrer">
                    {formatMobile(submission.mobile)} {submission.whatsappSame ? "(WhatsApp)" : ""}
                  </a>,
                ],
                ["Instagram", submission.instagram ? `@${submission.instagram}` : null],
              ]}
            />
          </Card>
          <Card title={`Photos (${submission.images.length})`}>
            {submission.images.length ? (
              <div className="flex flex-wrap gap-2">
                {submission.images.map((url) => (
                  <a key={url} href={url} target="_blank" rel="noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="size-32 rounded-lg border border-line object-cover" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">No photos. The category image will be used.</p>
            )}
          </Card>
        </div>
        <div className="flex flex-col gap-5">
          {open ? (
            <>
              <Card title="Create the offer">
                <ConvertForm
                  action={convertSubmissionAction.bind(null, id)}
                  matches={matches.map((b) => ({ id: b._id!.toHexString(), name: b.name }))}
                  businesses={businesses}
                  suggestedBadge={BADGES[submission.type]}
                />
              </Card>
              {submission.status === "new" && (
                <InlineAction action={reviewSubmissionAction.bind(null, id)}>Mark as in review</InlineAction>
              )}
              <Card title="Reject">
                <ReasonAction
                  action={reject}
                  label="Reason (kept for the team)"
                  placeholder="Why it can't be listed"
                  extra={
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" name="spam" className="size-4" /> This is spam
                    </label>
                  }
                >
                  Reject submission
                </ReasonAction>
              </Card>
            </>
          ) : (
            <Card title="Outcome">
              <KeyValues
                items={[
                  ["Status", <StatusBadge key="s" status={submission.status} />],
                  ["Reason", submission.reason],
                  [
                    "Offer",
                    submission.convertedOfferId ? (
                      <Link key="o" href={`/admin/offers/${submission.convertedOfferId}`} className="text-primary hover:underline">
                        Open offer
                      </Link>
                    ) : null,
                  ],
                  [
                    "Business",
                    submission.convertedBusinessId ? (
                      <Link key="b" href={`/admin/businesses/${submission.convertedBusinessId}`} className="text-primary hover:underline">
                        Open business
                      </Link>
                    ) : null,
                  ],
                ]}
              />
            </Card>
          )}
        </div>
      </div>
    </AdminPage>
  );
}
