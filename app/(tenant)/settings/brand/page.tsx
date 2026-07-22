import { redirect } from "next/navigation";
import { getTenantFromHeaders } from "@/lib/tenant/getTenantFromHeaders";
import { getCurrentStaff } from "@/lib/auth/getStaff";
import { createAdminClient } from "@/lib/supabase/admin";
import { BrandSettingsForm } from "@/components/branding/BrandSettingsForm";

export default async function BrandSettingsPage() {
  const tenant = (await getTenantFromHeaders())!;
  const staff = (await getCurrentStaff())!;
  if (staff.role !== "admin") redirect("/dashboard");

  // tenants has no client-facing RLS policy (branding lookups are pre-auth
  // and go through the service-role client) — the session-scoped client
  // would silently get nothing back here, so this needs the admin client.
  const supabase = createAdminClient();
  const { data: fullTenant } = await supabase.from("tenants").select("*").eq("id", tenant.id).single();

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 text-2xl font-bold" style={{ color: "var(--brand-primary)" }}>
        هوية الأكاديمية
      </h1>
      <BrandSettingsForm tenant={fullTenant!} />
    </div>
  );
}
