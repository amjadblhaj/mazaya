"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTenantFromHeaders } from "@/lib/tenant/getTenantFromHeaders";
import { getCurrentStaff } from "@/lib/auth/getStaff";
import type { TenantBranding, Staff } from "@/types";

async function requireAdmin(): Promise<{ tenant: TenantBranding; staff: Staff } | { error: string }> {
  const tenant = await getTenantFromHeaders();
  const staff = await getCurrentStaff();
  if (!tenant || !staff) return { error: "غير مصرح" };
  if (staff.role !== "admin") return { error: "هذا الإجراء متاح للمسؤولين فقط" };
  return { tenant, staff };
}

export interface RewardFormState {
  error?: string;
  success?: boolean;
}

function readRewardFields(formData: FormData) {
  return {
    nameAr: String(formData.get("nameAr") || "").trim(),
    nameEn: String(formData.get("nameEn") || "").trim(),
    description: String(formData.get("description") || "").trim(),
    pointsRequired: Number(formData.get("pointsRequired")),
  };
}

export async function createRewardAction(_prev: RewardFormState, formData: FormData): Promise<RewardFormState> {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };

  const { nameAr, nameEn, description, pointsRequired } = readRewardFields(formData);
  if (!nameAr) return { error: "الاسم بالعربية مطلوب" };
  if (!Number.isInteger(pointsRequired) || pointsRequired <= 0) return { error: "عدد النقاط يجب أن يكون رقماً موجباً" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("rewards").insert({
    tenant_id: auth.tenant.id,
    name_ar: nameAr,
    name_en: nameEn || null,
    description: description || null,
    points_required: pointsRequired,
  });

  if (error) return { error: "تعذر إضافة المكافأة" };
  revalidatePath("/rewards");
  return { success: true };
}

export async function updateRewardAction(_prev: RewardFormState, formData: FormData): Promise<RewardFormState> {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };

  const id = Number(formData.get("id"));
  const { nameAr, nameEn, description, pointsRequired } = readRewardFields(formData);
  if (!Number.isInteger(id)) return { error: "خطأ في المعرف" };
  if (!nameAr) return { error: "الاسم بالعربية مطلوب" };
  if (!Number.isInteger(pointsRequired) || pointsRequired <= 0) return { error: "عدد النقاط يجب أن يكون رقماً موجباً" };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("rewards")
    .update({ name_ar: nameAr, name_en: nameEn || null, description: description || null, points_required: pointsRequired })
    .eq("id", id)
    .eq("tenant_id", auth.tenant.id);

  if (error) return { error: "تعذر تحديث المكافأة" };
  revalidatePath("/rewards");
  return { success: true };
}

export async function toggleRewardActiveAction(id: number, active: boolean): Promise<{ error?: string }> {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };

  const supabase = createAdminClient();
  const { error } = await supabase.from("rewards").update({ active }).eq("id", id).eq("tenant_id", auth.tenant.id);
  if (error) return { error: "تعذر التحديث" };
  revalidatePath("/rewards");
  return {};
}
