import Link from "next/link";
import { Palette, Award, Building2, Upload, Smartphone, BarChart3, Check } from "lucide-react";
import { PLANS, ADDON_BRANCH_PRICE } from "@/lib/pricing";

const FEATURES = [
  { icon: Palette, title: "هوية بصرية خاصة", desc: "شعارك وألوانك على منصة كاملة تحمل اسم أكاديميتك — طلابك لا يرون مزايا إطلاقاً." },
  { icon: Award, title: "نظام نقاط ومكافآت", desc: "امنح النقاط يدوياً أو عبر استيراد Excel، ودع طلابك يستبدلونها بمكافآت حقيقية." },
  { icon: Building2, title: "دعم الفروع المتعددة", desc: "أدر فروعك كلها من لوحة تحكم واحدة، مع صلاحيات منفصلة لكل موظف." },
  { icon: Upload, title: "استيراد Excel", desc: "امنح النقاط لمئات الطلاب دفعة واحدة من ملف Excel واحد." },
  { icon: Smartphone, title: "بوابة طلاب متجاوبة", desc: "يتابع طلابك رصيدهم ويستبدلون مكافآتهم من أي جهاز." },
  { icon: BarChart3, title: "لوحة تحكم شاملة", desc: "إحصاءات فورية عن الطلاب والنقاط والمكافآت والنشاط." },
] as const;

export default function LandingPage() {
  const domain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "mazaya.app";

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "var(--brand-surface)" }}>
      {/* Header */}
      <header className="border-b bg-white/70 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-xl font-black" style={{ color: "var(--brand-primary)" }}>
            مزايا
          </span>
          <nav className="hidden items-center gap-6 text-sm font-medium sm:flex">
            <a href="#features" className="text-muted-foreground hover:text-foreground">
              المميزات
            </a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground">
              الأسعار
            </a>
          </nav>
          <Link
            href="/register"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
            style={{ background: "var(--brand-accent)" }}
          >
            تسجيل أكاديمية جديدة
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-20 text-center" style={{ background: "var(--brand-dark)" }}>
        <span
          className="mb-4 inline-block rounded-full px-4 py-1 text-xs font-semibold"
          style={{ background: "rgba(255,255,255,0.1)", color: "var(--brand-secondary)" }}
        >
          منصة الولاء الذكي
        </span>
        <h1
          className="mx-auto max-w-3xl text-3xl font-black leading-tight sm:text-5xl"
          style={{ color: "var(--brand-secondary)" }}
        >
          حوّل نظام النقاط في أكاديميتك إلى منصة احترافية بهويتك الخاصة
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base" style={{ color: "var(--brand-secondary)", opacity: 0.8 }}>
          مزايا منصة SaaS بيضاء العلامة لإدارة نقاط وولاء الطلاب — شعارك، ألوانك، ورابطك الخاص، بدون أي أثر لعلامتنا أمام طلابك.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/register"
            className="rounded-lg px-6 py-3 text-sm font-bold"
            style={{ background: "var(--brand-accent)", color: "var(--brand-primary)" }}
          >
            ابدأ تجربتك المجانية
          </Link>
          <a
            href="#pricing"
            className="rounded-lg border px-6 py-3 text-sm font-bold"
            style={{ borderColor: "rgba(255,255,255,0.3)", color: "var(--brand-secondary)" }}
          >
            عرض الأسعار
          </a>
        </div>
        <p className="mt-4 text-xs" style={{ color: "var(--brand-secondary)", opacity: 0.5 }}>
          14 يوماً تجربة مجانية — بدون بطاقة ائتمان
        </p>
      </section>

      {/* White label callout */}
      <section className="px-6 py-10 text-center">
        <p className="text-sm text-muted-foreground">
          لكل أكاديمية رابطها الخاص، مثال:{" "}
          <span className="font-mono font-semibold" dir="ltr" style={{ color: "var(--brand-primary)" }}>
            academyname.{domain}
          </span>
        </p>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-16">
        <h2 className="mb-12 text-center text-2xl font-bold" style={{ color: "var(--brand-primary)" }}>
          كل ما تحتاجه لإدارة الولاء والنقاط
        </h2>
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border bg-white p-6">
              <div
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ background: "var(--brand-surface)" }}
              >
                <Icon className="size-5" style={{ color: "var(--brand-accent)" }} />
              </div>
              <h3 className="mb-1 font-semibold" style={{ color: "var(--brand-primary)" }}>
                {title}
              </h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-16" style={{ background: "var(--brand-surface)" }}>
        <h2 className="mb-2 text-center text-2xl font-bold" style={{ color: "var(--brand-primary)" }}>
          خطط تناسب كل أكاديمية
        </h2>
        <p className="mb-12 text-center text-sm text-muted-foreground">اشتراك سنوي — تفعيل يدوي خلال 24 ساعة من الدفع</p>
        <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className="rounded-xl border bg-white p-6 text-center"
              style={{
                borderColor: plan.featured ? "var(--brand-accent)" : undefined,
                borderWidth: plan.featured ? 2 : 1,
              }}
            >
              {plan.featured && (
                <span
                  className="mb-2 inline-block rounded-full px-3 py-0.5 text-xs font-semibold"
                  style={{ background: "var(--brand-accent)", color: "var(--brand-primary)" }}
                >
                  الأكثر طلباً
                </span>
              )}
              <h3 className="text-lg font-bold" style={{ color: "var(--brand-primary)" }}>
                {plan.name}
              </h3>
              <p className="mt-2 text-2xl font-black" style={{ color: "var(--brand-accent)" }}>
                {plan.price} د.ل<span className="text-sm font-normal text-muted-foreground">/سنة</span>
              </p>
              <ul className="mt-4 space-y-1.5 text-right text-sm text-muted-foreground">
                {[plan.branches, plan.students, "هوية بصرية خاصة", "لوغو خاص"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="size-4 shrink-0" style={{ color: "var(--brand-accent)" }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-8 max-w-md text-center text-sm text-muted-foreground">
          فرع إضافي: {ADDON_BRANCH_PRICE} د.ل لكل فرع (يُضاف لأي خطة)
        </p>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-16 text-center" style={{ background: "var(--brand-primary)" }}>
        <h2 className="text-2xl font-bold" style={{ color: "var(--brand-secondary)" }}>
          جاهز لتبدأ؟
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: "var(--brand-secondary)", opacity: 0.8 }}>
          سجّل أكاديميتك الآن واحصل على 14 يوماً تجربة مجانية
        </p>
        <Link
          href="/register"
          className="mt-6 inline-block rounded-lg px-6 py-3 text-sm font-bold"
          style={{ background: "var(--brand-accent)", color: "var(--brand-primary)" }}
        >
          تسجيل أكاديمية جديدة
        </Link>
      </section>

      {/* Footer */}
      <footer className="mt-auto px-6 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} مزايا — منصة الولاء الذكي
      </footer>
    </div>
  );
}
