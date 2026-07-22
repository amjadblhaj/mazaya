import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RejectAddonButton } from "@/components/super-admin/RejectAddonButton";

export default async function SuperAdminAddonsPage() {
  const supabase = createAdminClient();

  const [{ data: addons }, { data: tenants }] = await Promise.all([
    supabase.from("branch_addons").select("*").order("created_at", { ascending: false }).limit(200),
    supabase.from("tenants").select("id, academy_name_ar"),
  ]);

  const tenantNameById = new Map((tenants ?? []).map((t) => [t.id, t.academy_name_ar]));

  return (
    <div className="flex flex-col gap-6 p-8">
      <h1 className="text-2xl font-bold" style={{ color: "var(--brand-primary)" }}>
        طلبات إضافة الفروع
      </h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>الأكاديمية</TableHead>
            <TableHead>الفروع</TableHead>
            <TableHead>المبلغ</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>التاريخ</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(addons ?? []).length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                لا توجد طلبات بعد
              </TableCell>
            </TableRow>
          )}
          {(addons ?? []).map((a) => (
            <TableRow key={a.id}>
              <TableCell>
                <Link href={`/super-admin/tenants/${a.tenant_id}`} className="hover:underline">
                  {tenantNameById.get(a.tenant_id) ?? a.tenant_id}
                </Link>
              </TableCell>
              <TableCell>{a.branches}</TableCell>
              <TableCell>
                {a.amount} {a.currency}
              </TableCell>
              <TableCell>
                <Badge variant={a.status === "active" ? "default" : a.status === "pending" ? "secondary" : "destructive"}>
                  {a.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(a.created_at).toLocaleDateString("ar")}
              </TableCell>
              <TableCell>{a.status === "pending" && <RejectAddonButton addonId={a.id} />}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
