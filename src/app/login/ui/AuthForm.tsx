"use client";

import { useMemo, useState, useTransition } from "react";
import { z } from "zod";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2).max(40),
});

type Mode = "signin" | "signup";

export default function AuthForm() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [mode, setMode] = useState<Mode>("signin");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    setMessage(null);

    const raw = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      displayName: String(formData.get("displayName") ?? ""),
    };

    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid form input.");
      return;
    }

    startTransition(async () => {
      if (mode === "signin") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (signInError) {
          setError(signInError.message);
          return;
        }
        window.location.href = "/";
        return;
      }

      const { error: signUpError } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          data: { display_name: parsed.data.displayName },
        },
      });
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      setMessage(
        "Account created. If email confirmation is enabled, check your inbox.",
      );
    });
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/15 dark:bg-zinc-950">
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          Mode
        </div>
        <div className="flex rounded-full bg-zinc-100 p-1 dark:bg-zinc-900">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={[
              "rounded-full px-3 py-1 text-sm font-medium transition",
              mode === "signin"
                ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50",
            ].join(" ")}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={[
              "rounded-full px-3 py-1 text-sm font-medium transition",
              mode === "signup"
                ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50",
            ].join(" ")}
          >
            Sign up
          </button>
        </div>
      </div>

      <form action={onSubmit} className="mt-5 flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Email</span>
          <input
            name="email"
            type="email"
            required
            className="h-11 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none ring-0 focus:border-black/20 dark:border-white/15 dark:bg-black"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Password</span>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            className="h-11 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none ring-0 focus:border-black/20 dark:border-white/15 dark:bg-black"
            placeholder="••••••••"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
          />
        </label>

        {mode === "signup" ? (
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Display name</span>
            <input
              name="displayName"
              type="text"
              required
              className="h-11 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none ring-0 focus:border-black/20 dark:border-white/15 dark:bg-black"
              placeholder="Your name"
              autoComplete="nickname"
            />
          </label>
        ) : null}

        <button
          disabled={pending}
          className="mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          type="submit"
        >
          {pending ? "Working..." : mode === "signin" ? "Sign in" : "Create account"}
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

