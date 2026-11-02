import { MongoClient } from "mongodb";
import "./load-env.mjs";

const client = new MongoClient(
  process.env.MONGODB_URI
);

try {
  await client.connect();
  const db = client.db("studioSpace");

  const bookings = await db.collection("bookings").find({}).toArray();

  console.log("TOTAL BOOKING DOCS:", bookings.length);
  const byStatus = {};
  for (const b of bookings) {
    const s = b.status ?? "(missing)";
    byStatus[s] = (byStatus[s] || 0) + 1;
  }
  console.log("BY STATUS:", JSON.stringify(byStatus));

  for (const b of bookings) {
    console.log(
      `[-] id=${b.id} status=${b.status} studio=${b.studioId} user=${b.bookerEmail} created=${b.createdAt?.toISOString?.() ?? b.createdAt}`
    );
  }
} catch (error) {
  console.error("Inspect failed:", error);
  process.exitCode = 1;
} finally {
  await client.close();
}
