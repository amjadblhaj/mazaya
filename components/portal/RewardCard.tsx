"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { redeemRewardAction } from "@/app/portal/actions";
import type { Reward } from "@/types";

export function RewardCard({ reward, studentPoints }: { reward: Reward; studentPoints: number }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [redeemed, setRedeemed] = useState(false);
  const canAfford = studentPoints >= reward.points_required;

  function handleRedeem() {
    setError(null);
    startTransition(async () => {
      const res = await redeemRewardAction(reward.id);
      if (res.error) setError(res.error);
      else setRedeemed(true);
    });
  }

  return (
    <div
      className="flex flex-col gap-3 rounded-xl p-4"
      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold" style={{ color: "var(--brand-secondary)" }}>
            {reward.name_ar}
          </h3>
          {reward.description && (
            <p className="text-xs" style={{ color: "var(--brand-secondary)", opacity: 0.6 }}>
              {reward.description}
            </p>
          )}
        </div>
        <span className="whitespace-nowrap text-sm font-bold" style={{ color: "var(--brand-accent)" }}>
          {reward.points_required} نقطة
        </span>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
      {redeemed ? (
        <p className="text-xs font-medium" style={{ color: "var(--brand-accent)" }}>
          تم إرسال طلب الاستبدال ✓
        </p>
      ) : (
        <Button
          type="button"
          disabled={!canAfford || isPending || redeemed}
          onClick={handleRedeem}
          size="sm"
          style={canAfford ? { background: "var(--brand-accent)" } : undefined}
        >
          {isPending ? "جارٍ الاستبدال..." : canAfford ? "استبدال" : "نقاط غير كافية"}
        </Button>
      )}
    </div>
  );
}
