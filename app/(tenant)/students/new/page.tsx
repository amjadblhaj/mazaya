import { getTenantFromHeaders } from "@/lib/tenant/getTenantFromHeaders";
import { createClient } from "@/lib/supabase/server";
import { NewStudentForm } from "@/components/students/NewStudentForm";

export default async function NewStudentPage() {
  const tenant = (await getTenantFromHeaders())!;
  const supabase = await createClient();

  const { data: branches } = await supabase
    .from("branches")
    .select("id, name_ar")
    .eq("tenant_id", tenant.id)
    .eq("active", true)
    .order("name_ar");

  return (
    <div className="mx-auto max-w-md p-8">
      <h1 className="mb-6 text-2xl font-bold" style={{ color: "var(--brand-primary)" }}>
        إضافة طالب
      </h1>
      <NewStudentForm branches={branches ?? []} />
    </div>
  );
}
