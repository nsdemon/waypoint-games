"use client";

import { useMemo, useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function UploadDeckForm({ userId }: { userId: string }) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    setMessage(null);

    const name = String(formData.get("name") ?? "").trim();
    const format = String(formData.get("format") ?? "Commander").trim();
    const archidektUrl = String(formData.get("archidektUrl") ?? "").trim();

    if (!name) return setError("Deck name is required.");
    if (!archidektUrl) return setError("Archidekt URL is required.");

    startTransition(async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) return setError(userError.message);
      if (!user) {
        setError("You’re not signed in. Please sign in again.");
        window.location.href = "/login";
        return;
      }

      let url: URL;
      try {
        url = new URL(archidektUrl);
      } catch {
        return setError("Please paste a valid Archidekt URL.");
      }
      const host = url.hostname.toLowerCase();
      if (host !== "archidekt.com" && !host.endsWith(".archidekt.com")) {
        return setError("Please use a link from archidekt.com.");
      }
      const storage_path = url.toString();

      const { error: insertError } = await supabase.from("decks").insert({
        owner_id: user.id,
        name,
        format: format || "Commander",
        storage_path,
        status: "pending",
      });
      if (insertError) return setError(insertError.message);

      setMessage("Linked. Your deck is pending admin review.");
    });
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/15 dark:bg-zinc-950">
      <form action={onSubmit} className="grid gap-4">
        <label className="grid gap-1">
          <span className="text-sm font-medium">Deck name</span>
          <input
            name="name"
            required
            className="h-11 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:bg-black"
            placeholder="Muldrotha Value"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Format</span>
          <input
            name="format"
            className="h-11 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:bg-black"
            placeholder="Commander"
            defaultValue="Commander"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Archidekt deck URL</span>
          <input
            name="archidektUrl"
            type="url"
            required
            placeholder="https://archidekt.com/decks/..."
            className="h-11 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:bg-black"
          />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            We’ll store the link for admin review. Archidekt is unaffiliated.
          </span>
        </label>

        <button
          disabled={pending}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          type="submit"
        >
          {pending ? "Linking..." : "Link for review"}
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
    </div>
  );
}

