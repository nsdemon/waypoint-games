"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminLink() {
  const hasSupabaseEnv =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const supabase = useMemo(
    () => (hasSupabaseEnv ? createSupabaseBrowserClient() : null),
    [hasSupabaseEnv],
  );
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;

    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (cancelled) return;
      setIsAdmin(!!data?.is_admin);
    })();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  if (!isAdmin) return null;

  return (
    <a
      href="/admin/decks"
      className="hidden rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm font-semibold text-zinc-950 hover:bg-zinc-50 dark:border-white/15 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900 sm:inline-flex"
    >
      Admin
    </a>
  );
}

