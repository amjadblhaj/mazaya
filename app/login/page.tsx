import { redirect } from "next/navigation";
import { getTenantFromHeaders } from "@/lib/tenant/getTenantFromHeaders";
import { buildBrandThemeCSS } from "@/lib/tenant/theme";
import { LoginCard } from "@/components/auth/LoginCard";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const tenant = await getTenantFromHeaders();
  if (!tenant) redirect("/");

  const { welcome } = await searchParams;

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{ background: "var(--brand-dark)" }}
    >
      <style dangerouslySetInnerHTML={{ __html: buildBrandThemeCSS(tenant) }} />
      <LoginCard tenant={tenant} showWelcome={welcome === "1"} />
    </div>
  );
}
