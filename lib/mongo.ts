import { MongoClient, type Db } from "mongodb";
import { randomUUID } from "node:crypto";

import {
  assertRealMongoHost,
  getDatabaseName,
  validateMongoUri,
} from "@/lib/db-config";
import { studios as fallbackStudios, type Studio } from "@/lib/data/studios";

/**
 * Server-side MongoDB data layer.
 * Collects live data from the `studios` / `reviews` collections and maps
 * it to the `Studio` shape used by the UI. Falls back to the bundled
 * static data if the database is unreachable or empty.
 */

const globalForMongo = globalThis as unknown as {
  mongoClient?: MongoClient;
  mongoConfigWarned?: boolean;
};

/** Warn once (not on every request) when the fallback path is active. */
function warnOnce(message: string) {
  if (globalForMongo.mongoConfigWarned) return;
  globalForMongo.mongoConfigWarned = true;
  console.warn(message);
}

async function getDb(): Promise<Db | null> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    warnOnce(
      "MONGODB_URI is not set — the app is serving bundled static data. " +
        "Configure it in .env.local (local) or the hosting provider env vars (production).",
    );
    return null;
  }

  try {
    validateMongoUri(uri);
    assertRealMongoHost(uri);
  } catch (error) {
    warnOnce(
      `MONGODB_URI is misconfigured — the app is serving bundled static data. ${error instanceof Error ? error.message : ""}`,
    );
    return null;
  }

  if (!globalForMongo.mongoClient) {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    await client.connect();
    globalForMongo.mongoClient = client;
  }

  // DB name comes from the shared config so every module targets the
  // same database (previously defaulted to different names here).
  return globalForMongo.mongoClient.db(getDatabaseName());
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

/* ---------- Studio CRUD (host listing management) ---------- */

/** Stable JSON shape for one owned studio (used by /api/studios/mine etc.). */
export type StudioRecord = {
  id: string;
  title: string;
  category: string;
  hourlyRate: number;
  securityDeposit: number;
  location: string;
  imageUrl: string;
  amenities: string[];
  description: string;
  featured: boolean;
  ownerId: string;
  createdAt: string;
};

type FullStudioDoc = MongoStudioDoc & {
  ownerId?: string;
  createdAt?: string | Date;
};

function mapToStudioRecord(doc: FullStudioDoc): StudioRecord {
  const createdAt =
    doc.createdAt instanceof Date
      ? doc.createdAt.toISOString()
      : (doc.createdAt ?? "");

  return {
    id: doc.id ?? String(doc._id),
    title: doc.title ?? "Untitled Studio",
    category: doc.category ?? "Creative Studio",
    hourlyRate: doc.hourlyRate ?? 0,
    securityDeposit: doc.securityDeposit ?? 0,
    location: doc.location ?? "",
    imageUrl: doc.imageUrl ?? "",
    amenities: doc.amenities ?? [],
    description: doc.description ?? "",
    featured: Boolean(doc.featured),
    ownerId: doc.ownerId ?? "",
    createdAt,
  };
}

/** Normalised shape of the fields an owner submits for a studio. */
export type StudioInput = {
  title: string;
  category: string;
  hourlyRate: number;
  securityDeposit: number;
  location: string;
  imageUrl: string;
  amenities: string[];
  description: string;
};

export async function createStudio(
  input: StudioInput,
  ownerId: string,
): Promise<StudioRecord> {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");

  const doc = {
    id: `st_${randomUUID().slice(0, 12)}`,
    title: input.title,
    category: input.category,
    hourlyRate: input.hourlyRate,
    securityDeposit: input.securityDeposit,
    hostName: undefined,
    rating: undefined,
    location: input.location,
    imageUrl: input.imageUrl,
    amenities: input.amenities,
    description: input.description,
    featured: false,
    ownerId,
    createdAt: new Date(),
  };

  await db.collection("studios").insertOne(doc as never);
  return mapToStudioRecord(doc as FullStudioDoc);
}

/** Raw studio doc lookup — ownership checks happen with the ownerId field. */
async function getStudioDoc(
  id: string,
): Promise<FullStudioDoc | null> {
  const db = await getDb();
  if (!db) return null;

  return (await db
    .collection("studios")
    .findOne({ id })
    .catch(() => null)) as unknown as FullStudioDoc | null;
}

export async function getStudioRecordById(
  id: string,
): Promise<StudioRecord | null> {
  try {
    const doc = await getStudioDoc(id);
    return doc ? mapToStudioRecord(doc) : null;
  } catch (error) {
    console.error("Failed to load studio record:", error);
    return null;
  }
}

export async function getStudiosByOwner(
  ownerId: string,
): Promise<StudioRecord[]> {
  try {
    const db = await getDb();
    if (!db) return [];

    const docs = (await db
      .collection("studios")
      .find({ ownerId })
      .sort({ createdAt: -1 })
      .toArray()) as unknown as FullStudioDoc[];

    return docs.map(mapToStudioRecord);
  } catch (error) {
    console.error("Failed to load owned studios:", error);
    return [];
  }
}

/** Update is scoped to the owner: a non-owner doc never matches. */
export async function updateStudio(
  id: string,
  ownerId: string,
  patch: Partial<StudioInput>,
): Promise<StudioRecord | null> {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");

  const doc = await db.collection("studios").findOneAndUpdate(
    { id, ownerId },
    { $set: patch },
    { returnDocument: "after" },
  );

  if (!doc) return null;
  return mapToStudioRecord(doc as unknown as FullStudioDoc);
}

