import { writeLocalUpload } from "@/server/lib/storage";

/** Development stand-in for R2: receives a signed PUT and saves the file under .data/uploads. */
export async function PUT(request: Request, ctx: RouteContext<"/api/v1/uploads/local/[...key]">) {
  const { key } = await ctx.params;
  const problem = await writeLocalUpload(
    key.join("/"),
    new URL(request.url).searchParams,
    request.headers.get("content-type"),
    await request.arrayBuffer(),
  );
  return problem ? new Response(problem, { status: 403 }) : new Response(null, { status: 200 });
}
