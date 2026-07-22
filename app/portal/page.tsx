import { redirect } from "next/navigation";
import { getCurrentStudent } from "@/lib/auth/getStudent";
import { getTenantFromHeaders } from "@/lib/tenant/getTenantFromHeaders";
import { createAdminClient } from "@/lib/supabase/admin";
import { PointsHero } from "@/components/portal/PointsHero";
import { RewardCard } from "@/components/portal/RewardCard";
import { HistoryList } from "@/components/portal/HistoryList";

export default async function PortalPage() {
  const student = await getCurrentStudent();
  const tenant = await getTenantFromHeaders();
  if (!student || !tenant) redirect("/login");

  const supabase = createAdminClient();

  const [{ data: rewards }, { data: history }] = await Promise.all([
    supabase
      .from("rewards")
      .select("*")
      .eq("tenant_id", tenant.id)
      .eq("active", true)
      .order("points_required", { ascending: true }),
    supabase
      .from("points_log")
      .select("*")
      .eq("tenant_id", tenant.id)
      .eq("student_id", student.id)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  const activeRewards = rewards ?? [];
  const nextReward = activeRewards.find((r) => r.points_required > student.points) ?? null;

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-8 px-4 pb-12">
      <PointsHero
        points={student.points}
        nextRewardPoints={nextReward?.points_required ?? null}
        nextRewardName={nextReward?.name_ar ?? null}
      />

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold" style={{ color: "var(--brand-secondary)", opacity: 0.8 }}>
          المكافآت المتاحة
        </h2>
        {activeRewards.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--brand-secondary)", opacity: 0.6 }}>
            لا توجد مكافآت متاحة حالياً
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {activeRewards.map((reward) => (
              <RewardCard key={reward.id} reward={reward} studentPoints={student.points} />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold" style={{ color: "var(--brand-secondary)", opacity: 0.8 }}>
          سجل النقاط
        </h2>
        <HistoryList history={history ?? []} />
      </section>
    </div>
  );
}
