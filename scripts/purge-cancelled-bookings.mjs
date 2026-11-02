import { MongoClient } from "mongodb";
import "./load-env.mjs";

const client = new MongoClient(
  process.env.MONGODB_URI
);

try {
  await client.connect();
  const db = client.db("studioSpace");

  /* Permanently delete ONLY cancelled booking records.
     Active (pending/confirmed) bookings and studio listings are never touched. */
  const result = await db.collection("bookings").deleteMany({
    status: { $in: ["cancelled", "CANCELLED", "Cancelled"] },
  });
  console.log("Permanently deleted cancelled booking docs:", result.deletedCount);

  const remaining = await db.collection("bookings").find({}, { projection: { id: 1, status: 1, bookerEmail: 1 } }).toArray();
  console.log("REMAINING BOOKINGS:", JSON.stringify(remaining, null, 2));
} catch (error) {
  console.error("Purge failed:", error);
  process.exitCode = 1;
} finally {
  await client.close();
}
