import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getTenantFromHeaders } from "@/lib/tenant/getTenantFromHeaders";
import { buildBrandThemeCSS } from "@/lib/tenant/theme";
import { checkSubscriptionGate } from "@/lib/tenant/subscriptionStatus";
import { getStudentSession } from "@/lib/auth/studentSession";
import { TenantProvider } from "@/context/TenantContext";
import { TenantLogo } from "@/components/layout/TenantLogo";
import { studentLogoutAction } from "@/app/portal/actions";

// F6: the student portal must show zero Mazaya branding — the root layout's
// default <title>مزايا | Mazaya</title> would otherwise leak into the browser
// tab, so this overrides it with the academy's own name.
export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getTenantFromHeaders();
  return { title: tenant ? `${tenant.academy_name_ar} — نظام النقاط` : "نظام النقاط" };
}

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const tenant = await getTenantFromHeaders();
  if (!tenant) redirect("/not-found");

  const session = await getStudentSession();
  if (!session || session.tenantId !== tenant.id) {
    redirect("/login");
  }

  const gate = checkSubscriptionGate(tenant);
  if (gate.action === "redirect") {
    redirect(gate.to);
  }

  return (
    <TenantProvider tenant={tenant}>
      <style dangerouslySetInnerHTML={{ __html: buildBrandThemeCSS(tenant) }} />
      <div className="flex min-h-screen flex-col" style={{ background: "var(--brand-dark)" }}>
        <header className="flex items-center justify-between px-4 py-4">
          <TenantLogo />
          <form action={studentLogoutAction}>
            <button
              type="submit"
              className="text-sm"
              style={{ color: "var(--brand-secondary)", opacity: 0.7 }}
            >
              تسجيل الخروج
            </button>
          </form>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="py-6 text-center text-xs" style={{ color: "var(--brand-secondary)", opacity: 0.4 }}>
          نظام النقاط — {tenant.academy_name_ar}
        </footer>
      </div>
    </TenantProvider>
  );
}
