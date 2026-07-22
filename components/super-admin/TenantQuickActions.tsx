"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { suspendTenantAction, reactivateTenantAction, extendTrialAction } from "@/app/super-admin/(protected)/tenants/[id]/actions";

export function TenantQuickActions({ tenantId, status }: { tenantId: string; status: string }) {
  const [isPending, startTransition] = useTransition();
  const [extendDays, setExtendDays] = useState("14");
  const [error, setError] = useState<string | null>(null);

  function handleSuspendToggle() {
    setError(null);
    startTransition(async () => {
      const action = status === "suspended" ? reactivateTenantAction : suspendTenantAction;
      const res = await action(tenantId);
      if (res.error) setError(res.error);
    });
  }

  function handleExtendTrial() {
    setError(null);
    const days = Number(extendDays);
    startTransition(async () => {
      const res = await extendTrialAction(tenantId, days);
      if (res.error) setError(res.error);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="secondary" disabled={isPending} onClick={handleSuspendToggle}>
          {status === "suspended" ? "إعادة التفعيل" : "إيقاف الأكاديمية"}
        </Button>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={1}
            value={extendDays}
            onChange={(e) => setExtendDays(e.target.value)}
            className="w-20"
          />
          <Button type="button" variant="secondary" disabled={isPending} onClick={handleExtendTrial}>
            تمديد التجربة (يوم)
          </Button>
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
