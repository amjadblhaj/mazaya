import { Building2, CreditCard, Clock, AlertCircle, Wallet, CalendarClock } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { MetricCard } from "@/components/dashboard/MetricCard";

export default async function SuperAdminDashboardPage() {
  const supabase = createAdminClient();

  const now = new Date();
  const in3Days = new Date(now.getTime() + 3 * 86_400_000).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

  const [
    totalTenantsRes,
    activeSubsRes,
    trialRes,
    trialExpiringSoonRes,
    pendingSubsRes,
    pendingAddonsRes,
    monthlyRevenueRes,
    expiringTrialsRes,
    expiringSubsRes,
  ] = await Promise.all([
    supabase.from("tenants").select("id", { count: "exact", head: true }),
    supabase.from("tenants").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("tenants").select("id", { count: "exact", head: true }).eq("status", "trial"),
    supabase
      .from("tenants")
      .select("id", { count: "exact", head: true })
      .eq("status", "trial")
      .lt("trial_ends_at", in3Days),
    supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("branch_addons").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase
      .from("subscriptions")
      .select("amount")
      .eq("status", "active")
      .gte("activated_at", monthStart)
      .lt("activated_at", monthEnd),
    supabase
      .from("tenants")
      .select("id", { count: "exact", head: true })
      .eq("status", "trial")
      .gte("trial_ends_at", monthStart)
      .lt("trial_ends_at", monthEnd),
    supabase
      .from("tenants")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .gte("subscription_ends_at", monthStart)
      .lt("subscription_ends_at", monthEnd),
  ]);

  const monthlyRevenue = (monthlyRevenueRes.data ?? []).reduce((sum, r) => sum + Number(r.amount), 0);
  const expiringThisMonth = (expiringTrialsRes.count ?? 0) + (expiringSubsRes.count ?? 0);
  const pendingPayments = (pendingSubsRes.count ?? 0) + (pendingAddonsRes.count ?? 0);

  return (
    <div className="flex flex-col gap-6 p-8">
      <h1 className="text-2xl font-bold" style={{ color: "var(--brand-primary)" }}>
        لوحة تحكم مزايا
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="إجمالي الأكاديميات" value={totalTenantsRes.count ?? 0} icon={Building2} />
        <MetricCard label="اشتراكات نشطة" value={activeSubsRes.count ?? 0} icon={CreditCard} />
        <MetricCard label="حسابات تجريبية" value={trialRes.count ?? 0} icon={Clock} />
        <MetricCard label="مدفوعات بانتظار المراجعة" value={pendingPayments} icon={AlertCircle} />
        <MetricCard label="إيرادات الشهر (د.ل)" value={monthlyRevenue} icon={Wallet} />
        <MetricCard label="تنتهي هذا الشهر" value={expiringThisMonth} icon={CalendarClock} />
      </div>

      {(trialExpiringSoonRes.count ?? 0) > 0 && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {trialExpiringSoonRes.count} حساب تجريبي ينتهي خلال 3 أيام أو أقل —{" "}
          <a href="/super-admin/tenants?status=trial" className="font-semibold underline">
            عرض الأكاديميات
          </a>
        </div>
      )}
    </div>
  );
}
