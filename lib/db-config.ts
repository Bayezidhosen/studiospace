/**
 * Shared MongoDB configuration used by both the app data layer (lib/mongo.ts)
 * and Better Auth (lib/auth.ts), so the whole project always targets the
 * same database name — previously the two files used different defaults.
 *
 * Never put real credentials in this file. MONGODB_URI always comes from the
 * environment (.env.local locally, Vercel project env vars in production).
 */

/**
 * The real collections live in "studioSpace" (matches .env.local and the
 * maintenance scripts in /scripts, which write there).
 */
export const DEFAULT_DB_NAME = "studioSpace";

export function getDatabaseName(): string {
  return process.env.DB_NAME?.trim() || DEFAULT_DB_NAME;
}

/**
 * Fail EARLY and CLEARLY when the connection string is missing or malformed,
 * instead of letting the driver throw a confusing DNS error later.
 * Accepts mongodb:// and mongodb+srv:// with or without credentials.
 */
export function validateMongoUri(uri: string | undefined): asserts uri is string {
  if (!uri) {
    throw new Error(
      "MONGODB_URI is missing.\n\n" +
        "Set it in .env.local for local development, and in your hosting " +
        "provider's environment variables (e.g. Vercel → Project Settings → " +
        "Environment Variables) for production.\n\n" +
        "Expected format:\n" +
        "mongodb+srv://<username>:<password>@<cluster-host>/<database>?retryWrites=true&w=majority\n\n" +
        "See the committed .env.example for the full list of required variables. " +
        "Never commit real credentials."
    );
  }

  if (!/^mongodb(\+srv)?:\/\/.+/.test(uri)) {
    throw new Error(
      "MONGODB_URI is malformed. It must start with mongodb:// or mongodb+srv://.\n\n" +
        "Expected format:\n" +
        "mongodb+srv://<username>:<password>@<cluster-host>/<database>?retryWrites=true&w=majority\n\n" +
        "Copy the connection string from MongoDB Atlas → Database → Connect → Drivers"
    );
  }
}

/**
 * Reject the Atlas tutorial placeholder host ("cluster.mongodb.net") —
 * a real cluster host looks like "cluster0.abc12.mongodb.net". This exact
 * mistake is how the production deployment ended up unreachable, so the
 * app now reports it loudly instead of failing with a cryptic DNS error.
 */
export function assertRealMongoHost(uri: string): void {
  const withoutScheme = uri.replace(/^mongodb(\+srv)?:\/\//, "");
  const withoutCredentials = withoutScheme.slice(
    withoutScheme.indexOf("@") + 1,
  );
  const host = withoutCredentials.split(/[/?]/, 1)[0].toLowerCase();

  if (host === "cluster.mongodb.net") {
    throw new Error(
      "MONGODB_URI points to the placeholder host cluster.mongodb.net.\n\n" +
        "Replace it with your REAL Atlas cluster host — copy it from " +
        "MongoDB Atlas → Database → Connect → Drivers (it looks like: cluster0.xxxxx.mongodb.net).\n\n" +
        "The credentials were updated at some point, but the host stayed the " +
        "tutorial placeholder, so the app can never reach the database."
    );
  }
}
