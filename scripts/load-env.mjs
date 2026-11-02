/**
 * Loads the git-ignored `.env.local` into `process.env` for repo scripts,
 * so no script ever needs hardcoded database credentials.
 *
 * Usage (side-effect import, first import in the script):
 *   import "./load-env.mjs";
 *
 * `.env.local` stays local-only (it is covered by .gitignore). If the file
 * or the required variable is missing, the script exits with a clear
 * message instead of attempting an undefined connection.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const envPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  ".env.local",
);

try {
  for (const raw of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;

    const eq = line.indexOf("=");
    if (eq === -1) continue;

    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim();

    if (key && !(key in process.env)) {
      process.env[key] = value;
    }
  }
} catch {
  // .env.local not found — fall through to the required-variable check.
}

if (!process.env.MONGODB_URI) {
  console.error(
    "Missing MONGODB_URI. Set it in .env.local (this file must never be committed; see .env.example)."
  );
  process.exit(1);
}
