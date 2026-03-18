"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function parseHashParams(hash: string) {
  const h = hash.startsWith("#") ? hash.slice(1) : hash;
  const sp = new URLSearchParams(h);
  return {
    access_token: sp.get("access_token"),
    refresh_token: sp.get("refresh_token"),
    type: sp.get("type"),
  };
}

export default function ResetPasswordClient() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [pending, startTransition] = useTransition();
  const [stage, setStage] = useState<
    "verifying" | "ready" | "done" | "error"
  >("verifying");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setError(null);
      setMessage(null);
      setStage("verifying");

      try {
        // Handles PKCE links with `?code=...`
        const url = new URL(window.location.href);
        if (url.searchParams.get("code")) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
            window.location.href,
          );
          if (exchangeError) throw exchangeError;
        } else {
          // Handles implicit flow links with tokens in the hash
          const { access_token, refresh_token, type } = parseHashParams(
            window.location.hash,
          );
          if (type === "recovery" && access_token && refresh_token) {
            const { error: setError } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });
            if (setError) throw setError;
          }
        }

        const { data } = await supabase.auth.getUser();
        if (!data.user) {
          throw new Error(
            "This reset link is missing or expired. Request another password reset.",
          );
        }

        if (!cancelled) setStage("ready");
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : "Failed to verify reset link.";
        if (!cancelled) {
          setError(msg);
          setStage("error");
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  function onSubmit(formData: FormData) {
    setError(null);
    setMessage(null);

    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("confirm") ?? "");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");

    startTransition(async () => {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        return;
      }
      setMessage("Password updated. You can now sign in.");
      setStage("done");
    });
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto flex max-w-md flex-col gap-6 px-6 py-12">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Reset password</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Set a new password for your account.
          </p>
        </header>

        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/15 dark:bg-zinc-950">
          {stage === "verifying" ? (
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              Verifying reset link…
            </div>
          ) : null}

          {stage === "ready" ? (
            <form action={onSubmit} className="grid gap-3">
              <label className="grid gap-1">
                <span className="text-sm font-medium">New password</span>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  className="h-11 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:bg-black"
                  autoComplete="new-password"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-sm font-medium">Confirm password</span>
                <input
                  name="confirm"
                  type="password"
                  required
                  minLength={8}
                  className="h-11 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:bg-black"
                  autoComplete="new-password"
                />
              </label>

              <button
                disabled={pending}
                className="mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                type="submit"
              >
                {pending ? "Updating..." : "Update password"}
              </button>
            </form>
          ) : null}

          {stage === "done" ? (
            <a
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Go to sign in
            </a>
          ) : null}

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

