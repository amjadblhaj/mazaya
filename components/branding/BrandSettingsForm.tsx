"use client";

import { useActionState, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/branding/ColorPicker";
import { LogoUpload } from "@/components/branding/LogoUpload";
import { BrandPreview } from "@/components/branding/BrandPreview";
import { updateBrandingAction, type BrandSettingsState } from "@/app/(tenant)/settings/brand/actions";
import type { Tenant } from "@/types";

const initialState: BrandSettingsState = {};

export function BrandSettingsForm({ tenant }: { tenant: Tenant }) {
  const [state, formAction, pending] = useActionState(updateBrandingAction, initialState);
  const [academyNameAr, setAcademyNameAr] = useState(tenant.academy_name_ar);
  const [colorPrimary, setColorPrimary] = useState(tenant.color_primary);
  const [colorSecondary, setColorSecondary] = useState(tenant.color_secondary);
  const [colorAccent, setColorAccent] = useState(tenant.color_accent);
  const [colorDark, setColorDark] = useState(tenant.color_dark);
  const [logoPreview, setLogoPreview] = useState<string | null>(tenant.logo_url);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="academyNameAr">اسم الأكاديمية (عربي)</Label>
          <Input
            id="academyNameAr"
            name="academyNameAr"
            value={academyNameAr}
            onChange={(e) => setAcademyNameAr(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="academyNameEn">Academy Name (English)</Label>
          <Input id="academyNameEn" name="academyNameEn" defaultValue={tenant.academy_name_en} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="contactPhone">هاتف التواصل</Label>
          <Input id="contactPhone" name="contactPhone" dir="ltr" defaultValue={tenant.contact_phone ?? ""} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="contactEmail">بريد التواصل</Label>
          <Input id="contactEmail" name="contactEmail" type="email" defaultValue={tenant.contact_email ?? ""} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="welcomeMessage">رسالة الترحيب</Label>
        <Textarea id="welcomeMessage" name="welcomeMessage" defaultValue={tenant.welcome_message} />
      </div>

      <LogoUpload
        name="logo"
        initialPreviewUrl={tenant.logo_url}
        onChange={(file) => setLogoPreview(file ? URL.createObjectURL(file) : tenant.logo_url)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <input type="hidden" name="colorPrimary" value={colorPrimary} />
        <input type="hidden" name="colorSecondary" value={colorSecondary} />
        <input type="hidden" name="colorAccent" value={colorAccent} />
        <input type="hidden" name="colorDark" value={colorDark} />
        <ColorPicker label="اللون الأساسي" value={colorPrimary} onChange={setColorPrimary} />
        <ColorPicker label="اللون الثانوي" value={colorSecondary} onChange={setColorSecondary} />
        <ColorPicker label="لون التمييز" value={colorAccent} onChange={setColorAccent} />
        <ColorPicker label="اللون الداكن" value={colorDark} onChange={setColorDark} />
      </div>

      <BrandPreview
        academyName={academyNameAr}
        primary={colorPrimary}
        secondary={colorSecondary}
        accent={colorAccent}
        logoPreview={logoPreview}
      />

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.success && <p className="text-sm text-green-600">تم حفظ التغييرات</p>}

      <Button type="submit" disabled={pending} style={{ background: "var(--brand-accent)" }}>
        {pending ? "جارٍ الحفظ..." : "حفظ التغييرات"}
      </Button>
    </form>
  );
}
