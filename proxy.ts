import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuthCookieConfig } from "@/lib/env";
import { applyPageSecurityHeaders, createCspNonce } from "@/lib/security";
import { APP_ROUTES, AUTH_ROUTE_PATHS } from "@/shared/lib/routes";
import { normalizeReturnPath } from "@/shared/lib/redirects";

function isAuthPath(pathname: string): boolean {
  return AUTH_ROUTE_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/"),
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const nonce = createCspNonce();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  applyPageSecurityHeaders(response.headers, { nonce });

  // Static assets pass through
  if (
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt"
  ) {
    return response;
  }

  // Check auth only for non-auth, non-API routes
  const isApiRoute = pathname.startsWith("/api/");
  const isAdminRoute = pathname !== "/" && !isAuthPath(pathname) && !isApiRoute;

  if (isAdminRoute) {
    const accessToken = request.cookies.get(
      getAuthCookieConfig().accessCookieName,
    )?.value;
    if (!accessToken) {
      const loginUrl = new URL(APP_ROUTES.login, request.url);
      const from = normalizeReturnPath(
        request.nextUrl.pathname + request.nextUrl.search,
      );
      if (from && from !== APP_ROUTES.login) {
        loginUrl.searchParams.set("from", from);
      }
      const redirectResponse = NextResponse.redirect(loginUrl);
      applyPageSecurityHeaders(redirectResponse.headers, { nonce });
      return redirectResponse;
    }
  }

  return response;
}

export const config = {
  matcher: [
    {
      source:
        "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
