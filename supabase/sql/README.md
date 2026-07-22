# Mazaya database setup

Run once, in order, in the Supabase SQL Editor:

1. `001_schema.sql` — tables, indexes, `tenant_stats` view, RPC functions, RLS policies, and the `tenant-logos` storage bucket.

## Notes on deviations from the original spec

- `super_admins` and `staff` no longer have a `password` column. Both are backed
  by real Supabase Auth users (`auth_user_id UUID REFERENCES auth.users(id)`),
  so credentials live in Supabase Auth, not in these tables. This is what lets
  the RLS policies key off `auth.uid()` directly.
- `students` keeps its own `password` column (bcrypt hash) since students are
  *not* Supabase Auth users — the portal login flow checks it server-side with
  the service-role client, and tenant scoping for students happens in
  application code rather than via RLS.
- Added a regex `CHECK` constraint on all four tenant color columns
  (`^#[0-9A-Fa-f]{6}$`) as a DB-level backstop for the CSS-injection guard the
  spec calls for at the app layer.

## After running the SQL

- Create the first super admin: sign them up via Supabase Auth (dashboard or
  `supabase.auth.admin.createUser`), then insert a matching row into
  `super_admins` with their `auth_user_id`.
- Verify the storage bucket `tenant-logos` exists under Storage and is public.
- Manually test `can_add_branch`, `can_add_student`, `redeem_reward`,
  `activate_subscription`, and `activate_branch_addon` against a throwaway
  tenant row before wiring up the UI.
