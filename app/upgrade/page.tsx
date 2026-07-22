import { redirect } from "next/navigation";
import { getTenantFromHeaders } from "@/lib/tenant/getTenantFromHeaders";
import { buildBrandThemeCSS } from "@/lib/tenant/theme";

const PLANS = [
  { name: "أساسي", price: 300, branches: "5 فروع", students: "500 طالب" },
  { name: "متوسط", price: 500, branches: "10 فروع", students: "1500 طالب", featured: true },
  { name: "متقدم", price: 800, branches: "فروع غير محدودة", students: "طلاب غير محدودين" },
];

export default async function UpgradePage() {
  const tenant = await getTenantFromHeaders();
  if (!tenant) redirect("/");

  return (
    <div className="min-h-screen p-8" style={{ background: "var(--brand-surface)" }}>
      <style dangerouslySetInnerHTML={{ __html: buildBrandThemeCSS(tenant) }} />
      <h1 className="mb-8 text-center text-2xl font-bold" style={{ color: "var(--brand-primary)" }}>
        خطط الاشتراك
      </h1>
      <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className="rounded-xl border p-6 text-center"
            style={{
              borderColor: plan.featured ? "var(--brand-accent)" : undefined,
              borderWidth: plan.featured ? 2 : 1,
            }}
          >
            <h2 className="text-lg font-bold" style={{ color: "var(--brand-primary)" }}>
              {plan.name}
            </h2>
            <p className="mt-2 text-2xl font-black" style={{ color: "var(--brand-accent)" }}>
              {plan.price} د.ل<span className="text-sm font-normal">/سنة</span>
            </p>
            <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
              <li>✓ {plan.branches}</li>
              <li>✓ {plan.students}</li>
              <li>✓ هوية بصرية خاصة</li>
              <li>✓ لوغو خاص</li>
            </ul>
          </div>
        ))}
      </div>
      <p className="mx-auto mt-8 max-w-md text-center text-sm text-muted-foreground">
        فرع إضافي: 50 د.ل لكل فرع (يُضاف لأي خطة).
        <br />
        للتفعيل: تحويل بنكي أو واتساب — أرسل إيصال الدفع مع اسم الأكاديمية. التفعيل خلال 24 ساعة.
      </p>
    </div>
  );
}
