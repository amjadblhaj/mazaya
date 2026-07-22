import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function SuperAdminSubscriptionsPage() {
  const supabase = createAdminClient();

  const [{ data: subscriptions }, { data: tenants }] = await Promise.all([
    supabase.from("subscriptions").select("*").order("created_at", { ascending: false }).limit(200),
    supabase.from("tenants").select("id, academy_name_ar"),
  ]);

  const tenantNameById = new Map((tenants ?? []).map((t) => [t.id, t.academy_name_ar]));

  return (
    <div className="flex flex-col gap-6 p-8">
      <h1 className="text-2xl font-bold" style={{ color: "var(--brand-primary)" }}>
        الاشتراكات
      </h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>الأكاديمية</TableHead>
            <TableHead>الخطة</TableHead>
            <TableHead>المبلغ</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>المرجع</TableHead>
            <TableHead>بواسطة</TableHead>
            <TableHead>التاريخ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(subscriptions ?? []).length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                لا يوجد اشتراكات بعد
              </TableCell>
            </TableRow>
          )}
          {(subscriptions ?? []).map((s) => (
            <TableRow key={s.id}>
              <TableCell>
                <Link href={`/super-admin/tenants/${s.tenant_id}`} className="hover:underline">
                  {tenantNameById.get(s.tenant_id) ?? s.tenant_id}
                </Link>
              </TableCell>
              <TableCell className="uppercase">{s.plan}</TableCell>
              <TableCell>
                {s.amount} {s.currency}
              </TableCell>
              <TableCell>
                <Badge variant={s.status === "active" ? "default" : s.status === "pending" ? "secondary" : "destructive"}>
                  {s.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{s.payment_ref ?? "—"}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{s.activated_by ?? "—"}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(s.created_at).toLocaleDateString("ar")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
