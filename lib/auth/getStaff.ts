import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Staff } from "@/types";

/** Current signed-in staff member, or null if unauthenticated / not staff. */
export async function getCurrentStaff(): Promise<Staff | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.from("staff").select("*").eq("auth_user_id", user.id).single();
  if (error || !data) return null;
  return data as Staff;
}
