import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BrandPreview } from "@/components/branding/BrandPreview";
import { ActivateModal } from "@/components/super-admin/ActivateModal";
import { AddonModal } from "@/components/super-admin/AddonModal";
import { TenantQuickActions } from "@/components/super-admin/TenantQuickActions";

const STATUS_LABELS: Record<string, string> = {
  trial: "تجريبي",
  active: "نشط",
  suspended: "موقوف",
  expired: "منتهي",
};

export default async function SuperAdminTenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [{ data: tenant }, { data: stats }, { data: subscriptions }, { data: addons }] = await Promise.all([
    supabase.from("tenants").select("*").eq("id", id).maybeSingle(),
    supabase.from("tenant_stats").select("*").eq("tenant_id", id).maybeSingle(),
    supabase.from("subscriptions").select("*").eq("tenant_id", id).order("created_at", { ascending: false }),
    supabase.from("branch_addons").select("*").eq("tenant_id", id).order("created_at", { ascending: false }),
  ]);

  if (!tenant) notFound();

  const pendingSubs = (subscriptions ?? []).filter((s) => s.status === "pending");
  const pendingAddons = (addons ?? []).filter((a) => a.status === "pending");

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--brand-primary)" }}>
            {tenant.academy_name_ar}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tenant.subdomain}.mazaya.app — {tenant.owner_name} ({tenant.owner_email})
          </p>
        </div>
        <Badge variant={tenant.status === "active" ? "default" : tenant.status === "trial" ? "secondary" : "destructive"}>
          {STATUS_LABELS[tenant.status] ?? tenant.status}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="font-semibold">الهوية البصرية</CardHeader>
          <CardContent>
            <BrandPreview
              academyName={tenant.academy_name_ar}
              primary={tenant.color_primary}
              secondary={tenant.color_secondary}
              accent={tenant.color_accent}
              logoPreview={tenant.logo_url}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="font-semibold">الاشتراك والاستخدام</CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <p>الخطة: <span className="font-medium uppercase">{tenant.plan}</span></p>
            <p>
              الفروع: {stats?.branches_used ?? 0}/{stats?.total_branches_allowed === -1 ? "∞" : stats?.total_branches_allowed}
            </p>
            <p>
              الطلاب: {stats?.students_count ?? 0}/{tenant.max_students === -1 ? "∞" : tenant.max_students}
            </p>
            <p>
              {tenant.status === "trial"
                ? `تنتهي التجربة: ${new Date(tenant.trial_ends_at).toLocaleDateString("ar")}`
                : tenant.subscription_ends_at
                  ? `ينتهي الاشتراك: ${new Date(tenant.subscription_ends_at).toLocaleDateString("ar")}`
                  : "لا يوجد تاريخ انتهاء"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="font-semibold">إجراءات سريعة</CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <ActivateModal tenantId={tenant.id} />
            <AddonModal tenantId={tenant.id} />
          </div>
          <TenantQuickActions tenantId={tenant.id} status={tenant.status} />
        </CardContent>
      </Card>

      {(pendingSubs.length > 0 || pendingAddons.length > 0) && (
        <Card>
          <CardHeader className="font-semibold text-destructive">طلبات دفع بانتظار المراجعة</CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            {pendingSubs.map((s) => (
              <p key={`sub-${s.id}`}>
                اشتراك {s.plan} — {s.amount} {s.currency} — {new Date(s.created_at).toLocaleDateString("ar")}
              </p>
            ))}
            {pendingAddons.map((a) => (
              <p key={`addon-${a.id}`}>
                إضافة {a.branches} فرع — {a.amount} {a.currency} — {new Date(a.created_at).toLocaleDateString("ar")}
              </p>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="font-semibold">سجل الاشتراكات</CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الخطة</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>المرجع</TableHead>
                <TableHead>التاريخ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(subscriptions ?? []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    لا يوجد سجل
                  </TableCell>
                </TableRow>
              )}
              {(subscriptions ?? []).map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="uppercase">{s.plan}</TableCell>
                  <TableCell>
                    {s.amount} {s.currency}
                  </TableCell>
                  <TableCell>{s.status}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.payment_ref}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(s.created_at).toLocaleDateString("ar")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="font-semibold">سجل إضافات الفروع</CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الفروع</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>التاريخ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(addons ?? []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    لا يوجد سجل
                  </TableCell>
                </TableRow>
              )}
              {(addons ?? []).map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.branches}</TableCell>
                  <TableCell>
                    {a.amount} {a.currency}
                  </TableCell>
                  <TableCell>{a.status}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(a.created_at).toLocaleDateString("ar")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
