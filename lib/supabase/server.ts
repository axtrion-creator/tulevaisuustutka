import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/types/schema";
import { getSupabaseConfig } from "./config";

export async function createServerSupabaseClient() {
  const config = getSupabaseConfig();

  if (!config) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server components cannot always write cookies. Middleware is not required for this MVP shell.
        }
      }
    }
  });
}
