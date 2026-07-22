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
import { Button } from "@/components/ui/button";
import { activateBranchAddonAction, type ActionState } from "@/app/super-admin/(protected)/tenants/[id]/actions";

const initialState: ActionState = {};

export function AddonModal({ tenantId }: { tenantId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(activateBranchAddonAction, initialState);

  useEffect(() => {
    if (state.success) setOpen(false);
  }, [state.success]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="secondary" />}>إضافة فرع</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إضافة فرع (50 د.ل لكل فرع)</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="tenantId" value={tenantId} />
          <div className="flex flex-col gap-2">
            <Label htmlFor="branches">عدد الفروع</Label>
            <Input id="branches" name="branches" type="number" min={1} defaultValue={1} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="addonPaymentRef">رقم مرجع الدفع</Label>
            <Input id="addonPaymentRef" name="paymentRef" required />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending} style={{ background: "var(--brand-accent)" }}>
              {pending ? "جارٍ التفعيل..." : "تأكيد"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
