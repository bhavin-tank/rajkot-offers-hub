import { MongoClient, type Db } from "mongodb";

/**
 * One MongoClient per server process. Kept on globalThis so hot reloads in
 * development reuse the open connection pool instead of opening a new one.
 */
const store = globalThis as typeof globalThis & { mongoClient?: Promise<MongoClient> };

export const DEFAULT_DB_NAME = "rajkot_offers";

function connect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set. Copy .env.example to .env.local and fill it in.");
  return new MongoClient(uri, { appName: "rajkot-offers-hub" }).connect().catch((error: unknown) => {
    // Let the next call try again instead of caching a failed connection forever.
    store.mongoClient = undefined;
    throw error;
  });
}

export function getClient(): Promise<MongoClient> {
  store.mongoClient ??= connect();
  return store.mongoClient;
}

export async function getDb(): Promise<Db> {
  return (await getClient()).db(process.env.MONGODB_DB || DEFAULT_DB_NAME);
}

/** Closes the shared client; for scripts that must exit when done. */
export async function closeClient() {
  const client = store.mongoClient;
  store.mongoClient = undefined;
  if (client) await (await client).close();
}
