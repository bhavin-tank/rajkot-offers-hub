import { addDays, toIsoDay } from "@/lib/format";
import { collections } from "../../db/models";
import { liveOfferFilter } from "../visibility";

/** What needs attention, and how big the catalog is. */
export async function dashboardCounts(now = new Date()) {
  const today = toIsoDay(now);
  const db = await collections();
  const [pendingOffers, openSubmissions, openReports, newMessages, liveOffers, endingSoon, businesses, oldestPending, offersByStatus] =
    await Promise.all([
      db.offers.countDocuments({ status: "pending" }),
      db.submissions.countDocuments({ status: { $in: ["new", "in_review"] } }),
      db.reports.countDocuments({ status: "open" }),
      db.contactMessages.countDocuments({ status: "new" }),
      db.offers.countDocuments(liveOfferFilter(today)),
      db.offers.countDocuments({ ...liveOfferFilter(today), validTo: { $gte: today, $lte: addDays(today, 3) } }),
      db.businesses.countDocuments({ status: "active" }),
      db.submissions.find({ status: { $in: ["new", "in_review"] } }).sort({ createdAt: 1 }).limit(1).next(),
      db.offers.aggregate<{ _id: string; count: number }>([{ $group: { _id: "$status", count: { $sum: 1 } } }]).toArray(),
    ]);
  return {
    pendingOffers,
    openSubmissions,
    openReports,
    newMessages,
    liveOffers,
    endingSoon,
    businesses,
    oldestOpenSubmissionAt: oldestPending?.createdAt ?? null,
    offersByStatus: Object.fromEntries(offersByStatus.map((r) => [r._id, r.count])) as Record<string, number>,
  };
}
