"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createStudentAction, type CreateStudentState } from "@/app/(tenant)/students/actions";

const initialState: CreateStudentState = {};

export function NewStudentForm({ branches }: { branches: { id: number; name_ar: string }[] }) {
  const [state, formAction, pending] = useActionState(createStudentAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="fullName">الاسم الكامل</Label>
        <Input id="fullName" name="fullName" required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">رقم الهاتف</Label>
        <Input id="phone" name="phone" type="tel" dir="ltr" required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="branchId">الفرع</Label>
        {branches.length > 0 ? (
          <Select name="branchId">
            <SelectTrigger id="branchId">
              <SelectValue placeholder="اختر الفرع (اختياري)" />
            </SelectTrigger>
            <SelectContent>
              {branches.map((b) => (
                <SelectItem key={b.id} value={String(b.id)}>
                  {b.name_ar}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <p className="text-sm text-muted-foreground">لا توجد فروع بعد — يمكن إضافتها لاحقاً من الإعدادات</p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">كلمة مرور دخول الطالب</Label>
        <Input id="password" name="password" type="password" required minLength={6} />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending} style={{ background: "var(--brand-accent)" }}>
        {pending ? "جارٍ الإضافة..." : "إضافة الطالب"}
      </Button>
    </form>
  );
}
