import { notFound } from "next/navigation";
import { getTenantFromHeaders } from "@/lib/tenant/getTenantFromHeaders";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const studentId = Number(id);
  if (!Number.isInteger(studentId)) notFound();

  const tenant = (await getTenantFromHeaders())!;
  const supabase = await createClient();

  const { data: student } = await supabase
    .from("students")
    .select("id, full_name, phone, points, active, joined_at, branches(name_ar)")
    .eq("tenant_id", tenant.id)
    .eq("id", studentId)
    .single();

  if (!student) notFound();

  const { data: history } = await supabase
    .from("points_log")
    .select("id, points, action, type, created_at, granted_by")
    .eq("tenant_id", tenant.id)
    .eq("student_id", studentId)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="flex flex-col gap-6 p-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--brand-primary)" }}>
              {student.full_name}
            </h1>
            <p dir="ltr" className="text-right text-sm text-muted-foreground">
              {student.phone}
            </p>
          </div>
          <div className="text-left">
            <p className="text-2xl font-bold" style={{ color: "var(--brand-accent)" }}>
              {student.points}
            </p>
            <p className="text-xs text-muted-foreground">نقطة</p>
          </div>
        </CardHeader>
        <CardContent className="flex gap-6 text-sm text-muted-foreground">
          <span>الفرع: {(student.branches as unknown as { name_ar: string } | null)?.name_ar ?? "—"}</span>
          <span>الحالة: {student.active ? "نشط" : "موقوف"}</span>
          <span>الانضمام: {student.joined_at}</span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="font-semibold" style={{ color: "var(--brand-primary)" }}>
          سجل النقاط
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>الوصف</TableHead>
                <TableHead>بواسطة</TableHead>
                <TableHead>النقاط</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(history ?? []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    لا يوجد سجل بعد
                  </TableCell>
                </TableRow>
              )}
              {(history ?? []).map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(log.created_at).toLocaleDateString("ar")}
                  </TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{log.granted_by}</TableCell>
                  <TableCell className={log.points >= 0 ? "text-green-600" : "text-destructive"}>
                    {log.points >= 0 ? "+" : ""}
                    {log.points}
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
