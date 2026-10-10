/**
 * Gives a mobile number admin access, creating the user if needed:
 *
 *   pnpm admin:add 9876543210            → superadmin
 *   pnpm admin:add 9876543210 admin      → admin
 *
 * Use it once to create the first superadmin; after that, superadmins add
 * admins from the admin panel (Users).
 */
import { normalizeMobile } from "../lib/mobile";
import { closeClient } from "./client";
import { ensureIndexes } from "./indexes";
import { collections } from "./models";

async function main() {
  const [rawMobile, rawRole = "superadmin"] = process.argv.slice(2);
  const mobile = normalizeMobile(rawMobile ?? "");
  if (!mobile) throw new Error("Usage: pnpm admin:add <10-digit mobile> [admin|superadmin]");
  if (rawRole !== "admin" && rawRole !== "superadmin") throw new Error("Role must be admin or superadmin");

  await ensureIndexes();
  const { users } = await collections();
  const now = new Date();
  await users.updateOne(
    { mobile },
    { $set: { role: rawRole, status: "active", updatedAt: now }, $setOnInsert: { mobile, businessIds: [], locale: "en", createdAt: now } },
    { upsert: true },
  );
  console.info(`${mobile} is now ${rawRole}. Sign in at /admin/sign-in.`);
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(closeClient);
