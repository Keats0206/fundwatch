import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client with secret/service_role key.
 * Use for mutations (insert/update/delete).
 * Supports both new (sb_secret_...) and legacy (service_role JWT) keys.
 * Never expose this key to the client.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
export function createSupabaseServerClient() {
  if (!supabaseUrl || !serviceRoleKey) return null;
  return createClient(supabaseUrl, serviceRoleKey);
}
