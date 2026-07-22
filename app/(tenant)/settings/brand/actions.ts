"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTenantFromHeaders } from "@/lib/tenant/getTenantFromHeaders";
import { getCurrentStaff } from "@/lib/auth/getStaff";

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

export interface BrandSettingsState {
  error?: string;
  success?: boolean;
}

export async function updateBrandingAction(_prev: BrandSettingsState, formData: FormData): Promise<BrandSettingsState> {
  const tenant = await getTenantFromHeaders();
  const staff = await getCurrentStaff();
  if (!tenant || !staff) return { error: "غير مصرح" };
  if (staff.role !== "admin") return { error: "هذا الإجراء متاح للمسؤولين فقط" };

  const academyNameAr = String(formData.get("academyNameAr") || "").trim();
  const academyNameEn = String(formData.get("academyNameEn") || "").trim();
  const contactPhone = String(formData.get("contactPhone") || "").trim();
  const contactEmail = String(formData.get("contactEmail") || "").trim();
  const welcomeMessage = String(formData.get("welcomeMessage") || "").trim();
  const colorPrimary = String(formData.get("colorPrimary") || "");
  const colorSecondary = String(formData.get("colorSecondary") || "");
  const colorAccent = String(formData.get("colorAccent") || "");
  const colorDark = String(formData.get("colorDark") || "");

  if (!academyNameAr || !academyNameEn) return { error: "اسم الأكاديمية مطلوب (عربي وإنجليزي)" };
  for (const c of [colorPrimary, colorSecondary, colorAccent, colorDark]) {
    if (!HEX_COLOR.test(c)) return { error: "لون غير صحيح" };
  }

  const supabase = createAdminClient();

  const update: Record<string, string | null> = {
    academy_name_ar: academyNameAr,
    academy_name_en: academyNameEn,
    contact_phone: contactPhone || null,
    contact_email: contactEmail || null,
    welcome_message: welcomeMessage || null,
    color_primary: colorPrimary,
    color_secondary: colorSecondary,
    color_accent: colorAccent,
    color_dark: colorDark,
  };

  const logo = formData.get("logo");
  if (logo instanceof File && logo.size > 0) {
    const ext = logo.name.split(".").pop()?.toLowerCase();
    const validExt = ext && ["png", "jpg", "jpeg"].includes(ext);
    const validSize = logo.size <= 2 * 1024 * 1024;
    if (!validExt) return { error: "الشعار يجب أن يكون PNG أو JPG" };
    if (!validSize) return { error: "الحجم الأقصى للشعار 2 ميجابايت" };

    const path = `${tenant.id}/logo.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("tenant-logos")
      .upload(path, logo, { contentType: logo.type, upsert: true });
    if (uploadError) return { error: "تعذر رفع الشعار" };

    const { data: publicUrl } = supabase.storage.from("tenant-logos").getPublicUrl(path);
    update.logo_url = `${publicUrl.publicUrl}?v=${Date.now()}`;
  }

  const { error } = await supabase.from("tenants").update(update).eq("id", tenant.id);
  if (error) return { error: "تعذر حفظ التغييرات" };

  revalidatePath("/", "layout");
  return { success: true };
}
