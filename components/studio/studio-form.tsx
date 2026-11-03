"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import type { StudioRecord } from "@/lib/mongo";

/** Placeholder cover used when the host does not supply a photo URL. */
const DEFAULT_STUDIO_IMAGE =
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=85";

const CATEGORY_OPTIONS = [
  "Photo Studio",
  "Podcast Room",
  "Music Suite",
  "Creative Studio",
  "Film Stage",
  "Art Workshop",
];

type Props = {
  mode: "create" | "edit";
  studioId?: string;
  initial?: StudioRecord | null;
};

const inputClass =
  "w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-neutral-900";
const labelClass =
  "mb-2 block text-sm font-semibold";

export default function StudioForm({ mode, studioId, initial }: Props) {
  const router = useRouter();
  const editing = mode === "edit";

  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState(initial?.category ?? CATEGORY_OPTIONS[0]);
  const [location, setLocation] = useState(initial?.location ?? "");
  const [hourlyRate, setHourlyRate] = useState(
    initial ? String(initial.hourlyRate) : "",
  );
  const [securityDeposit, setSecurityDeposit] = useState(
    initial ? String(initial.securityDeposit) : "",
  );
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [amenities, setAmenities] = useState(
    (initial?.amenities ?? []).join(", "),
  );
  const [description, setDescription] = useState(initial?.description ?? "");
  const [saving, setSaving] = useState(false);

  const filledAmenities = amenities
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const clientValidate = (): string | null => {
    if (title.trim().length < 3)
      return "Studio name needs at least 3 characters.";
    if (location.trim().length < 3) return "Please enter the studio location.";
    const rate = Number(hourlyRate);
    if (!Number.isFinite(rate) || rate < 1)
      return "Hourly rate must be at least $1.";
    if (!imageUrl.trim()) return null; // optional — a placeholder is applied
    if (!/^https?:\/\/\S+$/i.test(imageUrl.trim()))
      return "Please enter a valid http(s) image URL.";
    return null;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const problem = clientValidate();
    if (problem) {
      toast.error(problem);
      return;
    }

    if (saving) return;
    setSaving(true);

    const payload = {
      title: title.trim(),
      category,
      hourlyRate: Number(hourlyRate),
      securityDeposit: Number(securityDeposit || 0),
      location: location.trim(),
      imageUrl: imageUrl.trim() || DEFAULT_STUDIO_IMAGE,
      amenities: filledAmenities,
      description: description.trim(),
    };

    try {
      const response = await fetch(
        editing ? `/api/studios/${studioId}` : "/api/studios",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        toast.error("Please log in first.");
        setSaving(false);
        router.push("/login");
        return;
      }

      if (!response.ok) {
        toast.error(
          (data as { error?: string })?.error ??
            "Could not save the studio. Please try again.",
        );
        setSaving(false);
        return;
      }

      toast.success(
        editing ? "Studio updated." : "Your studio is now published!",
      );
      router.push("/dashboard/listings");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="studio-title" className={labelClass}>
            Studio name
          </label>
          <input
            id="studio-title"
            type="text"
            required
            maxLength={100}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. The White Frame Studio"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="studio-category" className={labelClass}>
            Category
          </label>
          <select
            id="studio-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className={`${inputClass} bg-white`}
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="studio-location" className={labelClass}>
            Location
          </label>
          <input
            id="studio-location"
            type="text"
            required
            maxLength={120}
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="City, State — e.g. Brooklyn, NY"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="studio-rate" className={labelClass}>
            Hourly rate (USD)
          </label>
          <input
            id="studio-rate"
            type="number"
            required
            min={1}
            max={10000}
            step={1}
            value={hourlyRate}
            onChange={(event) => setHourlyRate(event.target.value)}
            placeholder="85"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="studio-deposit" className={labelClass}>
            Security deposit (optional)
          </label>
          <input
            id="studio-deposit"
            type="number"
            min={0}
            max={100000}
            step={1}
            value={securityDeposit}
            onChange={(event) => setSecurityDeposit(event.target.value)}
            placeholder="0"
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="studio-image" className={labelClass}>
            Cover photo URL{" "}
            <span className="font-normal text-neutral-400">
              (optional — a shared placeholder is used when empty)
            </span>
          </label>
          <input
            id="studio-image"
            type="url"
            maxLength={500}
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            placeholder="https://images.unsplash.com/..."
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="studio-amenities" className={labelClass}>
            Amenities{" "}
            <span className="font-normal text-neutral-400">
              (comma-separated, up to 20)
            </span>
          </label>
          <input
            id="studio-amenities"
            type="text"
            value={amenities}
            onChange={(event) => setAmenities(event.target.value)}
            placeholder="White cyclorama wall, Lighting grid, Parking"
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="studio-description" className={labelClass}>
            Description
          </label>
          <textarea
            id="studio-description"
            rows={4}
            maxLength={2000}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Tell creators what makes your space special..."
            className={`${inputClass} resize-y`}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d5ff3f] px-5 py-4 text-sm font-bold text-[#171717] transition hover:bg-[#c6f02e] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            {editing ? "Saving changes..." : "Publishing..."}
          </>
        ) : (
          <>
            {editing ? (
              <Save size={18} />
            ) : (
              <Building2 size={18} />
            )}
            {editing ? "Save changes" : "Publish studio"}
          </>
        )}
      </button>
    </form>
  );
}
