import Link from "next/link";
import { getTenantFromHeaders } from "@/lib/tenant/getTenantFromHeaders";
import { createClient } from "@/lib/supabase/server";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function StudentsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const tenant = (await getTenantFromHeaders())!;
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("students")
    .select("id, full_name, phone, points, active, branches(name_ar)")
    .eq("tenant_id", tenant.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (q) {
    // PostgREST .or() treats ',' and '()' as syntax — strip them so a search
    // term can't be crafted into extra filter clauses.
    const safeQ = q.replace(/[,()]/g, "").trim().slice(0, 100);
    if (safeQ) query = query.or(`full_name.ilike.%${safeQ}%,phone.ilike.%${safeQ}%`);
  }

  const { data: students } = await query;

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: "var(--brand-primary)" }}>
          الطلاب
        </h1>
        <Button
          render={<Link href="/students/new" />}
          nativeButton={false}
          style={{ background: "var(--brand-accent)" }}
        >
          إضافة طالب
        </Button>
      </div>

      <form method="get" className="flex gap-2">
        <Input name="q" defaultValue={q} placeholder="ابحث بالاسم أو رقم الهاتف" className="max-w-sm" />
        <Button type="submit" variant="secondary">
          بحث
        </Button>
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>الاسم</TableHead>
            <TableHead>الهاتف</TableHead>
            <TableHead>الفرع</TableHead>
            <TableHead>النقاط</TableHead>
            <TableHead>الحالة</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(students ?? []).length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                لا يوجد طلاب
              </TableCell>
            </TableRow>
          )}
          {(students ?? []).map((s) => (
            <TableRow key={s.id}>
              <TableCell>
                <Link href={`/students/${s.id}`} className="font-medium hover:underline">
                  {s.full_name}
                </Link>
              </TableCell>
              <TableCell dir="ltr" className="text-right">
                {s.phone}
              </TableCell>
              <TableCell>{(s.branches as unknown as { name_ar: string } | null)?.name_ar ?? "—"}</TableCell>
              <TableCell style={{ color: "var(--brand-accent)" }} className="font-semibold">
                {s.points}
              </TableCell>
              <TableCell>{s.active ? "نشط" : "موقوف"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
