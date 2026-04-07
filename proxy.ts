import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_PATHS = [
  "/login",
  "/totp",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

function isAuthPath(pathname: string): boolean {
  return AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
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
    const accessToken = request.cookies.get("access_token")?.value;
    if (!accessToken) {
      const loginUrl = new URL("/login", request.url);
      const from = request.nextUrl.pathname + request.nextUrl.search;
      if (from !== "/login") {
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
