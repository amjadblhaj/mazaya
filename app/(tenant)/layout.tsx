import { redirect } from "next/navigation";
import { getTenantFromHeaders } from "@/lib/tenant/getTenantFromHeaders";
import { buildBrandThemeCSS } from "@/lib/tenant/theme";
import { checkSubscriptionGate } from "@/lib/tenant/subscriptionStatus";
import { getCurrentStaff } from "@/lib/auth/getStaff";
import { createClient } from "@/lib/supabase/server";
import { TenantProvider } from "@/context/TenantContext";
import { TenantShell } from "@/components/layout/TenantShell";

export default async function TenantLayout({ children }: { children: React.ReactNode }) {
  const tenant = await getTenantFromHeaders();
  if (!tenant) redirect("/not-found");

  const staff = await getCurrentStaff();
  if (!staff || staff.tenant_id !== tenant.id || !staff.active) {
    redirect("/login");
  }

  const gate = checkSubscriptionGate(tenant);
  if (gate.action === "redirect") {
    redirect(gate.to);
  }

  const supabase = await createClient();
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("tenant_id", tenant.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <TenantProvider tenant={tenant}>
      <style dangerouslySetInnerHTML={{ __html: buildBrandThemeCSS(tenant) }} />
      <TenantShell notifications={notifications ?? []}>{children}</TenantShell>
    </TenantProvider>
  );
}
