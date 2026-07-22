"use client";

import { useActionState, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { activateSubscriptionAction, type ActionState } from "@/app/super-admin/(protected)/tenants/[id]/actions";

const initialState: ActionState = {};

const PLANS = [
  { value: "basic", label: "أساسي — 300 د.ل" },
  { value: "standard", label: "متوسط — 500 د.ل" },
  { value: "pro", label: "متقدم — 800 د.ل" },
];

export function ActivateModal({ tenantId }: { tenantId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(activateSubscriptionAction, initialState);

  useEffect(() => {
    if (state.success) setOpen(false);
  }, [state.success]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button style={{ background: "var(--brand-accent)" }} />}>
        تفعيل الاشتراك
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تفعيل الاشتراك</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="tenantId" value={tenantId} />
          <div className="flex flex-col gap-2">
            <Label htmlFor="plan">الخطة</Label>
            <select id="plan" name="plan" required className="rounded-md border px-3 py-2 text-sm">
              {PLANS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="months">المدة</Label>
            <select id="months" name="months" required className="rounded-md border px-3 py-2 text-sm">
              <option value="12">12 شهر</option>
              <option value="6">6 أشهر</option>
              <option value="3">3 أشهر</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="paymentRef">رقم مرجع الدفع</Label>
            <Input id="paymentRef" name="paymentRef" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">ملاحظات</Label>
            <Textarea id="notes" name="notes" />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending} style={{ background: "var(--brand-accent)" }}>
              {pending ? "جارٍ التفعيل..." : "تأكيد التفعيل"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
