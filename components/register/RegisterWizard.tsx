"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/branding/ColorPicker";
import { LogoUpload } from "@/components/branding/LogoUpload";
import { BrandPreview } from "@/components/branding/BrandPreview";
import { checkSubdomainAvailable, registerTenant } from "@/app/register/actions";

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

const schema = z
  .object({
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
    confirmPassword: z.string(),
    colorPrimary: z.string().regex(HEX_COLOR, "لون غير صحيح"),
    colorSecondary: z.string().regex(HEX_COLOR, "لون غير صحيح"),
    colorAccent: z.string().regex(HEX_COLOR, "لون غير صحيح"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

const STEP_FIELDS: Record<number, (keyof FormValues)[]> = {
  1: ["academyNameAr", "academyNameEn", "subdomain", "ownerName", "ownerEmail", "ownerPhone", "password", "confirmPassword"],
  2: ["colorPrimary", "colorSecondary", "colorAccent"],
};

export function RegisterWizard() {
  const [step, setStep] = useState(1);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [subdomainStatus, setSubdomainStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    watch,
    trigger,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      colorPrimary: "#170C79",
      colorSecondary: "#EFE3CA",
      colorAccent: "#56B6C6",
    },
  });

  const subdomain = watch("subdomain");
  const academyNameAr = watch("academyNameAr");
  const colorPrimary = watch("colorPrimary");
  const colorSecondary = watch("colorSecondary");
  const colorAccent = watch("colorAccent");

  useEffect(() => {
    if (!subdomain || !/^[a-z0-9-]{3,30}$/.test(subdomain)) {
      setSubdomainStatus("idle");
      return;
    }
    setSubdomainStatus("checking");
    const timeout = setTimeout(async () => {
      const available = await checkSubdomainAvailable(subdomain);
      setSubdomainStatus(available ? "available" : "taken");
    }, 500);
    return () => clearTimeout(timeout);
  }, [subdomain]);

  async function goNext() {
    const fields = STEP_FIELDS[step];
    const valid = fields ? await trigger(fields) : true;
    if (!valid) return;
    if (step === 1 && subdomainStatus !== "available") return;
    setStep((s) => s + 1);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);

    const values = getValues();
    const formData = new FormData();
    formData.set("academyNameAr", values.academyNameAr);
    formData.set("academyNameEn", values.academyNameEn);
    formData.set("subdomain", values.subdomain);
    formData.set("ownerName", values.ownerName);
    formData.set("ownerEmail", values.ownerEmail);
    formData.set("ownerPhone", values.ownerPhone);
    formData.set("password", values.password);
    formData.set("colorPrimary", values.colorPrimary);
    formData.set("colorSecondary", values.colorSecondary);
    formData.set("colorAccent", values.colorAccent);
    if (logoFile) formData.set("logo", logoFile);

    const result = await registerTenant(formData);

    if (!result.success) {
      setSubmitError(result.error || "حدث خطأ، حاول مرة أخرى");
      setSubmitting(false);
      return;
    }

    window.location.href = result.redirectUrl!;
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 p-6">
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <span className={step === 1 ? "font-bold text-foreground" : ""}>1. بيانات الأكاديمية</span>
        <span>—</span>
        <span className={step === 2 ? "font-bold text-foreground" : ""}>2. الهوية البصرية</span>
        <span>—</span>
        <span className={step === 3 ? "font-bold text-foreground" : ""}>3. التأكيد</span>
      </div>

      {step === 1 && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="academyNameAr">اسم الأكاديمية (عربي)</Label>
            <Input id="academyNameAr" {...register("academyNameAr")} />
            {errors.academyNameAr && <p className="text-sm text-destructive">{errors.academyNameAr.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="academyNameEn">Academy Name (English)</Label>
            <Input id="academyNameEn" {...register("academyNameEn")} />
            {errors.academyNameEn && <p className="text-sm text-destructive">{errors.academyNameEn.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="subdomain">الرابط الفرعي</Label>
            <div className="flex items-center gap-2">
              <Input id="subdomain" dir="ltr" {...register("subdomain")} placeholder="tamam" />
              <span className="text-sm text-muted-foreground">.mazaya.app</span>
            </div>
            {errors.subdomain && <p className="text-sm text-destructive">{errors.subdomain.message}</p>}
            {!errors.subdomain && subdomainStatus === "checking" && (
              <p className="text-sm text-muted-foreground">جارٍ التحقق...</p>
            )}
            {!errors.subdomain && subdomainStatus === "available" && (
              <p className="text-sm text-green-600">متاح ✓</p>
            )}
            {!errors.subdomain && subdomainStatus === "taken" && (
              <p className="text-sm text-destructive">هذا الرابط غير متاح</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="ownerName">اسم المالك</Label>
            <Input id="ownerName" {...register("ownerName")} />
            {errors.ownerName && <p className="text-sm text-destructive">{errors.ownerName.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="ownerEmail">البريد الإلكتروني</Label>
            <Input id="ownerEmail" type="email" {...register("ownerEmail")} />
            {errors.ownerEmail && <p className="text-sm text-destructive">{errors.ownerEmail.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="ownerPhone">رقم الهاتف</Label>
            <Input id="ownerPhone" type="tel" {...register("ownerPhone")} />
            {errors.ownerPhone && <p className="text-sm text-destructive">{errors.ownerPhone.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">كلمة المرور</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
            <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
            {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
          </div>
          <Button type="button" onClick={goNext}>
            التالي
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-4">
          <LogoUpload
            onChange={(file) => {
              setLogoFile(file);
              setLogoPreview(file ? URL.createObjectURL(file) : null);
            }}
          />
          <ColorPicker
            label="اللون الأساسي"
            value={colorPrimary}
            onChange={(hex) => setValue("colorPrimary", hex, { shouldValidate: true })}
          />
          <ColorPicker
            label="اللون الثانوي"
            value={colorSecondary}
            onChange={(hex) => setValue("colorSecondary", hex, { shouldValidate: true })}
          />
          <ColorPicker
            label="لون التمييز"
            value={colorAccent}
            onChange={(hex) => setValue("colorAccent", hex, { shouldValidate: true })}
          />
          <BrandPreview
            academyName={academyNameAr}
            primary={colorPrimary}
            secondary={colorSecondary}
            accent={colorAccent}
            logoPreview={logoPreview}
          />
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => setStep(1)}>
              السابق
            </Button>
            <Button type="button" onClick={goNext} className="flex-1">
              التالي
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border p-4 text-sm">
            <p>
              <strong>الأكاديمية:</strong> {getValues("academyNameAr")}
            </p>
            <p>
              <strong>الرابط:</strong> {getValues("subdomain")}.mazaya.app
            </p>
            <p>
              <strong>المالك:</strong> {getValues("ownerName")} — {getValues("ownerEmail")}
            </p>
            <p className="mt-2 text-muted-foreground">فترة تجريبية مجانية: 14 يوماً</p>
          </div>
          <BrandPreview
            academyName={academyNameAr}
            primary={colorPrimary}
            secondary={colorSecondary}
            accent={colorAccent}
            logoPreview={logoPreview}
          />
          {submitError && <p className="text-sm text-destructive">{submitError}</p>}
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => setStep(2)} disabled={submitting}>
              السابق
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={submitting} className="flex-1">
              {submitting ? "جارٍ الإنشاء..." : "إنشاء الحساب"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
