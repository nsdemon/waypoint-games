"use client";

import { useMemo, useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Store = { id: string; name: string; city: string; state: string };
type Player = { id: string; display_name: string };

export default function ReportForm({
  stores,
  players,
  currentUserId,
}: {
  stores: Store[];
  players: Player[];
  currentUserId: string;
}) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    setMessage(null);

    const storeId = String(formData.get("storeId") ?? "");
    const playedAt = String(formData.get("playedAt") ?? "");
    const notes = String(formData.get("notes") ?? "");
    const p1 = String(formData.get("player1") ?? "");
    const p2 = String(formData.get("player2") ?? "");
    const p3 = String(formData.get("player3") ?? "");
    const p4 = String(formData.get("player4") ?? "");
    const winner = String(formData.get("winner") ?? "");

    const playerIds = [p1, p2, p3, p4].filter(Boolean);
    const unique = new Set(playerIds);

    if (!storeId) return setError("Pick a store.");
    if (!playedAt) return setError("Pick a date.");
    if (playerIds.length < 2) return setError("Add at least 2 players.");
    if (unique.size !== playerIds.length)
      return setError("Players must be unique.");
    if (!winner) return setError("Pick a winner.");
    if (!unique.has(winner)) return setError("Winner must be one of the players.");

    startTransition(async () => {
      const { data: match, error: matchError } = await supabase
        .from("matches")
        .insert({
          store_id: storeId,
          // `playedAt` is YYYY-MM-DD from an `<input type="date" />`.
          // Store as ISO by defaulting to local midnight.
          played_at: new Date(`${playedAt}T00:00:00`).toISOString(),
          created_by: currentUserId,
          notes: notes || null,
        })
        .select("id")
        .single();

      if (matchError) return setError(matchError.message);

      const rows = playerIds.map((id) => ({
        match_id: match.id,
        player_id: id,
        is_winner: id === winner,
      }));

      const { error: playersError } = await supabase
        .from("match_players")
        .insert(rows);
      if (playersError) return setError(playersError.message);

      setMessage("Match submitted.");
    });
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/15 dark:bg-zinc-950">
      {stores.length === 0 ? (
        <div className="rounded-xl border border-amber-500/25 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-950/35 dark:text-amber-100">
          No stores are set up yet. An admin needs to add at least one store
          before match reporting can be used.
        </div>
      ) : null}

      <form action={onSubmit} className="mt-4 grid gap-4">
        <label className="grid gap-1">
          <span className="text-sm font-medium">Store</span>
          <select
            name="storeId"
            required
            className="h-11 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:bg-black"
            defaultValue=""
            disabled={stores.length === 0}
          >
            <option value="" disabled>
              Select a store
            </option>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.city}, {s.state})
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Date</span>
          <input
            name="playedAt"
            type="date"
            required
            className="h-11 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:bg-black"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <label key={n} className="grid gap-1">
              <span className="text-sm font-medium">Player {n}</span>
              <select
                name={`player${n}`}
                className="h-11 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:bg-black"
                defaultValue=""
              >
                <option value="">(optional)</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.display_name}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Winner</span>
          <select
            name="winner"
            required
            className="h-11 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:bg-black"
            defaultValue=""
          >
            <option value="" disabled>
              Select winner
            </option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.display_name}
              </option>
            ))}
          </select>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Tip: only players included above should be chosen.
          </span>
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Notes (optional)</span>
          <textarea
            name="notes"
            className="min-h-[88px] rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:bg-black"
            placeholder="Format, round, anything helpful..."
          />
        </label>

        <button
          disabled={pending || stores.length === 0}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          type="submit"
        >
          {pending ? "Submitting..." : "Submit match"}
        </button>
      </form>

      {error ? (
        <div className="mt-3 rounded-xl border border-red-500/20 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/25 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-950/40 dark:text-emerald-200">
          {message}
        </div>
      ) : null}

      <div className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
        Players shown come from `profiles`. If you don’t see someone, they need
        to create an account first.
      </div>
    </div>
  );
}

