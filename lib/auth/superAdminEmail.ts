/** Same synthetic-email pattern as staffAuthEmail, minus the tenant prefix
 * since super admins aren't tenant-scoped — just needs to be globally unique
 * and never shown to the user. */
export function superAdminAuthEmail(username: string): string {
  const normalized = username.trim().toLowerCase().replace(/[^a-z0-9.-]/g, "_");
  return `${normalized}@superadmin.mazaya.internal`;
}
