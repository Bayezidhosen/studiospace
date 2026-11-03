"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Building, LoaderCircle, MapPin, PenLine, SquarePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { StudioRecord } from "@/lib/mongo";
import { useRequireSession } from "@/lib/use-require-session";

const CATEGORY_TAG = "bg-[#d5ff3f] text-black";

function listingImage(studio: StudioRecord): string | null {
  return studio.imageUrl || null;
}

export default function MyStudioListingsPage() {
  const { user, isPending } = useRequireSession();

  const [loading, setLoading] = useState(true);
  const [studios, setStudios] = useState<StudioRecord[]>([]);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadListings = useCallback(() => {
    return fetch("/api/studios/mine")
      .then((response) => response.json())
      .then((data) => {
        setStudios(Array.isArray(data?.studios) ? data.studios : []);
      })
      .catch(() => {
        setStudios([]);
        toast.error("Could not load your listings.");
      });
  }, []);

  useEffect(() => {
    if (isPending || !user) return;

    let cancelled = false;

    loadListings().finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [isPending, user, loadListings]);

  const handleDelete = async (studioId: string) => {
    if (deletingId) return;
    setDeletingId(studioId);

    try {
      const response = await fetch(`/api/studios/${studioId}`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        toast.error("Please log in to manage your listings.");
        return;
      }

      if (response.status === 403) {
        toast.error("You can only delete your own listings.");
        return;
      }

      if (!response.ok && response.status !== 404) {
        toast.error(
          (data as { error?: string })?.error ??
            "Could not delete the studio. Please try again.",
        );
        return;
      }

      /* Remove optimistically so the card disappears immediately. */
      setStudios((current) => current.filter((s) => s.id !== studioId));
      toast.success("Studio deleted.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setDeletingId(null);
      setConfirmingId(null);
    }
  };

  /* Session guard is resolving or redirecting — hold the page. */
  if (isPending || !user) {
    return (
      <main className="flex min-h-[80vh] items-center justify-center bg-[#f5f5f0]">
        <LoaderCircle className="h-7 w-7 animate-spin text-neutral-400" />
      </main>
    );
  }

  return (
    <main className="min-h-[85vh] bg-[#f5f5f0] px-4 py-12 text-[#171717]">
      <div className="container-custom">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 transition hover:text-black"
            >
              <ArrowLeft size={15} />
              Back to dashboard
            </Link>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              My Studio Listings
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              Manage the creative spaces you host on StudioSpace.
            </p>
          </div>

          <Link
            href="/studios/new"
            className="lime-button inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold"
          >
            <SquarePlus size={17} />
            Add New Studio
          </Link>
        </header>

        <section className="mt-10">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((row) => (
                <div
                  key={row}
                  className="h-72 animate-pulse rounded-3xl bg-white shadow-sm ring-1 ring-black/5"
                />
              ))}
            </div>
          ) : studios.length === 0 ? (
            <div className="rounded-3xl bg-white p-12 text-center shadow-sm ring-1 ring-black/5">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#171717] text-[#d5ff3f]">
                <Building size={26} />
              </div>

              <h2 className="mt-5 text-xl font-bold tracking-tight">
                No listings yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
                Publish your first studio and it will appear here — with
                edit and delete controls you control fully.
              </p>

              <Link
                href="/studios/new"
                className="lime-button mt-6 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold"
              >
                <SquarePlus size={16} />
                Add Your First Studio
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {studios.map((studio) => {
                const image = listingImage(studio);
                const confirming = confirmingId === studio.id;

                return (
                  <article
                    key={studio.id}
                    className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5"
                  >
                    <div className="relative h-44 w-full overflow-hidden bg-neutral-100">
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={image}
                          alt={studio.title}
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-neutral-300">
                          <Building size={40} />
                        </div>
                      )}

                      <span
                        className={`absolute left-4 top-4 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${CATEGORY_TAG}`}
                      >
                        {studio.category}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <h2 className="text-lg font-bold leading-snug">
                        {studio.title}
                      </h2>
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-neutral-500">
                        <MapPin size={13} />
                        {studio.location}
                      </p>

                      <p className="mt-3 text-xl font-black">
                        ${studio.hourlyRate}
                        <span className="text-xs font-normal text-neutral-500">
                          {" "}/ hr
                          {studio.securityDeposit > 0
                            ? ` · $${studio.securityDeposit} deposit`
                            : ""}
                        </span>
                      </p>

                      <div className="mt-5 flex items-center gap-2 border-t border-black/10 pt-4">
                        <Link
                          href={`/dashboard/listings/${studio.id}`}
                          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#171717] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#d5ff3f] hover:text-black"
                        >
                          <PenLine size={14} />
                          Edit
                        </Link>

                        {confirming ? (
                          <div className="flex flex-1 items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleDelete(studio.id)}
                              disabled={deletingId === studio.id}
                              className="rounded-full bg-red-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {deletingId === studio.id ? "Deleting…" : "Delete"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmingId(null)}
                              className="rounded-full border border-black/10 px-3 py-2 text-xs font-bold text-neutral-700 transition hover:border-black"
                            >
                              Keep
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmingId(studio.id)}
                            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-black/10 px-4 py-2.5 text-xs font-bold text-neutral-600 transition hover:border-red-300 hover:text-red-600"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
