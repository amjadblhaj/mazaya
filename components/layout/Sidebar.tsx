"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Gift as GiftIcon,
  Upload,
  Activity,
  Settings,
  Award,
} from "lucide-react";
import { TenantLogo } from "./TenantLogo";

const NAV_ITEMS = [
  { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/students", label: "الطلاب", icon: Users },
  { href: "/grant", label: "منح النقاط", icon: Award },
  { href: "/excel", label: "استيراد Excel", icon: Upload },
  { href: "/rewards", label: "المكافآت", icon: GiftIcon },
  { href: "/activity", label: "سجل النشاط", icon: Activity },
  // General branch/staff management (/settings) isn't built yet — only
  // /settings/brand exists so far, so the nav points straight there.
  { href: "/settings/brand", label: "الإعدادات", icon: Settings },
] as const;

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <aside
      className="flex h-full w-64 flex-col justify-between overflow-y-auto p-4"
      style={{ background: "var(--brand-primary)" }}
    >
      <div>
        <div className="mb-8 px-2">
          <TenantLogo />
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
      <div className="px-2 text-xs" style={{ color: "var(--brand-secondary)", opacity: 0.3 }}>
        مدعوم بـ مزايا
      </div>
    </aside>
  );
}
