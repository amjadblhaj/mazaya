import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client — bypasses RLS entirely. Server-only (route handlers,
 * server actions, proxy.ts). Never import this from a Client Component; the
 * `server-only` import will fail the build if you try.
 *
 * Used for: subdomain -> tenant lookups (pre-auth), student portal auth
 * (students aren't Supabase Auth users), and every super-admin operation.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
