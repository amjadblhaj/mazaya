import { redirect } from "next/navigation";
import { getTenantFromHeaders } from "@/lib/tenant/getTenantFromHeaders";
import { buildBrandThemeCSS } from "@/lib/tenant/theme";
import { checkSubscriptionGate } from "@/lib/tenant/subscriptionStatus";
import { getCurrentStaff } from "@/lib/auth/getStaff";
import { createClient } from "@/lib/supabase/server";
import { TenantProvider } from "@/context/TenantContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { TrialBanner } from "@/components/subscription/TrialBanner";
import { NotificationBell } from "@/components/layout/NotificationBell";

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
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <div className="flex items-center justify-end border-b bg-background px-4 py-2">
            <NotificationBell notifications={notifications ?? []} />
          </div>
          <TrialBanner />
          <main className="flex-1 bg-brand-surface">{children}</main>
        </div>
      </div>
    </TenantProvider>
  );
}
