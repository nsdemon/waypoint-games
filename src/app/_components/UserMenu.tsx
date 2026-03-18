"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function UserMenu() {
  const hasSupabaseEnv =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!hasSupabaseEnv) {
    return null;
  }

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (!active) return;
        setEmail(data.user?.email ?? null);
      })
      .catch(() => {
        if (!active) return;
        setEmail(null);
      });
    return () => {
      active = false;
    };
  }, [supabase]);

  function logout() {
    startTransition(async () => {
      await supabase.auth.signOut();
      window.location.href = "/";
    });
  }

  if (!email) {
    return (
      <a
        className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm font-semibold text-zinc-950 hover:bg-zinc-50 dark:border-white/15 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
        href="/login"
      >
        Sign in
      </a>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="hidden max-w-[240px] truncate text-sm text-zinc-600 dark:text-zinc-400 sm:block">
        {email}
      </div>
      <button
        type="button"
        onClick={logout}
        disabled={pending}
        className="rounded-full bg-zinc-950 px-3 py-1.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        {pending ? "Logging out..." : "Log out"}
      </button>
    </div>
  );
}

