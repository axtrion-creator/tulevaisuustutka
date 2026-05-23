"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/types/schema";
import { getSupabaseConfig } from "./config";

export function createBrowserSupabaseClient() {
  const config = getSupabaseConfig();

  if (!config) {
    return null;
  }

  return createBrowserClient<Database>(config.url, config.anonKey);
}
