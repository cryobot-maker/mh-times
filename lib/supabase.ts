import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function getSupabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL;
}

function getSupabaseKey(preferServiceRole = false): string | undefined {
  if (preferServiceRole && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return process.env.SUPABASE_SERVICE_ROLE_KEY;
  }
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

/** Browser / server client (anon key). Returns null if env vars are missing. */
export function createClient() {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();
  if (!url || !key) {
    return null;
  }
  return createSupabaseClient(url, key);
}

/** Server-only client for cron upserts (service role when available) */
export function createServiceClient() {
  const url = getSupabaseUrl();
  const key = getSupabaseKey(true);
  if (!url || !key) {
    return null;
  }
  return createSupabaseClient(url, key);
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseKey());
}
