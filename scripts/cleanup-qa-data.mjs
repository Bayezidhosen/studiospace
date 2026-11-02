import { MongoClient } from "mongodb";
import "./load-env.mjs";

const client = new MongoClient(
  process.env.MONGODB_URI
);

const TEST_EMAIL = "qa-beta-test@studiospacetest.io";

try {
  await client.connect();
  const db = client.db("studioSpace");

  const accounts = await db.collection("account").deleteMany({ email: TEST_EMAIL });
  const sessions = await db.collection("session").deleteMany({ email: TEST_EMAIL });
  const users = await db.collection("user").deleteMany({ email: TEST_EMAIL });
  const bookings = await db.collection("bookings").deleteMany({
    bookerEmail: TEST_EMAIL,
  });

  console.log(
    `Cleaned test data: users=${users.deletedCount}, accounts=${accounts.deletedCount}, sessions=${sessions.deletedCount}, bookings=${bookings.deletedCount}`
  );
} catch (error) {
  console.error("Cleanup failed:", error);
  process.exitCode = 1;
} finally {
  await client.close();
}
