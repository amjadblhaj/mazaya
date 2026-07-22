import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { TenantBranding } from "@/types";

const BRANDING_COLUMNS =
  "id, academy_name_ar, academy_name_en, logo_url, color_primary, color_secondary, color_accent, color_dark, status, trial_ends_at, subscription_ends_at, welcome_message";

/**
 * Pre-auth tenant lookup by subdomain, called from proxy.ts on every tenant
 * request. Uses the service-role client because `tenants` has RLS enabled
 * with no anon/authenticated policies (see supabase/sql/001_schema.sql) —
 * there is no signed-in user yet at this point in the request lifecycle.
 */
export async function getTenantBySubdomain(subdomain: string): Promise<TenantBranding | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("tenants")
    .select(BRANDING_COLUMNS)
    .eq("subdomain", subdomain)
    .single();

  if (error || !data) return null;
  return data;
}
