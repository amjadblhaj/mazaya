import { redirect } from "next/navigation";
import { getCurrentSuperAdmin } from "@/lib/auth/getSuperAdmin";
import { SuperAdminShell } from "@/components/super-admin/SuperAdminShell";

export default async function SuperAdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const superAdmin = await getCurrentSuperAdmin();
  if (!superAdmin) redirect("/super-admin/login");

  return <SuperAdminShell>{children}</SuperAdminShell>;
}
