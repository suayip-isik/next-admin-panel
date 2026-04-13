import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuthCookieConfig } from "@/lib/env";
import { APP_ROUTES, AUTH_ROUTE_PATHS } from "@/shared/lib/routes";

function isAuthPath(pathname: string): boolean {
  return AUTH_ROUTE_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/"),
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static assets pass through
  if (
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt"
  ) {
    return NextResponse.next();
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
      const from = request.nextUrl.pathname + request.nextUrl.search;
      if (from !== APP_ROUTES.login) {
        loginUrl.searchParams.set("from", from);
      }
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
