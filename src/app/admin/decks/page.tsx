import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import ReviewDecks from "./ui/ReviewDecks";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import SupabaseNotConfigured from "@/app/_components/SupabaseNotConfigured";

export default async function AdminDecksPage() {
  if (!getSupabasePublicEnv()) return <SupabaseNotConfigured />;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userData.user.id)
    .single();

  if (!profile?.is_admin) redirect("/");

  const { data: decks, error } = await supabase
    .from("decks")
    .select("id,name,format,status,storage_path,created_at,owner_id,review_notes")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  const { data: owners } = await supabase
    .from("profiles")
    .select("id,display_name");

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-12">
        <header className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Deck review queue
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Approve or reject uploaded decklists.
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
          <div className="rounded-2xl border border-red-500/20 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/25 dark:bg-red-950/40 dark:text-red-200">
            {error.message}
          </div>
        ) : null}

        <ReviewDecks
          adminId={userData.user.id}
          decks={decks ?? []}
          owners={owners ?? []}
        />
      </div>
    </div>
  );
}

