import { MongoClient } from "mongodb";

/**
 * One-time migration: the seeded `studios` documents still point to
 * `/src/assets/images/...` paths from an old Vite project that don't
 * exist in this Next.js app. Replace them with hosted Unsplash images
 * (already whitelisted in next.config.ts) matched to each category.
 */

const IMAGES = {
  "Photo Studio":
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=85",
  "Film Stage":
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85",
  "Podcast Lounge":
    "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=900&q=85",
  "Music Suite":
    "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?auto=format&fit=crop&w=900&q=85",
  "Art Workshop":
    "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=900&q=85",
  "Creative Studio":
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=85",
};

const FALLBACK = IMAGES["Creative Studio"];

const client = new MongoClient(
  "mongodb+srv://studioSpace:ndgH3kYjTZVV3loK@cluster0.oscwqjb.mongodb.net/"
);

try {
  await client.connect();
  const db = client.db("studioSpace");
  const studios = await db.collection("studios").find({}).toArray();

  for (const studio of studios) {
    const image = IMAGES[studio.category] ?? FALLBACK;

    const needsFix = [studio.imageUrl, ...(studio.additionalImages ?? [])]
      .filter(Boolean)
      .some((url) => String(url).startsWith("/src/assets/"));

    if (!needsFix) continue;

    await db.collection("studios").updateOne(
      { _id: studio._id },
      {
        $set: {
          imageUrl: image,
          additionalImages: [image],
        },
      },
    );

    console.log(`Updated image for ${studio.id} (${studio.category})`);
  }

  console.log("Migration complete.");
} catch (error) {
  console.error("Migration failed:", error);
  process.exitCode = 1;
} finally {
  await client.close();
}
