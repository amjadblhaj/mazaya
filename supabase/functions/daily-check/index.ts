// F10 — runs once a day (scheduled via pg_cron, see supabase/sql/003_daily_check_cron.sql).
// Auto-expires overdue trials/subscriptions and queues expiry-warning notifications.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const DAY_MS = 86_400_000;

Deno.serve(async () => {
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const now = new Date();
  const nowIso = now.toISOString();

  const { data: expiredTrials } = await supabase
    .from("tenants")
    .update({ status: "expired" })
    .eq("status", "trial")
    .lt("trial_ends_at", nowIso)
    .select("id");

  const { data: expiredSubs } = await supabase
    .from("tenants")
    .update({ status: "expired" })
    .eq("status", "active")
    .not("subscription_ends_at", "is", null)
    .lt("subscription_ends_at", nowIso)
    .select("id");

  const in7Days = new Date(now.getTime() + 7 * DAY_MS).toISOString();
  const { data: expiringTrials } = await supabase
    .from("tenants")
    .select("id, trial_ends_at")
    .eq("status", "trial")
    .gte("trial_ends_at", nowIso)
    .lt("trial_ends_at", in7Days);

  for (const t of expiringTrials ?? []) {
    await notifyOnce(
      supabase,
      t.id,
      "trial_expiring",
      "تجربتك المجانية على وشك الانتهاء",
      `تجربتك تنتهي في ${formatDate(t.trial_ends_at)}`
    );
  }

  const in14Days = new Date(now.getTime() + 14 * DAY_MS).toISOString();
  const { data: expiringSubs } = await supabase
    .from("tenants")
    .select("id, subscription_ends_at")
    .eq("status", "active")
    .not("subscription_ends_at", "is", null)
    .gte("subscription_ends_at", nowIso)
    .lt("subscription_ends_at", in14Days);

  for (const t of expiringSubs ?? []) {
    await notifyOnce(
      supabase,
      t.id,
      "subscription_expiring",
      "اشتراكك على وشك الانتهاء",
      `اشتراكك ينتهي في ${formatDate(t.subscription_ends_at)}`
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      expiredTrials: expiredTrials?.length ?? 0,
      expiredSubscriptions: expiredSubs?.length ?? 0,
      trialWarningsChecked: expiringTrials?.length ?? 0,
      subscriptionWarningsChecked: expiringSubs?.length ?? 0,
    }),
    { headers: { "Content-Type": "application/json" } }
  );
});

// The spec's own pseudocode inserts a notification every run for every tenant
// in the warning window — since this runs daily, that's a new "expiring soon"
// notification every single day for the whole 7/14-day window. Skipping if
// one was already created today avoids that spam while keeping the same
// warning-window logic.
async function notifyOnce(
  supabase: ReturnType<typeof createClient>,
  tenantId: string,
  type: string,
  title: string,
  message: string
) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data: existing } = await supabase
    .from("notifications")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("type", type)
    .gte("created_at", todayStart.toISOString())
    .maybeSingle();

  if (existing) return;

  await supabase.from("notifications").insert({ tenant_id: tenantId, type, title, message });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ar-LY");
}
