"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { NotificationBell } from "./NotificationBell";
import { TrialBanner } from "@/components/subscription/TrialBanner";
import type { Notification } from "@/types";

export function TenantShell({
  notifications,
  children,
}: {
  notifications: Notification[];
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed inset-y-0 right-0 z-50 transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <Sidebar onNavigate={() => setMobileOpen(false)} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b bg-background px-4 py-2">
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted lg:hidden"
            aria-label="القائمة"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <div className="flex-1" />
          <NotificationBell notifications={notifications} />
        </div>
        <TrialBanner />
        <main className="min-w-0 flex-1 overflow-x-auto bg-brand-surface">{children}</main>
      </div>
    </div>
  );
}
