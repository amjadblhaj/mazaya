import { getTenantFromHeaders } from "@/lib/tenant/getTenantFromHeaders";
import { createClient } from "@/lib/supabase/server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const TYPE_LABELS: Record<string, string> = {
  grant: "منح",
  redeem: "استبدال",
  excel: "استيراد Excel",
  manual: "يدوي",
  adjustment: "تعديل",
};

const TYPES = Object.keys(TYPE_LABELS);

export default async function ActivityPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const tenant = (await getTenantFromHeaders())!;
  const { type } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("points_log")
    .select("id, points, action, type, granted_by, created_at, students(full_name), branches(name_ar)")
    .eq("tenant_id", tenant.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (type && TYPES.includes(type)) query = query.eq("type", type);

  const { data: logs } = await query;

  return (
    <div className="flex flex-col gap-6 p-8">
      <h1 className="text-2xl font-bold" style={{ color: "var(--brand-primary)" }}>
        سجل النشاط
      </h1>

      <div className="flex flex-wrap gap-2">
        <Button
          render={<Link href="/activity" />}
          nativeButton={false}
          variant={!type ? "default" : "secondary"}
          size="sm"
        >
          الكل
        </Button>
        {TYPES.map((t) => (
          <Button
            key={t}
            render={<Link href={`/activity?type=${t}`} />}
            nativeButton={false}
            variant={type === t ? "default" : "secondary"}
            size="sm"
          >
            {TYPE_LABELS[t]}
          </Button>
        ))}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>التاريخ</TableHead>
            <TableHead>الطالب</TableHead>
            <TableHead>الوصف</TableHead>
            <TableHead>النوع</TableHead>
            <TableHead>الفرع</TableHead>
            <TableHead>بواسطة</TableHead>
            <TableHead>النقاط</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(logs ?? []).length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                لا يوجد نشاط
              </TableCell>
            </TableRow>
          )}
          {(logs ?? []).map((log) => (
            <TableRow key={log.id}>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(log.created_at).toLocaleString("ar")}
              </TableCell>
              <TableCell>{(log.students as unknown as { full_name: string } | null)?.full_name ?? "—"}</TableCell>
              <TableCell>{log.action}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{TYPE_LABELS[log.type] ?? log.type}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {(log.branches as unknown as { name_ar: string } | null)?.name_ar ?? "—"}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{log.granted_by}</TableCell>
              <TableCell className={log.points >= 0 ? "text-green-600" : "text-destructive"}>
                {log.points >= 0 ? "+" : ""}
                {log.points}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
