import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { resolveServerAuthzSnapshot } from "@/lib/server-auth";
import { LoginForm } from "@/modules/auth/components/login-form";
import { resolvePostLoginRoute } from "@/shared/lib/authz-routing";

export const metadata: Metadata = { title: "Sign In" };

export default async function LoginPage() {
  const snapshot = await resolveServerAuthzSnapshot();

  if (snapshot) {
    redirect(resolvePostLoginRoute(snapshot));
  }

  return <LoginForm />;
}
