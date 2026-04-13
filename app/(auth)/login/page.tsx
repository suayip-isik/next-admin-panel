import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthCookieConfig } from "@/lib/env";
import { LoginForm } from "@/modules/auth/components/login-form";
import { APP_ROUTES } from "@/shared/lib/routes";

export const metadata: Metadata = { title: "Sign In" };

async function hasValidSession() {
  const requestHeaders = await headers();
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const host = requestHeaders.get("host");
  const cookieHeader = requestHeaders.get("cookie");

  if (!host) {
    return false;
  }

  try {
    const response = await fetch(`${protocol}://${host}/api/v1/shared/me`, {
      headers: cookieHeader ? { cookie: cookieHeader } : undefined,
      cache: "no-store",
    });

    return response.ok;
  } catch {
    return false;
  }
}

export default async function LoginPage() {
  const authEnv = getAuthCookieConfig();
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(authEnv.accessCookieName);

  if (accessToken && (await hasValidSession())) {
    redirect(APP_ROUTES.dashboard);
  }

  return <LoginForm />;
}
