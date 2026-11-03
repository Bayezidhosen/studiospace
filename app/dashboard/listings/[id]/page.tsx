"use client";

import { Suspense, use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, LoaderCircle, ShieldAlert } from "lucide-react";

import { useRequireSession } from "@/lib/use-require-session";
import StudioForm from "@/components/studio/studio-form";
import type { StudioRecord } from "@/lib/mongo";

type Props = {
  params: Promise<{ id: string }>;
};

/** Static shell shown while the dynamic params resolve. */
function EditFallback() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="h-6 w-56 animate-pulse rounded bg-black/10" />
      <div className="mt-6 h-96 animate-pulse rounded-3xl bg-white shadow-sm ring-1 ring-black/5" />
    </div>
  );
}

export default function EditStudioListingPage({ params }: Props) {
  return (
    <main className="min-h-[85vh] bg-[#f5f5f0] px-4 py-12 text-[#171717]">
      <Suspense fallback={<EditFallback />}>
        <EditListing params={params} />
      </Suspense>
    </main>
  );
}

function EditListing({ params }: Props) {
  const { id } = use(params);
  const { user, isPending } = useRequireSession();

  const [loading, setLoading] = useState(true);
  const [studio, setStudio] = useState<StudioRecord | null>(null);
  const [owned, setOwned] = useState(false);

  useEffect(() => {
    if (isPending || !user) return;

    let cancelled = false;

    Promise.all([
      fetch(`/api/studios/${id}`).then((r) => (r.ok ? r.json() : null)),
      fetch("/api/studios/mine").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([studioData, mineData]) => {
        if (cancelled) return;

        const record = studioData?.studio ?? null;
        setStudio(record);

        const mine: StudioRecord[] = Array.isArray(mineData?.studios)
          ? mineData.studios
          : [];
        setOwned(mine.some((item) => item.id === id));
      })
      .catch(() => setStudio(null))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, isPending, user]);

  /* Session guard is resolving or redirecting — hold the page. */
  if (isPending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoaderCircle className="h-7 w-7 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/dashboard/listings"
        className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 transition hover:text-black"
      >
        <ArrowLeft size={15} />
        Back to my listings
      </Link>

      <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
        Edit listing
      </h1>

      {loading ? (
        <div className="mt-8 flex items-center justify-center rounded-3xl bg-white p-16 shadow-sm ring-1 ring-black/5">
          <LoaderCircle className="h-7 w-7 animate-spin text-neutral-400" />
        </div>
      ) : !studio || !owned ? (
        /* Missing record or one owned by a different host. */
        <div className="mt-8 rounded-3xl bg-white p-12 text-center shadow-sm ring-1 ring-black/5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
            <ShieldAlert size={26} />
          </div>
          <h2 className="mt-4 text-xl font-bold">
            {studio ? "Not your listing" : "Studio not found"}
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-500">
            {studio
              ? "You can only edit studios that you published."
              : "This studio does not exist or has been removed."}
          </p>
          <Link
            href="/dashboard/listings"
            className="mt-6 inline-flex items-center rounded-full bg-[#171717] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#d5ff3f] hover:text-black"
          >
            View my listings
          </Link>
        </div>
      ) : (
        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-10">
          <StudioForm mode="edit" studioId={studio.id} initial={studio} />
        </div>
      )}
    </div>
  );
}
