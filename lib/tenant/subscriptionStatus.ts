import type { TenantBranding } from "@/types";

export type SubscriptionGateResult =
  | { action: "allow" }
  | { action: "redirect"; to: "/trial-expired" | "/subscription-expired" };

/**
 * F3 subscription guard. Pure function so it's cheap to unit test — the
 * actual DB status flip on expiry (spec's "auto-set status='expired'") is
 * left to the scheduled daily-check job (Day 7), not done here: a read-path
 * layout guard shouldn't have a side-effecting DB write on every request.
 */
export function checkSubscriptionGate(tenant: TenantBranding): SubscriptionGateResult {
  const now = Date.now();

  if (tenant.status === "suspended" || tenant.status === "expired") {
    return { action: "redirect", to: "/subscription-expired" };
  }

  if (tenant.status === "trial") {
    if (new Date(tenant.trial_ends_at).getTime() < now) {
      return { action: "redirect", to: "/trial-expired" };
    }
    return { action: "allow" };
  }

  if (tenant.status === "active") {
    if (tenant.subscription_ends_at && new Date(tenant.subscription_ends_at).getTime() < now) {
      return { action: "redirect", to: "/subscription-expired" };
    }
    return { action: "allow" };
  }

  return { action: "allow" };
}
