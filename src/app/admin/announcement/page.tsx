import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import SupabaseNotConfigured from "@/app/_components/SupabaseNotConfigured";
import AnnouncementForm from "./ui/AnnouncementForm";

export default async function AdminAnnouncementPage() {
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

  const { data: ann } = await supabase
    .from("announcements")
    .select("winner_name,event_name")
    .eq("id", 1)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-12">
        <header className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Announcement banner
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Controls the congratulations message on the homepage.
            </p>
          </div>
          <a
            href="/"
            className="text-sm font-medium text-zinc-700 underline underline-offset-4 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
          >
            Home
          </a>
        </header>

        <AnnouncementForm
          initialWinner={ann?.winner_name ?? ""}
          initialEvent={ann?.event_name ?? ""}
        />
      </div>
    </div>
  );
}

