"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, Receipt, PlusSquare } from "lucide-react";
import { superAdminLogoutAction } from "@/app/super-admin/login/actions";

const NAV_ITEMS = [
  { href: "/super-admin/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/super-admin/tenants", label: "الأكاديميات", icon: Building2 },
  { href: "/super-admin/subscriptions", label: "الاشتراكات", icon: Receipt },
  { href: "/super-admin/addons", label: "طلبات الفروع", icon: PlusSquare },
] as const;

export function SuperAdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <aside
      className="flex h-full w-64 flex-col justify-between overflow-y-auto p-4"
      style={{ background: "var(--brand-primary)" }}
    >
      <div>
        <div className="mb-8 px-2">
          <span className="text-xl font-black" style={{ color: "var(--brand-secondary)" }}>
            مزايا
          </span>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                onClick={onNavigate}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                style={{
                  color: isActive ? "var(--brand-accent)" : "var(--brand-secondary)",
                  background: isActive ? "color-mix(in srgb, var(--brand-accent) 15%, transparent)" : "transparent",
                  opacity: isActive ? 1 : 0.7,
                }}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
      <form action={superAdminLogoutAction}>
        <button type="submit" className="px-3 text-xs" style={{ color: "var(--brand-secondary)", opacity: 0.5 }}>
          تسجيل الخروج
        </button>
      </form>
    </aside>
  );
}
