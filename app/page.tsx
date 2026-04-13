import { redirect } from "next/navigation";
import { APP_ROUTES } from "@/shared/lib/routes";

export default function RootPage() {
  redirect(APP_ROUTES.dashboard);
}
