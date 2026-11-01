import { MongoClient, type Db } from "mongodb";
import { randomUUID } from "node:crypto";

import { studios as fallbackStudios, type Studio } from "@/lib/data/studios";

/**
 * Server-side MongoDB data layer.
 * Collects live data from the `studios` / `reviews` collections and maps
 * it to the `Studio` shape used by the UI. Falls back to the bundled
 * static data if the database is unreachable or empty.
 */

const globalForMongo = globalThis as unknown as {
  mongoClient?: MongoClient;
};

async function getDb(): Promise<Db | null> {
  if (!process.env.MONGODB_URI) return null;

  if (!globalForMongo.mongoClient) {
    globalForMongo.mongoClient = new MongoClient(process.env.MONGODB_URI);
    await globalForMongo.mongoClient.connect();
  }

  return globalForMongo.mongoClient.db(process.env.DB_NAME || "studioSpace");
}

type MongoStudioDoc = {
  _id: unknown;
  id?: string;
  title?: string;
  category?: string;
  hourlyRate?: number;
  securityDeposit?: number;
  hostName?: string;
  rating?: number;
  location?: string;
  imageUrl?: string;
  amenities?: string[];
  description?: string;
  featured?: boolean;
};

type MongoReviewDoc = {
  _id: unknown;
  id?: string;
  studioId?: string;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  rating?: number;
  comment?: string;
  createdAt?: string | Date;
};

function mapToStudio(doc: MongoStudioDoc): Studio {
  const image = doc.imageUrl || fallbackStudios[0].image;
  return {
    id: doc.id ?? String(doc._id),
    name: doc.title ?? "Untitled Studio",
    category: doc.category ?? "Creative Studio",
    price: doc.hourlyRate ?? 0,
    rating: doc.rating != null ? String(doc.rating) : "4.8",
    location: doc.location ?? "New York, NY",
    deposit: doc.securityDeposit,
    hostName: doc.hostName,
    image,
    tag: doc.featured ? "FEATURED" : "NEW SPACE",
    description: doc.description ?? "",
    features: doc.amenities ?? [],
  };
}

export async function getStudios(): Promise<Studio[]> {
  try {
    const db = await getDb();
    if (!db) return fallbackStudios;

    const docs = (await db
      .collection("studios")
      .find({})
      .limit(24)
      .toArray()) as unknown as MongoStudioDoc[];

    if (!docs.length) return fallbackStudios;

    return docs.map(mapToStudio);
  } catch (error) {
    console.error(
      "Failed to load studios from MongoDB, falling back to static data:",
      error,
    );
    return fallbackStudios;
  }
}

export async function getStudioById(id: string): Promise<Studio | null> {
  try {
    const db = await getDb();
    if (!db) return fallbackStudios.find((s) => s.id === id) ?? null;

    const doc = (await db
      .collection("studios")
      .findOne({ id })) as unknown as MongoStudioDoc | null;

    if (!doc) return fallbackStudios.find((s) => s.id === id) ?? null;

    return mapToStudio(doc);
  } catch (error) {
    console.error(
      "Failed to load studio from MongoDB, falling back to static data:",
      error,
    );
    return fallbackStudios.find((s) => s.id === id) ?? null;
  }
}

