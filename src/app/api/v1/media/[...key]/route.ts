import { readLocalUpload } from "@/server/lib/storage";
import { IMAGE_TYPES } from "@/server/services/media";

const MIME_BY_EXT = Object.fromEntries(Object.entries(IMAGE_TYPES).map(([mime, ext]) => [ext, mime]));

/** Development stand-in for the media CDN: serves files saved under .data/uploads. */
export async function GET(_request: Request, ctx: RouteContext<"/api/v1/media/[...key]">) {
  const { key } = await ctx.params;
  const path = key.join("/");
  const file = await readLocalUpload(path);
  if (!file) return new Response("Not found", { status: 404 });
  const type = MIME_BY_EXT[path.split(".").pop() ?? ""] ?? "application/octet-stream";
  return new Response(new Uint8Array(file), { headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" } });
}
