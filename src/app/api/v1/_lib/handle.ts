import { unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { fail } from "@/server/lib/http";

/** First problem per field, keyed by its dotted path ("areas.0"). */
function fieldErrors(error: z.ZodError) {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    fields[key] ??= issue.message;
  }
  return fields;
}

/**
 * Runs a route body, turning validation errors into 400s and anything
 * unexpected into a logged 500. Next.js's own control-flow errors (e.g. a
 * route bailing out of prerendering) are passed through untouched.
 */
export async function handle(run: () => Promise<Response>): Promise<Response> {
  try {
    return await run();
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof z.ZodError) {
      return fail(400, "VALIDATION_FAILED", "The request is not valid", fieldErrors(error));
    }
    const requestId = crypto.randomUUID();
    console.error(`[api] ${requestId}`, error);
    return fail(500, "INTERNAL", `Something went wrong (request ${requestId})`);
  }
}
