import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { resolveServerAuthzSnapshot } from "@/lib/server-auth";
import { LoginForm } from "@/modules/auth/components/login-form";
import { resolvePostLoginRoute } from "@/shared/lib/authz-routing";
import { normalizeReturnPath } from "@/shared/lib/redirects";

export const metadata: Metadata = { title: "Sign In" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const snapshot = await resolveServerAuthzSnapshot();
  const returnTo = normalizeReturnPath(params.from);

  if (snapshot) {
    redirect(returnTo ?? resolvePostLoginRoute(snapshot));
  }

  return <LoginForm returnTo={returnTo} />;
}
