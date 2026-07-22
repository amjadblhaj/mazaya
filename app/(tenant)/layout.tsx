import { redirect } from "next/navigation";
import { getTenantFromHeaders } from "@/lib/tenant/getTenantFromHeaders";
import { buildBrandThemeCSS } from "@/lib/tenant/theme";
import { TenantProvider } from "@/context/TenantContext";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function TenantLayout({ children }: { children: React.ReactNode }) {
  const tenant = await getTenantFromHeaders();
  if (!tenant) redirect("/not-found");

  return (
    <TenantProvider tenant={tenant}>
      <style dangerouslySetInnerHTML={{ __html: buildBrandThemeCSS(tenant) }} />
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 bg-brand-surface">{children}</main>
      </div>
    </TenantProvider>
  );
}
