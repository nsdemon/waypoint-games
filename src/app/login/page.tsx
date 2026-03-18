import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AuthForm from "./ui/AuthForm";

export default async function LoginPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect("/");

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto flex max-w-md flex-col gap-6 px-6 py-12">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Sign in or create an account.
          </p>
        </header>
        <AuthForm />
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

