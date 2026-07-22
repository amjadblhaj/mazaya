"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { SuperAdminSidebar } from "./SuperAdminSidebar";

export function SuperAdminShell({ children }: { children: React.ReactNode }) {
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
        <SuperAdminSidebar onNavigate={() => setMobileOpen(false)} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b bg-background px-4 py-2 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted"
            aria-label="القائمة"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
        <main className="min-w-0 flex-1 overflow-x-auto bg-brand-surface">{children}</main>
      </div>
    </div>
  );
}
