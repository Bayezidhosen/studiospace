import { MongoClient } from "mongodb";

const client = new MongoClient(
  "mongodb+srv://studioSpace:ndgH3kYjTZVV3loK@cluster0.oscwqjb.mongodb.net/"
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
