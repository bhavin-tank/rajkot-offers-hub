import { notFound } from "next/navigation";
import { getArea } from "@/lib/data";

/** The area named in the URL, or undefined for all of Rajkot. Unknown areas are a 404. */
export async function resolveArea(slug: string | undefined) {
  if (!slug) return undefined;
  const area = await getArea(slug);
  if (!area) notFound();
  return area;
}
