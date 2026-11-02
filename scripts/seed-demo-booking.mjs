import { MongoClient } from "mongodb";
import "./load-env.mjs";

/** One-time seed: a demo booking for the existing demo user. */
const client = new MongoClient(
  process.env.MONGODB_URI
);

try {
  await client.connect();
  const db = client.db("studioSpace");
  const bookings = db.collection("bookings");

  const existing = await bookings.countDocuments();
  if (existing > 0) {
    console.log(`bookings already has ${existing} docs, skipping seed.`);
  } else {
    const studio = await db.collection("studios").findOne({ id: "studio-cyc-01" });
    if (!studio) {
      console.log("No studio found to link the demo booking to.");
    } else {
      await bookings.insertOne({
        id: `bk_${Date.now()}_demo`,
        studioId: studio.id,
        studioTitle: studio.title,
        studioCategory: studio.category,
        bookerName: "Marcus Sterling",
        bookerEmail: "creator.demo@studiospace.io",
        message: "Need the cyc stage for a 6-hour fashion campaign shoot.",
        status: "pending",
        createdAt: new Date(),
      });
      console.log("Seeded 1 demo booking for creator.demo@studiospace.io");
    }
  }
} catch (error) {
  console.error("Seed failed:", error);
  process.exitCode = 1;
} finally {
  await client.close();
}
