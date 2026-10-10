import { unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { AppError } from "@/server/lib/errors";
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

/** Maps any thrown error to the API's error envelope. */
export function errorResponse(error: unknown) {
  if (error instanceof AppError) return fail(error.status, error.code, error.message, error.extra);
  if (error instanceof z.ZodError) {
    return fail(400, "VALIDATION_FAILED", "The request is not valid", { fields: fieldErrors(error) });
  }
  const requestId = crypto.randomUUID();
  console.error(`[api] ${requestId}`, error);
  return fail(500, "INTERNAL", `Something went wrong (request ${requestId})`);
}

/**
 * Runs a route body, turning validation and service errors into the envelope
 * and anything unexpected into a logged 500. Next.js's own control-flow errors
 * (e.g. a route bailing out of prerendering) pass through untouched.
 */
export async function handle(run: () => Promise<Response>): Promise<Response> {
  try {
    return await run();
  } catch (error) {
    unstable_rethrow(error);
    return errorResponse(error);
  }
}

/** The JSON body, or {} when it is missing or not JSON (the schema then reports what is missing). */
export async function jsonBody(request: Request): Promise<unknown> {
  return request.json().catch(() => ({}));
}
