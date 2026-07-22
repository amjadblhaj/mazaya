"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTenantFromHeaders } from "@/lib/tenant/getTenantFromHeaders";
import { staffAuthEmail } from "@/lib/auth/staffEmail";
import { createStudentSession, clearStudentSession } from "@/lib/auth/studentSession";

export interface LoginState {
  error?: string;
}

const GENERIC_ERROR = "بيانات الدخول غير صحيحة";

export async function staffLoginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");
  if (!username || !password) return { error: "أدخل اسم المستخدم وكلمة المرور" };

  const tenant = await getTenantFromHeaders();
  if (!tenant) return { error: "الأكاديمية غير معروفة" };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: staffAuthEmail(tenant.id, username),
    password,
  });

  if (error) return { error: GENERIC_ERROR };

  redirect("/dashboard");
}

export async function studentLoginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const phone = String(formData.get("phone") || "").trim();
  const password = String(formData.get("password") || "");
  if (!phone || !password) return { error: "أدخل رقم الهاتف وكلمة المرور" };

  const tenant = await getTenantFromHeaders();
  if (!tenant) return { error: "الأكاديمية غير معروفة" };

  const supabase = createAdminClient();
  const { data: student, error } = await supabase
    .from("students")
    .select("id, password, active")
    .eq("tenant_id", tenant.id)
    .eq("phone", phone)
    .maybeSingle();

  if (error || !student || !student.active) return { error: GENERIC_ERROR };

  const valid = await bcrypt.compare(password, student.password);
  if (!valid) return { error: GENERIC_ERROR };

  await createStudentSession({ studentId: student.id, tenantId: tenant.id });
  redirect("/portal");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  await clearStudentSession();
  redirect("/login");
}
