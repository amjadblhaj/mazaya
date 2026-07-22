"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTenantFromHeaders } from "@/lib/tenant/getTenantFromHeaders";

export async function markNotificationReadAction(id: number) {
  const tenant = await getTenantFromHeaders();
  if (!tenant) return;

  const supabase = createAdminClient();
  await supabase.from("notifications").update({ read: true }).eq("id", id).eq("tenant_id", tenant.id);
  revalidatePath("/", "layout");
}

export async function markAllNotificationsReadAction() {
  const tenant = await getTenantFromHeaders();
  if (!tenant) return;

  const supabase = createAdminClient();
  await supabase.from("notifications").update({ read: true }).eq("tenant_id", tenant.id).eq("read", false);
  revalidatePath("/", "layout");
}
