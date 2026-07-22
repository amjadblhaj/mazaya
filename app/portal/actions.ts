"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentStudent } from "@/lib/auth/getStudent";
import { clearStudentSession } from "@/lib/auth/studentSession";
import { redirect } from "next/navigation";

export interface RedeemState {
  error?: string;
  success?: boolean;
}

export async function redeemRewardAction(rewardId: number): Promise<RedeemState> {
  const student = await getCurrentStudent();
  if (!student) return { error: "غير مصرح" };

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("redeem_reward", {
    p_tenant_id: student.tenant_id,
    p_student_id: student.id,
    p_reward_id: rewardId,
    p_granted_by: "portal",
  });

  if (error || !data?.success) {
    const msg: string | undefined = data?.error;
    const message =
      msg === "Insufficient points"
        ? "النقاط غير كافية"
        : msg === "Reward inactive"
          ? "المكافأة غير متاحة حالياً"
          : "تعذر الاستبدال";
    return { error: message };
  }

  revalidatePath("/portal");
  return { success: true };
}

export async function studentLogoutAction() {
  await clearStudentSession();
  redirect("/login");
}
