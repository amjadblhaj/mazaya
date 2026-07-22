"use client";

import { useTenant } from "@/context/TenantContext";
import Link from "next/link";

export function TrialBanner() {
  const tenant = useTenant();
  const now = Date.now();

  if (tenant.status === "trial") {
    const daysLeft = Math.ceil((new Date(tenant.trial_ends_at).getTime() - now) / 86_400_000);
    const urgent = daysLeft <= 7;
    return (
      <div
        className="px-4 py-2 text-sm"
        style={{
          background: urgent ? "#FEF3C7" : "var(--brand-surface)",
          color: urgent ? "#92400E" : "var(--brand-primary)",
        }}
      >
        باقي {daysLeft} {daysLeft === 1 ? "يوم" : "أيام"} على انتهاء الفترة التجريبية.{" "}
        <Link href="/upgrade" className="font-semibold underline">
          ترقية الآن
        </Link>
      </div>
    );
  }

  if (tenant.status === "active" && tenant.subscription_ends_at) {
    const daysLeft = Math.ceil((new Date(tenant.subscription_ends_at).getTime() - now) / 86_400_000);
    if (daysLeft <= 14) {
      return (
        <div className="px-4 py-2 text-sm" style={{ background: "#FEF3C7", color: "#92400E" }}>
          باقي {daysLeft} {daysLeft === 1 ? "يوم" : "أيام"} على انتهاء الاشتراك.{" "}
          <Link href="/upgrade" className="font-semibold underline">
            تجديد الاشتراك
          </Link>
        </div>
      );
    }
  }

  return null;
}
