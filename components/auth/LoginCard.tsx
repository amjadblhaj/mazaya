"use client";

import { useActionState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { staffLoginAction, studentLoginAction, type LoginState } from "@/app/login/actions";
import type { TenantBranding } from "@/types";

const initialState: LoginState = {};

export function LoginCard({ tenant, showWelcome }: { tenant: TenantBranding; showWelcome: boolean }) {
  const [staffState, staffAction, staffPending] = useActionState(staffLoginAction, initialState);
  const [studentState, studentAction, studentPending] = useActionState(studentLoginAction, initialState);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="flex flex-col items-center gap-2 text-center">
        {tenant.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={tenant.logo_url} alt={tenant.academy_name_ar} className="h-12 w-auto" />
        ) : (
          <span className="text-xl font-black" style={{ color: "var(--brand-primary)" }}>
            {tenant.academy_name_ar}
          </span>
        )}
        {showWelcome && (
          <p className="text-sm text-muted-foreground">تم إنشاء الحساب بنجاح، سجّل الدخول للمتابعة</p>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="staff">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="staff">الموظفون</TabsTrigger>
            <TabsTrigger value="student">الطلاب</TabsTrigger>
          </TabsList>

          <TabsContent value="staff">
            <form action={staffAction} className="flex flex-col gap-4 pt-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="username">اسم المستخدم</Label>
                <Input id="username" name="username" required autoComplete="username" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="staff-password">كلمة المرور</Label>
                <Input id="staff-password" name="password" type="password" required autoComplete="current-password" />
              </div>
              {staffState.error && <p className="text-sm text-destructive">{staffState.error}</p>}
              <Button type="submit" disabled={staffPending} style={{ background: "var(--brand-accent)" }}>
                {staffPending ? "جارٍ الدخول..." : "دخول"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="student">
            <form action={studentAction} className="flex flex-col gap-4 pt-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input id="phone" name="phone" type="tel" required autoComplete="tel" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="student-password">كلمة المرور</Label>
                <Input id="student-password" name="password" type="password" required autoComplete="current-password" />
              </div>
              {studentState.error && <p className="text-sm text-destructive">{studentState.error}</p>}
              <Button type="submit" disabled={studentPending} style={{ background: "var(--brand-accent)" }}>
                {studentPending ? "جارٍ الدخول..." : "دخول"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