export type StudioReview = {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type Booking = {
  id: string;
  studioId: string;
  studioTitle: string;
  studioCategory: string;
  bookerName: string;
  bookerEmail: string;
  message: string;
  status: string;
  createdAt: string;
  confirmationCode?: string;
  date?: string;
  time?: string;
  hours?: number;
  hourlyRate?: number;
  securityDeposit?: number;
  total?: number;
  imageUrl?: string;
  location?: string;
  hostName?: string;
};

type MongoBookingDoc = {
  _id?: unknown;
  id?: string;
  studioId?: string;
  studioTitle?: string;
  studioCategory?: string;
  bookerName?: string;
  bookerEmail?: string;
  message?: string;
  status?: string;
  createdAt?: string | Date;
  confirmationCode?: string;
  date?: string;
  time?: string;
  hours?: number;
  hourlyRate?: number;
  securityDeposit?: number;
  total?: number;
  imageUrl?: string;
  location?: string;
  hostName?: string;
};

function mapBooking(doc: MongoBookingDoc): Booking {
  const createdAt =
    doc.createdAt instanceof Date ? doc.createdAt.toISOString() : (doc.createdAt ?? "");

  return {
    id: doc.id ?? String(doc._id),
    studioId: doc.studioId ?? "",
    studioTitle: doc.studioTitle ?? "Unknown Studio",
    studioCategory: doc.studioCategory ?? "",
    bookerName: doc.bookerName ?? "",
    bookerEmail: doc.bookerEmail ?? "",
    message: doc.message ?? "",
    status: doc.status ?? "pending",
    createdAt,
    confirmationCode: doc.confirmationCode,
    date: doc.date,
    time: doc.time,
    hours: doc.hours,
    hourlyRate: doc.hourlyRate,
    securityDeposit: doc.securityDeposit,
    total: doc.total,
    imageUrl: doc.imageUrl,
    location: doc.location,
    hostName: doc.hostName,
  };
}

/** Collect booking records from Mongo; scoped to an email when provided.
 *  Cancelled records are excluded — a cancelled booking is permanently
 *  deleted at cancel time, so any cancelled doc here is a stale legacy
 *  record that must never surface in the user's list. */
export async function getBookings(email?: string): Promise<Booking[]> {
  try {
    const db = await getDb();
    if (!db) return [];

    const query = email
      ? {
          bookerEmail: email,
          status: { $nin: ["cancelled", "CANCELLED", "Cancelled"] },
        }
      : {
          status: { $nin: ["cancelled", "CANCELLED", "Cancelled"] },
        };

    const docs = (await db
      .collection("bookings")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray()) as unknown as MongoBookingDoc[];

    if (!docs.length) return [];

    /* Final guard: case-insensitive exclusion (e.g. legacy manual edits). */
    return docs
      .filter(
        (doc) =>
          (doc.status ?? "pending").toLowerCase() !== "cancelled",
      )
      .map(mapBooking);
  } catch (error) {
    console.error("Failed to load bookings from MongoDB:", error);
    return [];
  }
}

export async function createBooking(input: {
  studioId: string;
  studioTitle: string;
  studioCategory: string;
  bookerName: string;
  bookerEmail: string;
  date: string;
  time: string;
  hours: number;
  message?: string;
}): Promise<Booking> {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");

  /* Snapshot the price details from the studio record in Mongo
     so the booking stays accurate even if the studio price changes. */
  const studioDoc = (await db
    .collection("studios")
    .findOne({ id: input.studioId })) as unknown as MongoStudioDoc | null;

  const hourlyRate = studioDoc?.hourlyRate ?? 0;
  const securityDeposit = studioDoc?.securityDeposit ?? 0;

  const doc = {
    id: `bk_${Date.now()}_${randomUUID().slice(0, 8)}`,
    confirmationCode: `SS-${randomUUID().slice(0, 6).toUpperCase()}`,
    studioId: input.studioId,
    studioTitle: input.studioTitle,
    studioCategory: input.studioCategory,
    bookerName: input.bookerName,
    bookerEmail: input.bookerEmail,
    message: input.message ?? "",
    status: "pending",
    date: input.date,
    time: input.time,
    hours: input.hours,
    hourlyRate,
    securityDeposit,
    total: hourlyRate * input.hours + securityDeposit,
    imageUrl: studioDoc?.imageUrl,
    location: studioDoc?.location,
    hostName: studioDoc?.hostName,
    createdAt: new Date(),
  };

  await db.collection("bookings").insertOne(doc);

  return mapBooking(doc);
}

export async function deleteBooking(
  id: string,
  bookerEmail: string,
): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");

  /* Scoped to the owner: nobody else's session can delete a booking. */
  const result = await db
    .collection("bookings")
    .deleteOne({ id, bookerEmail });

  return result.deletedCount > 0;
}

export async function getStudioReviews(
  studioId: string,
): Promise<StudioReview[]> {
  try {
    const db = await getDb();
    if (!db) return [];

    const docs = (await db
      .collection("reviews")
      .find({ studioId })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray()) as unknown as MongoReviewDoc[];

    return docs.map((doc) => ({
      id: doc.id ?? String(doc._id),
      userName: doc.userName ?? "Anonymous",
      userAvatar: doc.userAvatar ?? "",
      rating: doc.rating ?? 5,
      comment: doc.comment ?? "",
      createdAt:
        doc.createdAt instanceof Date
          ? doc.createdAt.toISOString()
          : (doc.createdAt ?? ""),
    }));
  } catch (error) {
    console.error("Failed to load reviews from MongoDB:", error);
    return [];
  }
}
