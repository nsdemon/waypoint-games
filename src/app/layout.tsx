import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import UserMenu from "@/app/_components/UserMenu";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Baton Rouge MTG Tracker",
  description:
    "Track Magic: The Gathering games and local player stats in Baton Rouge, LA.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let isAdmin = false;
  if (getSupabasePublicEnv()) {
    try {
      const supabase = await createSupabaseServerClient();
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();
        isAdmin = !!profile?.is_admin;
      }
    } catch {
      // If Supabase isn't configured or is temporarily unavailable,
      // don't render admin navigation.
      isAdmin = false;
    }
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-black/50">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3">
            <a
              href="/"
              className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-zinc-50"
            >
              Baton Rouge MTG Tracker
            </a>
            <div className="flex items-center gap-2">
              <a
                href="/decks/upload"
                className="hidden rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm font-semibold text-zinc-950 hover:bg-zinc-50 dark:border-white/15 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900 sm:inline-flex"
              >
                Link deck
              </a>
              {isAdmin ? (
                <div className="hidden items-center gap-2 sm:flex">
                  <a
                    href="/admin/decks"
                    className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm font-semibold text-zinc-950 hover:bg-zinc-50 dark:border-white/15 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
                  >
                    Admin
                  </a>
                  <a
                    href="/admin/announcement"
                    className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm font-semibold text-zinc-950 hover:bg-zinc-50 dark:border-white/15 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
                  >
                    Banner
                  </a>
                </div>
              ) : null}
              <UserMenu />
            </div>
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}
