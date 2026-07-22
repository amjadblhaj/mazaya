import { redirect } from "next/navigation";
import Link from "next/link";
import { getTenantFromHeaders } from "@/lib/tenant/getTenantFromHeaders";
import { buildBrandThemeCSS } from "@/lib/tenant/theme";

export default async function SubscriptionExpiredPage() {
  const tenant = await getTenantFromHeaders();
  if (!tenant) redirect("/");

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center"
      style={{ background: "var(--brand-dark)" }}
    >
      <style dangerouslySetInnerHTML={{ __html: buildBrandThemeCSS(tenant) }} />
      <h1 className="text-2xl font-bold" style={{ color: "var(--brand-secondary)" }}>
        انتهى الاشتراك
      </h1>
      <p className="max-w-sm text-sm" style={{ color: "var(--brand-secondary)", opacity: 0.8 }}>
        انتهى اشتراك {tenant.academy_name_ar}. بياناتك محفوظة — جدد الاشتراك لاستعادة الوصول.
      </p>
      <Link
        href="/upgrade"
        className="rounded-lg px-6 py-2 font-semibold"
        style={{ background: "var(--brand-accent)", color: "var(--brand-primary)" }}
      >
        تجديد الاشتراك
      </Link>
    </div>
  );
}
