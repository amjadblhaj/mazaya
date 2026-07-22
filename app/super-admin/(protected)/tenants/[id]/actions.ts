"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentSuperAdmin } from "@/lib/auth/getSuperAdmin";

export interface ActionState {
  error?: string;
  success?: boolean;
}

async function requireSuperAdmin() {
  const admin = await getCurrentSuperAdmin();
  if (!admin) return { error: "غير مصرح" as const };
  return { admin };
}

export async function activateSubscriptionAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await requireSuperAdmin();
  if ("error" in auth) return { error: auth.error };

  const tenantId = String(formData.get("tenantId") || "");
  const plan = String(formData.get("plan") || "");
  const months = Number(formData.get("months"));
  const paymentRef = String(formData.get("paymentRef") || "").trim();

  if (!tenantId || !["basic", "standard", "pro"].includes(plan)) return { error: "بيانات غير صحيحة" };
  if (![3, 6, 12].includes(months)) return { error: "مدة غير صحيحة" };
  if (!paymentRef) return { error: "رقم مرجع الدفع مطلوب" };

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("activate_subscription", {
    p_tenant_id: tenantId,
    p_plan: plan,
    p_months: months,
    p_payment_ref: paymentRef,
    p_activated_by: auth.admin.username,
  });

  if (error || !data?.success) return { error: "تعذر تفعيل الاشتراك" };

  revalidatePath(`/super-admin/tenants/${tenantId}`);
  revalidatePath("/super-admin/tenants");
  revalidatePath("/super-admin/dashboard");
  return { success: true };
}

export async function activateBranchAddonAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await requireSuperAdmin();
  if ("error" in auth) return { error: auth.error };

  const tenantId = String(formData.get("tenantId") || "");
  const branches = Number(formData.get("branches"));
  const paymentRef = String(formData.get("paymentRef") || "").trim();

  if (!tenantId) return { error: "بيانات غير صحيحة" };
  if (!Number.isInteger(branches) || branches <= 0) return { error: "عدد الفروع غير صحيح" };
  if (!paymentRef) return { error: "رقم مرجع الدفع مطلوب" };

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("activate_branch_addon", {
    p_tenant_id: tenantId,
    p_branches: branches,
    p_payment_ref: paymentRef,
    p_activated_by: auth.admin.username,
  });

  if (error || !data?.success) return { error: "تعذر تفعيل الإضافة" };

  revalidatePath(`/super-admin/tenants/${tenantId}`);
  revalidatePath("/super-admin/addons");
  return { success: true };
}

export async function suspendTenantAction(tenantId: string): Promise<ActionState> {
  const auth = await requireSuperAdmin();
  if ("error" in auth) return { error: auth.error };

  const supabase = createAdminClient();
  const { error } = await supabase.from("tenants").update({ status: "suspended" }).eq("id", tenantId);
  if (error) return { error: "تعذر إيقاف الأكاديمية" };

  revalidatePath(`/super-admin/tenants/${tenantId}`);
  revalidatePath("/super-admin/tenants");
  return { success: true };
}

export async function reactivateTenantAction(tenantId: string): Promise<ActionState> {
  const auth = await requireSuperAdmin();
  if ("error" in auth) return { error: auth.error };

  const supabase = createAdminClient();
  const { error } = await supabase.from("tenants").update({ status: "active" }).eq("id", tenantId);
  if (error) return { error: "تعذر إعادة التفعيل" };

  revalidatePath(`/super-admin/tenants/${tenantId}`);
  revalidatePath("/super-admin/tenants");
  return { success: true };
}

export async function extendTrialAction(tenantId: string, days: number): Promise<ActionState> {
  const auth = await requireSuperAdmin();
  if ("error" in auth) return { error: auth.error };
  if (!Number.isInteger(days) || days <= 0) return { error: "عدد أيام غير صحيح" };

  const supabase = createAdminClient();
  const { data: tenant } = await supabase.from("tenants").select("trial_ends_at").eq("id", tenantId).single();
  if (!tenant) return { error: "الأكاديمية غير موجودة" };

  const base = new Date(tenant.trial_ends_at) > new Date() ? new Date(tenant.trial_ends_at) : new Date();
  const newEnd = new Date(base.getTime() + days * 86_400_000);

  const { error } = await supabase.from("tenants").update({ trial_ends_at: newEnd.toISOString() }).eq("id", tenantId);
  if (error) return { error: "تعذر تمديد الفترة التجريبية" };

  revalidatePath(`/super-admin/tenants/${tenantId}`);
  return { success: true };
}

export async function rejectAddonAction(addonId: number): Promise<ActionState> {
  const auth = await requireSuperAdmin();
  if ("error" in auth) return { error: auth.error };

  const supabase = createAdminClient();
  const { error } = await supabase.from("branch_addons").update({ status: "rejected" }).eq("id", addonId);
  if (error) return { error: "تعذر الرفض" };

  revalidatePath("/super-admin/addons");
  return { success: true };
}
