import { adminRoute } from "@/app/api/v1/_lib/auth";
import { privateOk } from "@/server/lib/http";
import { dashboardCounts } from "@/server/services/admin/dashboard";

/** Queue sizes and catalog totals for the admin home page. */
export const GET = adminRoute(async () => privateOk(await dashboardCounts()));
