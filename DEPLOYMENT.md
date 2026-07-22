# Deploying Mazaya

## 1. Vercel project

1. Go to [vercel.com/new](https://vercel.com/new) and import `amjadblhaj/mazaya` from GitHub.
2. Framework preset: Next.js (auto-detected). Leave build settings as default.
3. Before the first deploy, add the environment variables below.

## 2. Environment variables

Set these in Vercel (Project Settings → Environment Variables), copying the
values from your local `.env.local` — same Supabase project as development
per your earlier decision, so these should match exactly except for the two
marked below:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | same as `.env.local` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | same as `.env.local` |
| `SUPABASE_SERVICE_ROLE_KEY` | same as `.env.local` — mark as "Sensitive" in Vercel |
| `STUDENT_SESSION_SECRET` | same as `.env.local` — mark as "Sensitive" |
| `NEXT_PUBLIC_PLATFORM_NAME` | `مزايا` |
| `NEXT_PUBLIC_PLATFORM_NAME_EN` | `Mazaya` |
| `NEXT_PUBLIC_PLATFORM_DOMAIN` | **your actual production domain**, e.g. `yourdomain.com` — not `mazaya.app`, that was only the spec's example |
| `NEXT_PUBLIC_PLATFORM_COLOR_PRIMARY` | `#170C79` |
| `NEXT_PUBLIC_PLATFORM_COLOR_CREAM` | `#EFE3CA` |
| `NEXT_PUBLIC_PLATFORM_COLOR_TEAL` | `#56B6C6` |

`NEXT_PUBLIC_PLATFORM_DOMAIN` is what `proxy.ts` uses to tell tenant
subdomains apart from the marketing root — it must exactly match whatever
domain you point at this Vercel project in step 3.

## 3. Domain + wildcard subdomains

1. Decide your production domain (not yet chosen as of writing this).
2. In Vercel: Project Settings → Domains → add both the apex domain
   (`yourdomain.com`) and a wildcard (`*.yourdomain.com`).
3. Vercel will show you DNS records to add at your domain registrar —
   typically an `A`/`ALIAS` record for the apex and a `CNAME` for `*` pointing
   at `cname.vercel-dns.com`. Exact records depend on your registrar; Vercel's
   domain UI shows the current values to use.
4. Wait for DNS propagation (Vercel's dashboard shows verification status).

No `vercel.json` rewrite is needed for subdomain routing — `proxy.ts`
already reads the `host` header directly and resolves the tenant from it on
every request. The wildcard domain in Vercel's dashboard is what makes
`*.yourdomain.com` all hit this same deployment in the first place; that's
the only Vercel-side subdomain configuration required.

## 4. Deploy the daily-check Edge Function

Separate from the Next.js deploy — see `supabase/functions/daily-check/README.md`.
Needs your own Supabase CLI login, not something done through Vercel.

## 5. Post-deploy verification

- [ ] `https://yourdomain.com/` loads the marketing root
- [ ] `https://tamam.yourdomain.com/login` loads with tamam's branding (or
      whichever subdomain you pick as your first real tenant)
- [ ] Register a fresh tenant end-to-end on production
- [ ] Confirm two different tenant subdomains show independent branding
      simultaneously (open both in separate tabs)
- [ ] `https://yourdomain.com/super-admin/login` works and is not reachable
      by tenant staff credentials
- [ ] Excel upload works (tests the `serverActions.bodySizeLimit` config
      actually applies in production, not just locally)

## Known test data in this Supabase project

Per your decision to keep using this project for production, clean these up
before real customers register (tamam is meant to stay — it's your own
academy per the original spec):

- Tenants: `qarar`, and any `e2e*`/`testacademy*`/`expiry-test*`/`warning-test*`
  subdomains from testing
- The `superadmin` / `admin123` super-admin test account (or at least
  rotate its password before going live)
- Test students/notifications seeded under `tamam` during development
