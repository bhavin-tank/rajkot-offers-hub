import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import { withRegionalCache } from "@opennextjs/cloudflare/overrides/incremental-cache/regional-cache";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";
import queueCache from "@opennextjs/cloudflare/overrides/queue/queue-cache";

/**
 * Cloudflare Workers (OpenNext). Prerendered pages and "use cache" entries live in R2, with a
 * short-lived copy in each Cloudflare region in front; a Durable Object queue refreshes stale
 * entries in the background (the API reads are cached for minutes). No on-demand revalidation
 * (`revalidateTag`) is used, so there is no tag cache.
 */
export default defineCloudflareConfig({
  incrementalCache: withRegionalCache(r2IncrementalCache, { mode: "short-lived" }),
  queue: queueCache(doQueue),
});
