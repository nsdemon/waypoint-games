"use client";

import { useMemo, useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AnnouncementForm({
  initialWinner,
  initialEvent,
}: {
  initialWinner: string;
  initialEvent: string;
}) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [pending, startTransition] = useTransition();
  const [winner, setWinner] = useState(initialWinner);
  const [event, setEvent] = useState(initialEvent);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function save() {
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        setError(userError.message);
        return;
      }
      if (!userData.user) {
        setError("You’re not signed in.");
        return;
      }

      const { error: upsertError } = await supabase.from("announcements").upsert(
        {
          id: 1,
          winner_name: winner.trim() || null,
          event_name: event.trim() || null,
          updated_by: userData.user.id,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );

      if (upsertError) {
        setError(upsertError.message);
        return;
      }
      setMessage("Saved. Refresh the homepage to see the new banner.");
    });
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/15 dark:bg-zinc-950">
      <div className="grid gap-4">
        <label className="grid gap-1">
          <span className="text-sm font-medium">Player name</span>
          <input
            value={winner}
            onChange={(e) => setWinner(e.target.value)}
            className="h-11 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:bg-black"
            placeholder="Player Name"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-sm font-medium">Event name</span>
          <input
            value={event}
            onChange={(e) => setEvent(e.target.value)}
            className="h-11 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:bg-black"
            placeholder="Event Name"
          />
        </label>

        <div className="rounded-xl border border-black/10 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 dark:border-white/10 dark:bg-black dark:text-zinc-300">
          Preview:{" "}
          <span className="font-semibold">
            Congratulations {winner.trim() || "Player"} for winning{" "}
            {event.trim() || "Event"}.
          </span>
        </div>

        <button
          type="button"
          disabled={pending}
          onClick={save}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {pending ? "Saving..." : "Save"}
        </button>

        {error ? (
          <div className="rounded-xl border border-red-500/20 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/25 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        ) : null}
        {message ? (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-950/40 dark:text-emerald-200">
            {message}
          </div>
        ) : null}
      </div>
    </div>
  );
}

