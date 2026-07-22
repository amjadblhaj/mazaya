"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { superAdminAuthEmail } from "@/lib/auth/superAdminEmail";

export interface SuperAdminLoginState {
  error?: string;
}

const GENERIC_ERROR = "بيانات الدخول غير صحيحة";

export async function superAdminLoginAction(
  _prev: SuperAdminLoginState,
  formData: FormData
): Promise<SuperAdminLoginState> {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");
  if (!username || !password) return { error: "أدخل اسم المستخدم وكلمة المرور" };

  const supabase = await createClient();
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: superAdminAuthEmail(username),
    password,
  });

  if (error || !authData.user) return { error: GENERIC_ERROR };

  // Defense in depth: confirm this auth user actually has a super_admins row
  // before granting access — signInWithPassword only proves the credential
  // pair is valid, not that this identity is authorized as a super admin.
  const admin = createAdminClient();
  const { data: superAdmin } = await admin
    .from("super_admins")
    .select("id")
    .eq("auth_user_id", authData.user.id)
    .maybeSingle();

  if (!superAdmin) {
    await supabase.auth.signOut();
    return { error: GENERIC_ERROR };
  }

  redirect("/super-admin/dashboard");
}

export async function superAdminLogoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/super-admin/login");
}
