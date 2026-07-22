"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { staffAuthEmail } from "@/lib/auth/staffEmail";

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;
const RESERVED_SUBDOMAINS = new Set(["www", "mazaya", "super-admin", "api", "app", "not-found"]);

const registerSchema = z.object({
  academyNameAr: z.string().min(2, "الاسم بالعربية مطلوب"),
  academyNameEn: z.string().min(2, "الاسم بالإنجليزية مطلوب"),
  subdomain: z
    .string()
    .min(3, "3 أحرف على الأقل")
    .max(30)
    .regex(/^[a-z0-9-]+$/, "أحرف إنجليزية صغيرة وأرقام وشرطات فقط"),
  ownerName: z.string().min(2, "الاسم مطلوب"),
  ownerEmail: z.string().email("بريد إلكتروني غير صحيح"),
  ownerPhone: z.string().min(6, "رقم الهاتف مطلوب"),
  password: z.string().min(8, "8 أحرف على الأقل"),
  colorPrimary: z.string().regex(HEX_COLOR),
  colorSecondary: z.string().regex(HEX_COLOR),
  colorAccent: z.string().regex(HEX_COLOR),
});

export async function checkSubdomainAvailable(subdomain: string): Promise<boolean> {
  const normalized = subdomain.trim().toLowerCase();
  if (!/^[a-z0-9-]{3,30}$/.test(normalized) || RESERVED_SUBDOMAINS.has(normalized)) return false;

  const supabase = createAdminClient();
  const { data } = await supabase.from("tenants").select("id").eq("subdomain", normalized).maybeSingle();
  return !data;
}

export interface RegisterResult {
  success: boolean;
  error?: string;
  redirectUrl?: string;
}

export async function registerTenant(formData: FormData): Promise<RegisterResult> {
  const parsed = registerSchema.safeParse({
    academyNameAr: formData.get("academyNameAr"),
    academyNameEn: formData.get("academyNameEn"),
    subdomain: formData.get("subdomain"),
    ownerName: formData.get("ownerName"),
    ownerEmail: formData.get("ownerEmail"),
    ownerPhone: formData.get("ownerPhone"),
    password: formData.get("password"),
    colorPrimary: formData.get("colorPrimary"),
    colorSecondary: formData.get("colorSecondary"),
    colorAccent: formData.get("colorAccent"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "بيانات غير صحيحة" };
  }

  const data = parsed.data;
  const subdomain = data.subdomain.toLowerCase();

  if (!(await checkSubdomainAvailable(subdomain))) {
    return { success: false, error: "الرابط الفرعي غير متاح" };
  }

  const supabase = createAdminClient();

  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .insert({
      academy_name_ar: data.academyNameAr,
      academy_name_en: data.academyNameEn,
      subdomain,
      owner_name: data.ownerName,
      owner_email: data.ownerEmail,
      owner_phone: data.ownerPhone,
      color_primary: data.colorPrimary,
      color_secondary: data.colorSecondary,
      color_accent: data.colorAccent,
    })
    .select()
    .single();

  if (tenantError || !tenant) {
    const dup = tenantError?.code === "23505";
    return { success: false, error: dup ? "البريد الإلكتروني أو الرابط الفرعي مستخدم بالفعل" : "تعذر إنشاء الحساب" };
  }

  const logo = formData.get("logo");
  if (logo instanceof File && logo.size > 0) {
    const ext = logo.name.split(".").pop()?.toLowerCase();
    const validExt = ext && ["png", "jpg", "jpeg"].includes(ext);
    const validSize = logo.size <= 2 * 1024 * 1024;
    if (validExt && validSize) {
      const path = `${tenant.id}/logo.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("tenant-logos")
        .upload(path, logo, { contentType: logo.type, upsert: true });
      if (!uploadError) {
        const { data: publicUrl } = supabase.storage.from("tenant-logos").getPublicUrl(path);
        await supabase.from("tenants").update({ logo_url: publicUrl.publicUrl }).eq("id", tenant.id);
      }
    }
  }

  const username = data.ownerEmail;
  const authEmail = staffAuthEmail(tenant.id, username);

  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: authEmail,
    password: data.password,
    email_confirm: true,
  });

  if (authError || !authUser.user) {
    await supabase.from("tenants").delete().eq("id", tenant.id);
    return { success: false, error: "تعذر إنشاء حساب الدخول" };
  }

  const { error: staffError } = await supabase.from("staff").insert({
    tenant_id: tenant.id,
    auth_user_id: authUser.user.id,
    username,
    role: "admin",
  });

  if (staffError) {
    await supabase.auth.admin.deleteUser(authUser.user.id);
    await supabase.from("tenants").delete().eq("id", tenant.id);
    return { success: false, error: "تعذر إنشاء حساب المسؤول" };
  }

  // Registration happens on the root domain; the new tenant lives on its own
  // subdomain. Rather than fight cross-subdomain cookie sharing to carry the
  // fresh session over, send them to their subdomain's login page instead —
  // simpler and avoids any ambiguity about which origin owns the session.
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  const [hostname, port] = host.split(":");
  const redirectUrl = `${proto}://${subdomain}.${hostname}${port ? `:${port}` : ""}/login?welcome=1`;

  return { success: true, redirectUrl };
}
