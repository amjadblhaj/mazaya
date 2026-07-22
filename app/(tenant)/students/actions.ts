"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTenantFromHeaders } from "@/lib/tenant/getTenantFromHeaders";
import { getCurrentStaff } from "@/lib/auth/getStaff";

export interface CreateStudentState {
  error?: string;
}

export async function createStudentAction(
  _prev: CreateStudentState,
  formData: FormData
): Promise<CreateStudentState> {
  const tenant = await getTenantFromHeaders();
  const staff = await getCurrentStaff();
  if (!tenant || !staff) return { error: "غير مصرح" };

  const fullName = String(formData.get("fullName") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const branchIdRaw = formData.get("branchId");
  const password = String(formData.get("password") || "");

  if (!fullName || !phone || !password) return { error: "جميع الحقول مطلوبة" };
  if (password.length < 6) return { error: "كلمة المرور 6 أحرف على الأقل" };

  const supabase = createAdminClient();

  const { data: limitCheck } = await supabase.rpc("can_add_student", { p_tenant_id: tenant.id });
  if (!limitCheck?.allowed) {
    return {
      error: limitCheck?.reason === "student_limit_reached" ? "وصلت للحد الأقصى من الطلاب المسموح به" : "لا يمكن إضافة طالب حالياً",
    };
  }

  const hash = await bcrypt.hash(password, 12);
  const branchId = branchIdRaw && branchIdRaw !== "" ? Number(branchIdRaw) : null;

  const { data: student, error } = await supabase
    .from("students")
    .insert({ tenant_id: tenant.id, full_name: fullName, phone, branch_id: branchId, password: hash })
    .select("id")
    .single();

  if (error) {
    return { error: error.code === "23505" ? "رقم الهاتف مستخدم بالفعل" : "تعذر إضافة الطالب" };
  }

  revalidatePath("/students");
  redirect(`/students/${student.id}`);
}
