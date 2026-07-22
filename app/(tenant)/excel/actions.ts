"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTenantFromHeaders } from "@/lib/tenant/getTenantFromHeaders";
import { getCurrentStaff } from "@/lib/auth/getStaff";
import { parseExcelBuffer } from "@/lib/excel/processExcel";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const CONCURRENCY = 10;

export interface ExcelRowResult {
  row: number;
  phone: string;
  status: "success" | "error";
  message: string;
}

export interface ExcelUploadResult {
  error?: string;
  summary?: { total: number; succeeded: number; failed: number };
  results?: ExcelRowResult[];
}

async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const current = index++;
      results[current] = await fn(items[current]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

export async function uploadExcelAction(formData: FormData): Promise<ExcelUploadResult> {
  const tenant = await getTenantFromHeaders();
  const staff = await getCurrentStaff();
  if (!tenant || !staff) return { error: "غير مصرح" };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "اختر ملفاً" };
  if (!/\.(xlsx|xls)$/i.test(file.name)) return { error: "صيغة الملف يجب أن تكون xlsx أو xls" };
  if (file.size > MAX_FILE_SIZE) return { error: "الحجم الأقصى 5 ميجابايت" };

  const buffer = Buffer.from(await file.arrayBuffer());

  let parsed;
  try {
    parsed = parseExcelBuffer(buffer);
  } catch {
    return { error: "تعذرت قراءة الملف — تأكد أنه ملف Excel صالح" };
  }

  const { rows, errors: parseErrors } = parsed;
  if (rows.length === 0 && parseErrors.length === 0) {
    return { error: "الملف فارغ أو بصيغة غير صحيحة" };
  }

  const supabase = createAdminClient();

  const rowResults = await mapWithConcurrency(rows, CONCURRENCY, async (row): Promise<ExcelRowResult> => {
    const { data: student } = await supabase
      .from("students")
      .select("id, branch_id")
      .eq("tenant_id", tenant.id)
      .eq("phone", row.phone)
      .maybeSingle();

    if (!student) {
      return { row: row.row, phone: row.phone, status: "error", message: "الطالب غير موجود" };
    }

    const { data, error } = await supabase.rpc("grant_points", {
      p_tenant_id: tenant.id,
      p_student_id: student.id,
      p_points: row.points,
      p_action: row.reason,
      p_type: "excel",
      p_granted_by: staff.username,
      p_branch_id: student.branch_id,
      p_note: null,
    });

    if (error || !data?.success) {
      const reasonCode = data?.error;
      const message = reasonCode === "insufficient_points" ? "النقاط غير كافية" : "تعذر التنفيذ";
      return { row: row.row, phone: row.phone, status: "error", message };
    }

    return { row: row.row, phone: row.phone, status: "success", message: `تم — الرصيد الجديد: ${data.new_balance}` };
  });

  const parseErrorResults: ExcelRowResult[] = parseErrors
    .filter((e) => e.row > 0)
    .map((e) => ({ row: e.row, phone: "", status: "error" as const, message: e.error }));

  const allResults = [...rowResults, ...parseErrorResults].sort((a, b) => a.row - b.row);
  const succeeded = rowResults.filter((r) => r.status === "success").length;

  revalidatePath("/students");
  revalidatePath("/dashboard");

  return {
    summary: { total: allResults.length, succeeded, failed: allResults.length - succeeded },
    results: allResults,
  };
}
