"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { rejectAddonAction } from "@/app/super-admin/(protected)/tenants/[id]/actions";

export function RejectAddonButton({ addonId }: { addonId: number }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await rejectAddonAction(addonId);
        })
      }
    >
      رفض
    </Button>
  );
}
