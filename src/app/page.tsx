import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  let winnerName: string | null = null;
  let eventName: string | null = null;

  if (getSupabasePublicEnv()) {
    try {
      const supabase = await createSupabaseServerClient();
      const { data } = await supabase
        .from("announcements")
        .select("winner_name,event_name")
        .eq("id", 1)
        .maybeSingle();
      winnerName = data?.winner_name ?? null;
      eventName = data?.event_name ?? null;
    } catch {
      // ignore
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-12">
        <header className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">
            Congratulations {winnerName || "player"} for winning{" "}
            {eventName || "the event"}.
          </h1>
          <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
            Accounts, decklist uploads for admin review, match reporting by store
            + date/time, and a local leaderboard.
          </p>
        </header>

        <main className="grid gap-4 sm:grid-cols-2">
          <a
            className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-white/15 dark:bg-zinc-950"
            href="/login"
          >
            <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Account
            </div>
            <div className="mt-1 text-lg font-semibold">Sign in / Sign up</div>
          </a>
          <a
            className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-white/15 dark:bg-zinc-950"
            href="/report"
          >
            <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Match report
            </div>
            <div className="mt-1 text-lg font-semibold">
              Submit who played, where, when
            </div>
          </a>
          <a
            className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-white/15 dark:bg-zinc-950"
            href="/decks/upload"
          >
            <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Decklists
            </div>
            <div className="mt-1 text-lg font-semibold">
              Upload a deck for review
            </div>
          </a>
          <a
            className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-white/15 dark:bg-zinc-950"
            href="/leaderboard"
          >
            <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Stats
            </div>
            <div className="mt-1 text-lg font-semibold">Top 10 by wins</div>
          </a>
          <a
            className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-white/15 dark:bg-zinc-950"
            href="/rules"
          >
            <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Rules
            </div>
            <div className="mt-1 text-lg font-semibold">
              Ask a judge (rules chat)
            </div>
          </a>
        </main>
      </div>
    </div>
  );
}
