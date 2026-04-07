import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { LoginForm } from "@/modules/auth/components/login-form";

export const metadata: Metadata = { title: "Sign In" };

export default async function LoginPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (accessToken) {
    try {
      const requestHeaders = await headers();
      const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
      const host = requestHeaders.get("host");
      const cookieHeader = requestHeaders.get("cookie");

      if (!host) {
        return <LoginForm />;
      }

      const res = await fetch(`${protocol}://${host}/api/v1/auth/me`, {
        headers: cookieHeader ? { cookie: cookieHeader } : undefined,
        cache: "no-store",
      });
      if (res.ok) {
        redirect("/dashboard");
      }
      // Token invalid/expired — fall through to show login form
    } catch {
      // FastAPI unreachable — show login form
    }
  }

  return <LoginForm />;
}
