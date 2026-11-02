import { MongoClient } from "mongodb";
import "./load-env.mjs";

const client = new MongoClient(
  process.env.MONGODB_URI
);

try {
  await client.connect();
  const db = client.db("studioSpace");

  /* Simulates the stale legacy records that caused the bug report. */
  await db.collection("bookings").insertOne({
    id: "bk_legacy_cancelled_bug_repro",
    studioId: "studio-cyc-01",
    studioTitle: "Legacy cancelled booking (bug repro)",
    studioCategory: "Photo Studio",
    bookerName: "Visibility Tester",
    bookerEmail: "qa-visibility-test@studiospacetest.io",
    message: "stale cancelled record",
    status: "CANCELLED",
    createdAt: new Date(),
  });
  console.log("Legacy CANCELLED doc injected for qa-visibility-test@studiospacetest.io");
} catch (error) {
  console.error("Inject failed:", error);
  process.exitCode = 1;
} finally {
  await client.close();
}
