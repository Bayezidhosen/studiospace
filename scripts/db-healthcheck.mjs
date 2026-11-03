/**
 * Read-only database health check:
 * prints connection status, database name and collection counts only.
 * Never prints the connection string or any credentials.
 */
import "./load-env.mjs";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || "studioSpace";

const parsed = (() => {
  try {
    return new URL(uri);
  } catch {
    return null;
  }
})();

// Reveal structure only — never credentials.
const safeHost = parsed
  ? `${parsed.protocol}//${parsed.hostname}`
  : "(unparseable)";
const srv = uri.startsWith("mongodb+srv://");

console.log(`URI scheme: ${srv ? "mongodb+srv" : parsed?.protocol ?? "?"}`);
console.log(`Host: ${safeHost}`);
console.log(`Database (DB_NAME): ${dbName}`);

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });

try {
  await client.connect();
  const db = client.db(dbName);

  const collections = await db.listCollections().toArray();
  console.log(`Collections (${collections.length}):`);

  for (const { name } of collections) {
    const count = await db.collection(name).countDocuments();
    console.log(`  - ${name}: ${count} document(s)`);
  }

  const studios = await db
    .collection("studios")
    .find({})
    .limit(6)
    .toArray();

  console.log("\nstudio documents (fields only):");
  for (const doc of studios) {
    console.log(`  - id=${doc.id ?? doc._id} title="${doc.title ?? "?"}" image host=${doc.imageUrl ? new URL(doc.imageUrl).hostname : "(none)"}`);
  }

  console.log("\nMongoDB connection: OK");
} catch (error) {
  console.log("\nMongoDB connection: FAILED");
  console.log(`Error code: ${error?.code ?? error?.cause?.code ?? "unknown"}`);
  console.log(`Message snippet: ${String(error?.message ?? "").slice(0, 200)}`);
} finally {
  await client.close().catch(() => {});
}
