import { MongoClient } from "mongodb";

const client = new MongoClient(
  "mongodb+srv://studioSpace:ndgH3kYjTZVV3loK@cluster0.oscwqjb.mongodb.net/"
);

try {
  await client.connect();
  const db = client.db("studioSpace");

  const users = await db.collection("user").find({}, { projection: { _id: 1 } }).toArray();
  const userIds = new Set(users.map((u) => String(u._id)));

  const bookings = await db.collection("bookings").deleteMany({
    bookerEmail: { $regex: "studiospacetest" },
  });
  console.log("QA bookings removed:", bookings.deletedCount);

  const accounts = await db.collection("account").find({}).toArray();
  for (const account of accounts) {
    if (!userIds.has(String(account.userId))) {
      await db.collection("account").deleteOne({ _id: account._id });
      console.log("Removed orphan account:", String(account._id));
    }
  }

  const sessions = await db.collection("session").find({}).toArray();
  for (const session of sessions) {
    if (!userIds.has(String(session.userId))) {
      await db.collection("session").deleteOne({ _id: session._id });
      console.log("Removed orphan session:", String(session._id));
    }
  }

  const removedUsers = await db.collection("user").deleteMany({
    email: { $regex: "studiospacetest" },
  });
  console.log("QA users removed:", removedUsers.deletedCount);
} catch (error) {
  console.error("Cleanup failed:", error);
  process.exitCode = 1;
} finally {
  await client.close();
}
