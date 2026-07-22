import { getTenantFromHeaders } from "@/lib/tenant/getTenantFromHeaders";
import { getCurrentStaff } from "@/lib/auth/getStaff";
import { createClient } from "@/lib/supabase/server";
import { RewardsList } from "@/components/rewards/RewardsList";

export default async function RewardsPage() {
  const tenant = (await getTenantFromHeaders())!;
  const staff = (await getCurrentStaff())!;
  const supabase = await createClient();

  const { data: rewards } = await supabase
    .from("rewards")
    .select("*")
    .eq("tenant_id", tenant.id)
    .order("points_required", { ascending: true });

  return (
    <div className="flex flex-col gap-6 p-8">
      <h1 className="text-2xl font-bold" style={{ color: "var(--brand-primary)" }}>
        المكافآت
      </h1>
      <RewardsList rewards={rewards ?? []} isAdmin={staff.role === "admin"} />
    </div>
  );
}
