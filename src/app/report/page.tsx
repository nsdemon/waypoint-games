import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import ReportForm from "./ui/ReportForm";

export default async function ReportPage() {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  const [{ data: stores, error: storesError }, { data: profiles }] =
    await Promise.all([
      supabase.from("stores").select("id,name,city,state").order("name"),
      supabase.from("profiles").select("id,display_name").order("display_name"),
    ]);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-12">
        <header className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Match report
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Log who played, what store, and when.
            </p>
          </div>
          <a
            href="/"
            className="text-sm font-medium text-zinc-700 underline underline-offset-4 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
          >
            Home
          </a>
        </header>

        {storesError ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/25 dark:bg-red-950/40 dark:text-red-200">
            {storesError.message}
          </div>
        ) : null}

        <ReportForm
          stores={stores ?? []}
          players={profiles ?? []}
          currentUserId={userData.user.id}
        />
      </div>
    </div>
  );
}

