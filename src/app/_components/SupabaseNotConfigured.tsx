export default function SupabaseNotConfigured() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-12">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Supabase not configured
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Add these environment variables in Vercel (and optionally in your
            local <code>.env.local</code>), then redeploy.
          </p>
        </header>

        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/15 dark:bg-zinc-950">
          <ul className="list-disc space-y-2 pl-5 text-sm">
            <li>
              <code>NEXT_PUBLIC_SUPABASE_URL</code>
            </li>
            <li>
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
            </li>
          </ul>
          <div className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
            Supabase Dashboard → Project Settings → API → Project URL + anon
            public key.
          </div>
        </div>

        <a
          href="/"
          className="text-sm font-medium text-zinc-700 underline underline-offset-4 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
        >
          Back home
        </a>
      </div>
    </div>
  );
}

