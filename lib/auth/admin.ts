import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/signals";

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const { data: userResult } = await supabase.auth.getUser();
  const user = userResult.user;

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, role, display_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!data) {
    return { id: user.id, role: "viewer", fullName: user.email ?? null };
  }

  return {
    id: typeof data.id === "string" ? data.id : user.id,
    role: data.role === "admin" ? "admin" : "viewer",
    fullName: typeof data.display_name === "string" ? data.display_name : null
  };
}

export async function requireAdmin() {
  const profile = await getCurrentProfile();
  return profile?.role === "admin" ? profile : null;
}
