import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function LeaderboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("leaderboard_wins")
    .select("player_id, display_name, wins, games")
    .order("wins", { ascending: false })
    .order("games", { ascending: false })
    .limit(10);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <header className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Top 10 (by wins)
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Based on match reports submitted in the system.
            </p>
          </div>
          <a
            href="/"
            className="text-sm font-medium text-zinc-700 underline underline-offset-4 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
          >
            Home
          </a>
        </header>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/25 dark:bg-red-950/40 dark:text-red-200">
            {error.message}
          </div>
        ) : null}

        <div className="mt-6 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm dark:border-white/15 dark:bg-zinc-950">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900/50 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Player</th>
                <th className="px-4 py-3">Wins</th>
                <th className="px-4 py-3">Games</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((row, idx) => (
                <tr
                  key={row.player_id}
                  className="border-t border-black/5 dark:border-white/10"
                >
                  <td className="px-4 py-3 font-medium">{idx + 1}</td>
                  <td className="px-4 py-3">{row.display_name}</td>
                  <td className="px-4 py-3 font-semibold tabular-nums">
                    {row.wins}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{row.games}</td>
                </tr>
              ))}
              {data?.length === 0 ? (
                <tr className="border-t border-black/5 dark:border-white/10">
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-zinc-600 dark:text-zinc-400"
                  >
                    No matches yet. Submit a match report to populate stats.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

