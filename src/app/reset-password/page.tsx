import ResetPasswordClient from "./ui/ResetPasswordClient";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import SupabaseNotConfigured from "@/app/_components/SupabaseNotConfigured";

export default function ResetPasswordPage() {
  if (!getSupabasePublicEnv()) return <SupabaseNotConfigured />;
  return <ResetPasswordClient />;
}

