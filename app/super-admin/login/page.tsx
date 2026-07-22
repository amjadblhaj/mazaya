"use client";

import { useActionState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { superAdminLoginAction, type SuperAdminLoginState } from "./actions";

const initialState: SuperAdminLoginState = {};

export default function SuperAdminLoginPage() {
  const [state, formAction, pending] = useActionState(superAdminLoginAction, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center p-4" style={{ background: "var(--brand-dark)" }}>
      <Card className="w-full max-w-sm">
        <CardHeader className="flex flex-col items-center gap-1 text-center">
          <span className="text-xl font-black" style={{ color: "var(--brand-primary)" }}>
            مزايا
          </span>
          <p className="text-sm text-muted-foreground">لوحة تحكم المنصة</p>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="username">اسم المستخدم</Label>
              <Input id="username" name="username" required autoComplete="username" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input id="password" name="password" type="password" required autoComplete="current-password" />
            </div>
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
            <Button type="submit" disabled={pending} style={{ background: "var(--brand-accent)" }}>
              {pending ? "جارٍ الدخول..." : "دخول"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
