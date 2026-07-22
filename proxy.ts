import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getTenantBySubdomain } from "@/lib/tenant/getTenant";

const PLATFORM_DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "mazaya.app";

/**
 * Returns the tenant subdomain for a request host, or null when the request
 * is targeting the platform root (marketing site, /super-admin, previews).
 *
 * Handles: apex + www on the real platform domain, Vercel preview domains,
 * and local dev via `*.localhost` (works in Chrome/Edge with no /etc/hosts
 * changes, e.g. tamam.localhost:3000).
 */
function getSubdomain(host: string): string | null {
  const hostname = host.split(":")[0];

  if (hostname === "localhost" || hostname === "127.0.0.1") return null;
  if (hostname.endsWith(".vercel.app")) return null;
  if (hostname === PLATFORM_DOMAIN || hostname === `www.${PLATFORM_DOMAIN}`) return null;

  if (hostname.endsWith(`.${PLATFORM_DOMAIN}`)) {
    return hostname.slice(0, -(`.${PLATFORM_DOMAIN}`.length));
  }
  if (hostname.endsWith(".localhost")) {
    return hostname.slice(0, -".localhost".length);
  }

  return null;
}

export async function proxy(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const subdomain = getSubdomain(host);

  if (!subdomain || subdomain === "www" || subdomain === "super-admin") {
    return NextResponse.next();
  }

  const tenant = await getTenantBySubdomain(subdomain);

  if (!tenant) {
    return NextResponse.redirect(new URL("/not-found", request.url));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-tenant-id", tenant.id);
  // Headers must be ByteString (Latin-1) — tenant data contains Arabic text,
  // so it has to be URI-encoded going in and decoded on the read side.
  requestHeaders.set("x-tenant-data", encodeURIComponent(JSON.stringify(tenant)));

  let response = NextResponse.next({ request: { headers: requestHeaders } });

  // Standard Supabase SSR pattern: refresh the staff session token here so
  // it's valid before the page renders, and propagate the refreshed cookie
  // through every response rebuild triggered by setAll.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: requestHeaders } });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
