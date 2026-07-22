import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const STATUS_LABELS: Record<string, string> = {
  trial: "تجريبي",
  active: "نشط",
  suspended: "موقوف",
  expired: "منتهي",
};

export default async function SuperAdminTenantsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;
  const supabase = createAdminClient();

  const { data: stats } = await supabase.from("tenant_stats").select("*").order("academy_name_ar");
  const { data: tenants } = await supabase.from("tenants").select("id, owner_name, owner_email, subdomain");
  const tenantsById = new Map((tenants ?? []).map((t) => [t.id, t]));

  let rows = (stats ?? []).map((s) => ({ ...s, ...tenantsById.get(s.tenant_id) }));

  if (status) rows = rows.filter((r) => r.status === status);
  if (q) {
    const needle = q.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.academy_name_ar?.toLowerCase().includes(needle) ||
        r.owner_name?.toLowerCase().includes(needle) ||
        r.owner_email?.toLowerCase().includes(needle) ||
        r.subdomain?.toLowerCase().includes(needle)
    );
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <h1 className="text-2xl font-bold" style={{ color: "var(--brand-primary)" }}>
        الأكاديميات
      </h1>

      <form method="get" className="flex gap-2">
        <Input name="q" defaultValue={q} placeholder="ابحث بالاسم أو البريد أو الرابط الفرعي" className="max-w-sm" />
        <Button type="submit" variant="secondary">
          بحث
        </Button>
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>الأكاديمية</TableHead>
            <TableHead>المالك</TableHead>
            <TableHead>الخطة</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>الفروع</TableHead>
            <TableHead>الطلاب</TableHead>
            <TableHead>الانتهاء</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                لا توجد أكاديميات
              </TableCell>
            </TableRow>
          )}
          {rows.map((r) => (
            <TableRow key={r.tenant_id}>
              <TableCell>
                <Link href={`/super-admin/tenants/${r.tenant_id}`} className="font-medium hover:underline">
                  {r.academy_name_ar}
                </Link>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {r.owner_name}
                <br />
                {r.owner_email}
              </TableCell>
              <TableCell className="uppercase">{r.plan}</TableCell>
              <TableCell>
                <Badge variant={r.status === "active" ? "default" : r.status === "trial" ? "secondary" : "destructive"}>
                  {STATUS_LABELS[r.status] ?? r.status}
                </Badge>
              </TableCell>
              <TableCell>
                {r.branches_used}/{r.total_branches_allowed === -1 ? "∞" : r.total_branches_allowed}
              </TableCell>
              <TableCell>
                {r.students_count}/{r.max_students === -1 ? "∞" : r.max_students}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {r.status === "trial"
                  ? new Date(r.trial_ends_at).toLocaleDateString("ar")
                  : r.subscription_ends_at
                    ? new Date(r.subscription_ends_at).toLocaleDateString("ar")
                    : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
