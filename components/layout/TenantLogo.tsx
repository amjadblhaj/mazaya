"use client";

import { useTenant } from "@/context/TenantContext";

export function TenantLogo() {
  const tenant = useTenant();

  if (tenant.logo_url) {
    // eslint-disable-next-line @next/next/no-img-element -- logo_url is a per-tenant
    // Supabase Storage URL, not known at build time; next/image would need every
    // tenant's domain allow-listed in next.config.ts remotePatterns.
    return <img src={tenant.logo_url} alt={tenant.academy_name_ar} className="h-10 w-auto" />;
  }

  return (
    <span className="text-xl font-black" style={{ color: "var(--brand-secondary)" }}>
      {tenant.academy_name_ar}
    </span>
  );
}
