import { toIsoDay } from "@/lib/format";

/** Today in Rajkot; offers start and end on Rajkot calendar days. */
export function today() {
  return toIsoDay(new Date());
}
