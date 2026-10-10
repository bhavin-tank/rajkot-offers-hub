/** Creates any missing indexes. Run after deploying a change to indexes.ts: pnpm db:indexes */
import { closeClient } from "./client";
import { ensureIndexes } from "./indexes";

ensureIndexes()
  .then(() => console.info("Indexes are in place."))
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(closeClient);
