export default function RulesPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-12">
        <header className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Rules questions
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Need a ruling? Ask a judge in the Magic Judges rules chat.
            </p>
          </div>
          <a
            href="/"
            className="text-sm font-medium text-zinc-700 underline underline-offset-4 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
          >
            Home
          </a>
        </header>

        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/15 dark:bg-zinc-950">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Opens in a new tab
          </div>
          <a
            className="mt-2 inline-flex items-center justify-center rounded-xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            href="https://chat.magicjudges.org/mtgrules/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Go to Magic Judges Rules Chat
          </a>

          <div className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
            Not affiliated with Wizards of the Coast.
          </div>
        </div>
      </div>
    </div>
  );
}

