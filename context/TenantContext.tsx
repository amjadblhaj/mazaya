"use client";

import { createContext, useContext } from "react";
import type { TenantBranding } from "@/types";

const TenantContext = createContext<TenantBranding | null>(null);

export function TenantProvider({
  tenant,
  children,
}: {
  tenant: TenantBranding;
  children: React.ReactNode;
}) {
  return <TenantContext.Provider value={tenant}>{children}</TenantContext.Provider>;
}

export function useTenant(): TenantBranding {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error("useTenant must be used within a TenantProvider");
  return ctx;
}
