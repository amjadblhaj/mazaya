"use client";

import { useActionState, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { findStudentByPhone, grantPointsAction, type GrantState, type FoundStudent } from "@/app/(tenant)/grant/actions";

const initialState: GrantState = {};

export function GrantForm() {
  const [phone, setPhone] = useState("");
  const [student, setStudent] = useState<FoundStudent | null>(null);
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [state, formAction, pending] = useActionState(grantPointsAction, initialState);

  useEffect(() => {
    if (!phone.trim()) {
      setStudent(null);
      setNotFound(false);
      return;
    }
    setSearching(true);
    const timeout = setTimeout(async () => {
      const result = await findStudentByPhone(phone);
      setStudent(result);
      setNotFound(!result);
      setSearching(false);
    }, 400);
    return () => clearTimeout(timeout);
  }, [phone]);

  useEffect(() => {
    // Refetch (don't clear) so the success message — rendered inside the
    // `student &&` block below — actually gets a chance to display, and the
    // card shows the post-grant balance instead of a stale number.
    if (state.success && phone) {
      findStudentByPhone(phone).then(setStudent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="search-phone">رقم هاتف الطالب</Label>
        <Input
          id="search-phone"
          dir="ltr"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="0910000000"
        />
        {searching && <p className="text-sm text-muted-foreground">جارٍ البحث...</p>}
        {notFound && !searching && <p className="text-sm text-destructive">لم يتم العثور على طالب بهذا الرقم</p>}
      </div>

      {student && (
        <>
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <span className="font-medium">{student.full_name}</span>
              <span className="font-semibold" style={{ color: "var(--brand-accent)" }}>
                {student.points} نقطة
              </span>
            </CardContent>
          </Card>

          <form action={formAction} className="flex flex-col gap-4">
            <input type="hidden" name="studentId" value={student.id} />
            <div className="flex flex-col gap-2">
              <Label htmlFor="points">عدد النقاط (سالب للخصم)</Label>
              <Input id="points" name="points" type="number" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="reason">السبب</Label>
              <Input id="reason" name="reason" required />
            </div>
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
            {state.success && (
              <p className="text-sm text-green-600">تم بنجاح — الرصيد الجديد: {state.newBalance}</p>
            )}
            <Button type="submit" disabled={pending} style={{ background: "var(--brand-accent)" }}>
              {pending ? "جارٍ التنفيذ..." : "منح النقاط"}
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
