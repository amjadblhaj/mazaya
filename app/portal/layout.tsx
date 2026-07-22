import { redirect } from "next/navigation";
import { getTenantFromHeaders } from "@/lib/tenant/getTenantFromHeaders";
import { buildBrandThemeCSS } from "@/lib/tenant/theme";
import { checkSubscriptionGate } from "@/lib/tenant/subscriptionStatus";
import { getStudentSession } from "@/lib/auth/studentSession";
import { TenantProvider } from "@/context/TenantContext";

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
      <div className="min-h-screen" style={{ background: "var(--brand-dark)" }}>
        {children}
      </div>
    </TenantProvider>
  );
}
