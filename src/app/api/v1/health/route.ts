import { connection } from "next/server";
import { getDb } from "@/server/db/client";

/** Uptime check: 200 when MongoDB answers a ping, 503 otherwise. Never cached. */
export async function GET() {
  await connection();
  try {
    await (await getDb()).command({ ping: 1 });
    return Response.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[health] MongoDB ping failed", error);
    return Response.json({ status: "error", db: "unreachable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
