/**
 * Staff log in with a tenant-scoped `username` (UNIQUE per tenant_id, not
 * globally), but Supabase Auth requires a globally-unique email. This maps
 * (tenant_id, username) to a deterministic synthetic address so the same
 * username can exist under different tenants without colliding in Auth.
 * Never shown to the user — purely an internal Auth identifier.
 */
export function staffAuthEmail(tenantId: string, username: string): string {
  // username may itself be an email address (the tenant owner's login is
  // their real email) — strip anything that isn't safe in a single local-part
  // segment so the result is never more than one "@".
  const normalized = username.trim().toLowerCase().replace(/[^a-z0-9.-]/g, "_");
  return `${tenantId}__${normalized}@staff.mazaya.internal`;
}
