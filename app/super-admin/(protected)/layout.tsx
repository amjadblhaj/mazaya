import { redirect } from "next/navigation";
import { getCurrentSuperAdmin } from "@/lib/auth/getSuperAdmin";
import { SuperAdminSidebar } from "@/components/super-admin/SuperAdminSidebar";

export default async function SuperAdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const superAdmin = await getCurrentSuperAdmin();
  if (!superAdmin) redirect("/super-admin/login");

  return (
    <div className="flex min-h-screen">
      <SuperAdminSidebar />
      <main className="flex-1 bg-brand-surface">{children}</main>
    </div>
  );
}
