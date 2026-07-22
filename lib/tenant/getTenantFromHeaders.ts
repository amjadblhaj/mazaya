import "server-only";
import { headers } from "next/headers";
import type { TenantBranding } from "@/types";

/** Reads the tenant branding proxy.ts attached to the request as `x-tenant-data`. */
export async function getTenantFromHeaders(): Promise<TenantBranding | null> {
  const headersList = await headers();
  const raw = headersList.get("x-tenant-data");
  if (!raw) return null;

  try {
    return JSON.parse(decodeURIComponent(raw)) as TenantBranding;
  } catch {
    return null;
  }
}
