/**
 * Shared server-side validation + normalisation for host-submitted studio
 * fields. Used by POST /api/studios and PATCH /api/studios/[id] so the same
 * rules apply to create and update, and clients can never inject un-typed
 * Mongo values (e.g. objects where numbers are expected).
 */

export type StudioFormInput = {
  title: string;
  category: string;
  hourlyRate: number;
  securityDeposit: number;
  location: string;
  imageUrl: string;
  amenities: string[];
  description: string;
};

export type StudioValidationResult =
  | { ok: true; data: StudioFormInput }
  | { ok: false; error: string };

const HTTP_URL = /^https?:\/\/\S+$/i;

export function validateStudioInput(body: unknown): StudioValidationResult {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Invalid request body." };
  }

  const raw = body as Record<string, unknown>;

  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  if (title.length < 3 || title.length > 100) {
    return {
      ok: false,
      error: "Studio name must be between 3 and 100 characters.",
    };
  }

  const category = typeof raw.category === "string" ? raw.category.trim() : "";
  if (category.length < 2 || category.length > 60) {
    return {
      ok: false,
      error: "Please choose a studio category.",
    };
  }

  const location = typeof raw.location === "string" ? raw.location.trim() : "";
  if (location.length < 3 || location.length > 120) {
    return {
      ok: false,
      error: "Location must be between 3 and 120 characters.",
    };
  }

  const hourlyRate = Number(raw.hourlyRate);
  if (!Number.isFinite(hourlyRate) || hourlyRate < 1 || hourlyRate > 10000) {
    return {
      ok: false,
      error: "Hourly rate must be between $1 and $10000.",
    };
  }

  const securityDepositRaw = raw.securityDeposit;
  const securityDeposit =
    securityDepositRaw === undefined || securityDepositRaw === null
      ? 0
      : Number(securityDepositRaw);
  if (
    !Number.isFinite(securityDeposit) ||
    securityDeposit < 0 ||
    securityDeposit > 100000
  ) {
    return {
      ok: false,
      error: "Security deposit must be between $0 and $100000.",
    };
  }

  const imageUrl = typeof raw.imageUrl === "string" ? raw.imageUrl.trim() : "";
  if (imageUrl.length > 500) {
    return { ok: false, error: "Image URL is too long." };
  }
  if (imageUrl && !HTTP_URL.test(imageUrl)) {
    return {
      ok: false,
      error: "Image must be a valid http(s) URL.",
    };
  }

  let amenities: string[] = [];
  if (Array.isArray(raw.amenities)) {
    amenities = raw.amenities
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  } else if (typeof raw.amenities === "string") {
    /* Accept a comma-separated string as well as an array. */
    amenities = raw.amenities
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (amenities.length > 20) {
    return { ok: false, error: "List up to 20 amenities." };
  }
  if (amenities.some((item) => item.length > 60)) {
    return { ok: false, error: "Each amenity must be under 60 characters." };
  }

  const description =
    typeof raw.description === "string" ? raw.description.trim() : "";
  if (description.length > 2000) {
    return {
      ok: false,
      error: "Please keep the description under 2000 characters.",
    };
  }

  return {
    ok: true,
    data: {
      title,
      category,
      hourlyRate,
      securityDeposit,
      location,
      imageUrl,
      amenities,
      description,
    },
  };
}
