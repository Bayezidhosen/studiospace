
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { MongoClient } from "mongodb";

const mongoClient = new MongoClient(
  process.env.MONGODB_URI!
);

const database = mongoClient.db(
  process.env.DB_NAME || "studiospace"
);

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,

  secret: process.env.BETTER_AUTH_SECRET,

  database: mongodbAdapter(database, {
    client: mongoClient,
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
