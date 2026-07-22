import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SuperAdmin } from "@/types";

/**
 * Current signed-in super admin, or null. Uses the session-scoped client
 * only to identify who's logged in (getUser() validates against the Auth
 * server); the super_admins lookup itself goes through the admin client —
 * that table has no client-facing RLS policy (same reason tenants doesn't),
 * so the regular client would silently return nothing here.
 */
export async function getCurrentSuperAdmin(): Promise<SuperAdmin | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data, error } = await admin.from("super_admins").select("*").eq("auth_user_id", user.id).maybeSingle();
  if (error || !data) return null;
  return data as SuperAdmin;
}
