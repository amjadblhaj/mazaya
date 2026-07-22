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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createRewardAction, updateRewardAction, type RewardFormState } from "@/app/(tenant)/rewards/actions";
import type { Reward } from "@/types";

const initialState: RewardFormState = {};

export function RewardModal({ reward, trigger }: { reward?: Reward; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const action = reward ? updateRewardAction : createRewardAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) setOpen(false);
  }, [state.success]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{reward ? "تعديل المكافأة" : "إضافة مكافأة"}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          {reward && <input type="hidden" name="id" value={reward.id} />}
          <div className="flex flex-col gap-2">
            <Label htmlFor="nameAr">الاسم (عربي)</Label>
            <Input id="nameAr" name="nameAr" defaultValue={reward?.name_ar} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="nameEn">الاسم (إنجليزي)</Label>
            <Input id="nameEn" name="nameEn" defaultValue={reward?.name_en ?? ""} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">الوصف</Label>
            <Textarea id="description" name="description" defaultValue={reward?.description ?? ""} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="pointsRequired">النقاط المطلوبة</Label>
            <Input
              id="pointsRequired"
              name="pointsRequired"
              type="number"
              min={1}
              defaultValue={reward?.points_required}
              required
            />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending} style={{ background: "var(--brand-accent)" }}>
              {pending ? "جارٍ الحفظ..." : "حفظ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
