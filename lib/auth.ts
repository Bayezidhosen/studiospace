
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { MongoClient, type Db } from "mongodb";

import {
  assertRealMongoHost,
  getDatabaseName,
  validateMongoUri,
} from "@/lib/db-config";

/**
 * MongoDB is initialized lazily, on first runtime use — never at module
 * import / build time:
 *
 * - During `next build`, Vercel collects page data by importing route
 *   modules. With a module-scope `new MongoClient(process.env.MONGODB_URI!)`,
 *   a missing MONGODB_URI throws during that import and the build fails with
 *   "Failed to collect page data" (e.g. for /api/bookings/[id]).
 * - The mongo driver connects lazily on the first operation, so no explicit
 *   `connect()` is needed here.
 * - The singleton is cached on `globalThis` so Next.js dev hot reloads reuse
 *   the same client (same pattern used by lib/mongo.ts) instead of leaking
 *   new connections on every re-import.
 */
const globalForMongo = globalThis as unknown as {
  studiospaceAuthMongo?: { client: MongoClient; database: Db };
};

/**
 * Google OAuth is only wired up when BOTH credentials are configured.
 * Previously the provider was always registered with `undefined` values,
 * so clicking "Continue with Google" failed deep inside the library with
 * a confusing error when the env vars were missing.
 */
const googleConfigured =
  Boolean(process.env.GOOGLE_CLIENT_ID) &&
  Boolean(process.env.GOOGLE_CLIENT_SECRET);

function getMongoConnection(): { client: MongoClient; database: Db } {
  if (globalForMongo.studiospaceAuthMongo) {
    return globalForMongo.studiospaceAuthMongo;
  }

  const uri = process.env.MONGODB_URI;

  validateMongoUri(uri);
  assertRealMongoHost(uri);

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 8000,
  });
  // Same shared default as lib/mongo.ts — previously this defaulted to
  // "studiospace", so auth data could land in a DIFFERENT database than
  // bookings when DB_NAME was not configured on Vercel.
  const database = client.db(getDatabaseName());

  globalForMongo.studiospaceAuthMongo = { client, database };
  return globalForMongo.studiospaceAuthMongo;
}

/* Proxies that resolve the real database / client ONLY when the Better Auth
   adapter first touches them. The adapter only truthiness-checks `client` at
   construction and calls db/client methods per operation, so importing this
   module — during build or otherwise — never constructs a client. */
const lazyDatabase = new Proxy({} as Db, {
  get(_target, property) {
    const { database } = getMongoConnection();
    const value = Reflect.get(database as object, property);
    return typeof value === "function" ? value.bind(database) : value;
  },
});

const lazyClient = new Proxy({} as MongoClient, {
  get(_target, property) {
    const { client } = getMongoConnection();
    const value = Reflect.get(client as object, property);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,

  secret: process.env.BETTER_AUTH_SECRET,

  database: mongodbAdapter(lazyDatabase, {
    client: lazyClient,
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },

  socialProviders: googleConfigured
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID as string,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
          prompt: "select_account",
        },
      }
    : {},

  user: {
    additionalFields: {},
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
});
