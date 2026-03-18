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
    const file = formData.get("deckfile");

    if (!name) return setError("Deck name is required.");
    if (!(file instanceof File)) return setError("Deck file is required.");
    if (file.size === 0) return setError("Deck file is empty.");
    if (file.size > 1024 * 1024)
      return setError("Deck file is too large (max 1MB).");

    startTransition(async () => {
      const ext = (file.name.split(".").pop() || "").toLowerCase();
      if (ext !== "txt" && ext !== "csv") {
        return setError("Unsupported file type. Please upload a .txt or .csv.");
      }
      const contentType =
        ext === "csv"
          ? "text/csv"
          : file.type && file.type !== "application/octet-stream"
            ? file.type
            : "text/plain";
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("decklists")
        .upload(path, file, {
          upsert: false,
          contentType,
        });
      if (uploadError) return setError(uploadError.message);

      const { error: insertError } = await supabase.from("decks").insert({
        owner_id: userId,
        name,
        format: format || "Commander",
        storage_path: path,
        status: "pending",
      });
      if (insertError) return setError(insertError.message);

      setMessage("Uploaded. Your deck is pending admin review.");
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
          <span className="text-sm font-medium">Decklist file</span>
          <input
            name="deckfile"
            type="file"
            accept=".txt,.csv,text/plain,text/csv"
            required
            className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-zinc-900 hover:file:bg-zinc-200 dark:file:bg-zinc-900 dark:file:text-zinc-50 dark:hover:file:bg-zinc-800"
          />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Accepted: <code>.txt</code> and <code>.csv</code>. You’ll need a
            Supabase Storage bucket named <code>decklists</code>.
          </span>
        </label>

        <button
          disabled={pending}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          type="submit"
        >
          {pending ? "Uploading..." : "Upload for review"}
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

