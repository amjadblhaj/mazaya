"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTenantFromHeaders } from "@/lib/tenant/getTenantFromHeaders";
import { getCurrentStaff } from "@/lib/auth/getStaff";

export interface FoundStudent {
  id: number;
  full_name: string;
  phone: string;
  points: number;
  branch_id: number | null;
}

export async function findStudentByPhone(phone: string): Promise<FoundStudent | null> {
  const tenant = await getTenantFromHeaders();
  if (!tenant || !phone.trim()) return null;

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("students")
    .select("id, full_name, phone, points, branch_id")
    .eq("tenant_id", tenant.id)
    .eq("phone", phone.trim())
    .eq("active", true)
    .maybeSingle();

  return data;
}

export interface GrantState {
  error?: string;
  success?: boolean;
  newBalance?: number;
}

export async function grantPointsAction(_prev: GrantState, formData: FormData): Promise<GrantState> {
  const tenant = await getTenantFromHeaders();
  const staff = await getCurrentStaff();
  if (!tenant || !staff) return { error: "غير مصرح" };

  const studentId = Number(formData.get("studentId"));
  const points = Number(formData.get("points"));
  const reason = String(formData.get("reason") || "").trim();

  if (!Number.isInteger(studentId) || studentId <= 0) return { error: "اختر طالباً أولاً" };
  if (!Number.isInteger(points) || points === 0) return { error: "أدخل عدد نقاط صحيح" };
  if (!reason) return { error: "أدخل السبب" };

  const supabase = createAdminClient();
  const { data: student } = await supabase
    .from("students")
    .select("branch_id")
    .eq("tenant_id", tenant.id)
    .eq("id", studentId)
    .maybeSingle();

  if (!student) return { error: "الطالب غير موجود" };

  const { data, error } = await supabase.rpc("grant_points", {
    p_tenant_id: tenant.id,
    p_student_id: studentId,
    p_points: points,
    p_action: reason,
    p_type: "manual",
    p_granted_by: staff.username,
    p_branch_id: student.branch_id,
    p_note: null,
  });

  if (error || !data?.success) {
    const reasonCode = data?.error;
    const message =
      reasonCode === "insufficient_points"
        ? "النقاط غير كافية لهذا الخصم"
        : reasonCode === "student_not_found"
          ? "الطالب غير موجود"
          : "تعذر تنفيذ العملية";
    return { error: message };
  }

  revalidatePath("/students");
  revalidatePath(`/students/${studentId}`);
  return { success: true, newBalance: data.new_balance };
}
