import { MongoClient } from "mongodb";
import "./load-env.mjs";

const client = new MongoClient(
  process.env.MONGODB_URI
);

try {
  await client.connect();
  const db = client.db("studioSpace");

  const users = await db.collection("user").find({}, { projection: { _id: 1 } }).toArray();
  const userIds = new Set(users.map((u) => String(u._id)));

  const allAccounts = await db.collection("account").find({}).toArray();
  const orphanAccounts = allAccounts.filter((a) => !userIds.has(String(a.userId)));
  for (const acc of orphanAccounts) {
    await db.collection("account").deleteOne({ _id: acc._id });
    console.log("Removed orphan account:", String(acc._id));
  }

  const allSessions = await db.collection("session").find({}).toArray();
  const orphanSessions = allSessions.filter((s) => !userIds.has(String(s.userId)));
  for (const ses of orphanSessions) {
    await db.collection("session").deleteOne({ _id: ses._id });
    console.log("Removed orphan session:", String(ses._id));
  }

  console.log(
    `Done. userIds=${userIds.size}, remaining accounts=${allAccounts.length - orphanAccounts.length}, remaining sessions=${allSessions.length - orphanSessions.length}`
  );
} catch (e) {
  console.error("ERROR:", e.message);
} finally {
  await client.close();
}
