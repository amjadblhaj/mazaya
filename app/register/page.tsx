import { RegisterWizard } from "@/components/register/RegisterWizard";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-brand-surface py-8">
      <h1 className="text-center text-2xl font-bold" style={{ color: "var(--brand-primary)" }}>
        إنشاء حساب مزايا
      </h1>
      <RegisterWizard />
    </div>
  );
}
