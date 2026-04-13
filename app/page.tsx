import { redirect } from "next/navigation";
import { resolveServerAuthzSnapshot } from "@/lib/server-auth";
import { resolvePostLoginRoute } from "@/shared/lib/authz-routing";
import { APP_ROUTES } from "@/shared/lib/routes";

export default async function RootPage() {
  const snapshot = await resolveServerAuthzSnapshot();

  if (!snapshot) {
    redirect(APP_ROUTES.login);
  }

  redirect(resolvePostLoginRoute(snapshot));
}
