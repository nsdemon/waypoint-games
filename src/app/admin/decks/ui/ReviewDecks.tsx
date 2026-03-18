"use client";

import { useMemo, useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Deck = {
  id: string;
  owner_id: string;
  name: string;
  format: string;
  status: "pending" | "approved" | "rejected";
  storage_path: string;
  created_at: string;
  review_notes: string | null;
};

type Owner = { id: string; display_name: string };

export default function ReviewDecks({
  adminId,
  decks,
  owners,
}: {
  adminId: string;
  decks: Deck[];
  owners: Owner[];
}) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [localDecks, setLocalDecks] = useState<Deck[]>(decks);

  const ownerName = useMemo(() => {
    const map = new Map<string, string>();
    owners.forEach((o) => map.set(o.id, o.display_name));
    return map;
  }, [owners]);

  function setStatus(deckId: string, status: "approved" | "rejected") {
    setError(null);
    startTransition(async () => {
      const { error: updateError } = await supabase
        .from("decks")
        .update({
          status,
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", deckId);
      if (updateError) return setError(updateError.message);
      setLocalDecks((d) => d.filter((x) => x.id !== deckId));
    });
  }

  async function openDownload(path: string) {
    setError(null);
    if (/^https?:\/\//i.test(path)) {
      window.open(path, "_blank", "noopener,noreferrer");
      return;
    }
    const { data, error: signedError } = await supabase.storage
      .from("decklists")
      .createSignedUrl(path, 60);
    if (signedError) return setError(signedError.message);
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-white shadow-sm dark:border-white/15 dark:bg-zinc-950">
      <div className="border-b border-black/5 px-5 py-4 text-sm text-zinc-600 dark:border-white/10 dark:text-zinc-400">
        Pending: <span className="font-semibold">{localDecks.length}</span>
      </div>

      {error ? (
        <div className="m-5 rounded-xl border border-red-500/20 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/25 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <ul className="divide-y divide-black/5 dark:divide-white/10">
        {localDecks.map((d) => (
          <li key={d.id} className="p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-lg font-semibold">{d.name}</div>
                <div className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
                  {d.format} • Uploaded by{" "}
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                    {ownerName.get(d.owner_id) ?? d.owner_id}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => openDownload(d.storage_path)}
                  className="h-10 rounded-xl border border-black/10 bg-white px-3 text-sm font-semibold text-zinc-950 hover:bg-zinc-50 dark:border-white/15 dark:bg-black dark:text-zinc-50 dark:hover:bg-zinc-900"
                >
                  View deck
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setStatus(d.id, "approved")}
                  className="h-10 rounded-xl bg-emerald-600 px-3 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
                >
                  Approve
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setStatus(d.id, "rejected")}
                  className="h-10 rounded-xl bg-red-600 px-3 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60"
                >
                  Reject
                </button>
              </div>
            </div>
          </li>
        ))}

        {localDecks.length === 0 ? (
          <li className="p-6 text-sm text-zinc-600 dark:text-zinc-400">
            Nothing pending right now.
          </li>
        ) : null}
      </ul>
    </div>
  );
}

