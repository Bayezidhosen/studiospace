
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { MongoClient, type Db } from "mongodb";

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

function getMongoConnection(): { client: MongoClient; database: Db } {
  if (globalForMongo.studiospaceAuthMongo) {
    return globalForMongo.studiospaceAuthMongo;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "MONGODB_URI is missing.\n\n" +
        "Set it in .env.local for local development, and in your hosting " +
        "provider's environment variables (e.g. Vercel → Project Settings → " +
        "Environment Variables) for production.\n\n" +
        "Expected format:\n" +
        "mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority\n\n" +
        "See the committed .env.example for the full list of required variables. " +
        "Never commit real credentials."
    );
  }

  const client = new MongoClient(uri);
  const database = client.db(process.env.DB_NAME || "studiospace");

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

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      prompt: "select_account",
    },
  },

  user: {
    additionalFields: {},
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
});