/** Delete is scoped to the owner. Related pending/confirmed bookings are
 *  also removed so users can no longer book (or see) a deleted studio. */
export async function deleteStudio(
  id: string,
  ownerId: string,
): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");

  const result = await db
    .collection("studios")
    .deleteOne({ id, ownerId });

  if (result.deletedCount > 0) {
    await db
      .collection("bookings")
      .deleteMany({ studioId: id, status: { $in: ["pending", "confirmed"] } });
  }

  return result.deletedCount > 0;
}

/* ---------- Double-booking prevention ---------- */

/** "HH:MM" → minutes since midnight, or null when malformed. */
function parseTimeToMinutes(time: string | undefined): number | null {
  if (!time || !/^\d{1,2}:\d{2}$/.test(time)) return null;
  const [h, m] = time.split(":").map(Number);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

/**
 * Returns a voiced reason when the requested slot overlaps an existing
 * CONFIRMED booking for the same studio on the same date.
 * Overlap test: newStart < existingEnd AND newEnd > existingStart.
 */
export async function findBookingConflict(input: {
  studioId: string;
  date: string;
  time: string;
  hours: number;
  /** Exclude these confirmation codes (used when rescheduling, if ever). */
  excludeId?: string;
}): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;

  const newStart = parseTimeToMinutes(input.time);
  if (newStart === null) return null;
  const newEnd = newStart + input.hours * 60;

  const docs = (await db
    .collection("bookings")
    .find({
      studioId: input.studioId,
      date: input.date,
    })
    .limit(200)
    .toArray()) as unknown as MongoBookingDoc[];

  for (const doc of docs) {
    const status = (doc.status ?? "").toLowerCase();
    if (status !== "confirmed") continue;
    if (input.excludeId && doc.id === input.excludeId) continue;
    const existingStart = parseTimeToMinutes(doc.time);
    const existingHours = Number(doc.hours);
    if (existingStart === null) continue;
    if (!Number.isFinite(existingHours) || existingHours <= 0) continue;
    const existingEnd = existingStart + existingHours * 60;

    if (newStart < existingEnd && newEnd > existingStart) {
      return `The studio is already confirmed from ${doc.time} for ${existingHours} hour${existingHours > 1 ? "s" : ""}. Please pick another time.`;
    }
  }

  return null;
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

/** Load a single booking regardless of owner — callers must authorize. */
export async function getBookingByIdUnscoped(
  id: string,
): Promise<Booking | null> {
  try {
    const db = await getDb();
    if (!db) return null;

    const doc = (await db
      .collection("bookings")
      .findOne({ id })) as unknown as MongoBookingDoc | null;

    return doc ? mapBooking(doc) : null;
  } catch (error) {
    console.error("Failed to load booking:", error);
    return null;
  }
}

/** Persist a host decision ("confirmed" / "completed"). Scoped to the id. */
export async function updateBookingStatus(
  id: string,
  status: string,
): Promise<Booking | null> {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");

  const doc = await db.collection("bookings").findOneAndUpdate(
    { id },
    { $set: { status } },
    { returnDocument: "after" },
  );

  if (!doc) return null;
  return mapBooking(doc as unknown as MongoBookingDoc);
}


/** Load a single booking scoped to the owner's email (for cancel checks). */
export async function getBookingById(
  id: string,
  bookerEmail: string,
): Promise<Booking | null> {
  try {
    const db = await getDb();
    if (!db) return null;

    const doc = (await db
      .collection("bookings")
      .findOne({ id, bookerEmail })) as unknown as MongoBookingDoc | null;

    return doc ? mapBooking(doc) : null;
  } catch (error) {
    console.error("Failed to load booking:", error);
    return null;
  }
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

  /* Resolve the studio the SAME way the listing/detail pages do: from
     MongoDB, else from the bundled data. Without this, a booking made
     for an unknown id would silently store rate 0 / total 0. */
  const studioDoc = ((await db
    .collection("studios")
    .findOne({ id: input.studioId })) as unknown as MongoStudioDoc | null) ??
    null;

  const fallbackStudio = fallbackStudios.find((s) => s.id === input.studioId);

  if (!studioDoc && !fallbackStudio) {
    throw new Error(`STUDIO_NOT_FOUND:${input.studioId}`);
  }

  /* Snapshot the price details from the studio record at booking time
     so the booking stays accurate even if the studio price changes. */
  const hourlyRate = studioDoc?.hourlyRate ?? fallbackStudio?.price ?? 0;
  const securityDeposit = studioDoc?.securityDeposit ?? fallbackStudio?.deposit ?? 0;

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
    imageUrl: studioDoc?.imageUrl ?? fallbackStudio?.image,
    location: studioDoc?.location ?? fallbackStudio?.location,
    hostName: studioDoc?.hostName ?? fallbackStudio?.hostName,
    createdAt: new Date(),
  };

  await db.collection("bookings").insertOne(doc);

  return mapBooking(doc);
}

/** Cancel (delete) a booking — only pending/confirmed bookings are
 *  cancellable, the query itself rejects completed ones, and it stays
 *  scoped to the owner: nobody else's session can delete a booking. */
export async function deleteBooking(
  id: string,
  bookerEmail: string,
): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");

  const result = await db.collection("bookings").deleteOne({
    id,
    bookerEmail,
    status: { $in: [/^pending$/i, /^confirmed$/i] },
  });

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
