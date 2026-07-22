"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RewardModal } from "./RewardModal";
import { toggleRewardActiveAction } from "@/app/(tenant)/rewards/actions";
import type { Reward } from "@/types";

export function RewardsList({ rewards, isAdmin }: { rewards: Reward[]; isAdmin: boolean }) {
  return (
    <div className="flex flex-col gap-4">
      {isAdmin && (
        <div>
          <RewardModal trigger={<Button style={{ background: "var(--brand-accent)" }}>+ إضافة مكافأة</Button>} />
        </div>
      )}

      {rewards.length === 0 && <p className="text-sm text-muted-foreground">لا توجد مكافآت بعد</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rewards.map((reward) => (
          <RewardCard key={reward.id} reward={reward} isAdmin={isAdmin} />
        ))}
      </div>
    </div>
  );
}

function RewardCard({ reward, isAdmin }: { reward: Reward; isAdmin: boolean }) {
  const [active, setActive] = useState(reward.active);
  const [isPending, startTransition] = useTransition();

  function handleToggle(checked: boolean) {
    setActive(checked);
    startTransition(async () => {
      const res = await toggleRewardActiveAction(reward.id, checked);
      if (res.error) setActive(!checked);
    });
  }

  return (
    <Card className={active ? undefined : "opacity-60"}>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <h3 className="font-semibold">{reward.name_ar}</h3>
          {reward.description && <p className="text-sm text-muted-foreground">{reward.description}</p>}
        </div>
        <span className="whitespace-nowrap font-bold" style={{ color: "var(--brand-accent)" }}>
          {reward.points_required} نقطة
        </span>
      </CardHeader>
      <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
        <span>تم الاستبدال {reward.redeemed_count} مرة</span>
        {isAdmin && (
          <div className="flex items-center gap-3">
            <RewardModal reward={reward} trigger={<Button variant="secondary" size="sm">تعديل</Button>} />
            <Switch checked={active} onCheckedChange={handleToggle} disabled={isPending} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
