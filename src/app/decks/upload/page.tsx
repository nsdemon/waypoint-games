import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import UploadDeckForm from "./ui/UploadDeckForm";

export default async function UploadDeckPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-12">
        <header className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Upload decklist
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Upload a text file for admin review.
            </p>
          </div>
          <a
            href="/"
            className="text-sm font-medium text-zinc-700 underline underline-offset-4 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
          >
            Home
          </a>
        </header>

        <UploadDeckForm userId={data.user.id} />
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          Admins can review pending decks at <a className="underline underline-offset-4" href="/admin/decks">/admin/decks</a>.
        </div>
      </div>
    </div>
  );
}

