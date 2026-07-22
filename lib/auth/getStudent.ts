import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStudentSession } from "@/lib/auth/studentSession";
import type { Student } from "@/types";

/** Current signed-in student, or null if unauthenticated. Service-role read
 * since students aren't Supabase Auth users (see studentSession.ts). */
export async function getCurrentStudent(): Promise<Student | null> {
  const session = await getStudentSession();
  if (!session) return null;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("id", session.studentId)
    .eq("tenant_id", session.tenantId)
    .eq("active", true)
    .maybeSingle();

  if (error || !data) return null;
  return data as Student;
}
