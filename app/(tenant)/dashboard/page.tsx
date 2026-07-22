import Link from "next/link";
import { Users, Award, Gift, Building2 } from "lucide-react";
import { getTenantFromHeaders } from "@/lib/tenant/getTenantFromHeaders";
import { createClient } from "@/lib/supabase/server";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default async function DashboardPage() {
  const tenant = (await getTenantFromHeaders())!;
  const supabase = await createClient();

  const [studentsRes, pointsRes, redemptionsRes, branchesRes, activityRes, topStudentsRes] = await Promise.all([
    supabase.from("students").select("id", { count: "exact", head: true }).eq("tenant_id", tenant.id).eq("active", true),
    supabase.from("points_log").select("points").eq("tenant_id", tenant.id).gt("points", 0),
    supabase.from("redemptions").select("id", { count: "exact", head: true }).eq("tenant_id", tenant.id),
    supabase.from("branches").select("id", { count: "exact", head: true }).eq("tenant_id", tenant.id).eq("active", true),
    supabase
      .from("points_log")
      .select("id, points, action, type, created_at, students(full_name)")
      .eq("tenant_id", tenant.id)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("students")
      .select("id, full_name, points")
      .eq("tenant_id", tenant.id)
      .eq("active", true)
      .order("points", { ascending: false })
      .limit(5),
  ]);

  const totalPointsGranted = (pointsRes.data || []).reduce((sum, r) => sum + r.points, 0);
  const activity = activityRes.data || [];
  const topStudents = topStudentsRes.data || [];

  return (
    <div className="flex flex-col gap-6 p-8">
      <h1 className="text-2xl font-bold" style={{ color: "var(--brand-primary)" }}>
        لوحة التحكم
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="إجمالي الطلاب" value={studentsRes.count ?? 0} icon={Users} />
        <MetricCard label="النقاط الممنوحة" value={totalPointsGranted} icon={Award} />
        <MetricCard label="المكافآت المستبدلة" value={redemptionsRes.count ?? 0} icon={Gift} />
        <MetricCard label="الفروع النشطة" value={branchesRes.count ?? 0} icon={Building2} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="font-semibold" style={{ color: "var(--brand-primary)" }}>
            أفضل الطلاب
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {topStudents.length === 0 && <p className="text-sm text-muted-foreground">لا يوجد طلاب بعد</p>}
            {topStudents.map((s) => (
              <Link
                key={s.id}
                href={`/students/${s.id}`}
                className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-muted"
              >
                <span>{s.full_name}</span>
                <span className="font-semibold" style={{ color: "var(--brand-accent)" }}>
                  {s.points} نقطة
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="font-semibold" style={{ color: "var(--brand-primary)" }}>
            آخر النشاطات
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {activity.length === 0 && <p className="text-sm text-muted-foreground">لا يوجد نشاط بعد</p>}
            {activity.map((log) => (
              <div key={log.id} className="flex items-center justify-between text-sm">
                <span className="truncate">
                  {(log.students as unknown as { full_name: string } | null)?.full_name ?? "—"} — {log.action}
                </span>
                <span className={log.points >= 0 ? "text-green-600" : "text-destructive"}>
                  {log.points >= 0 ? "+" : ""}
                  {log.points}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
