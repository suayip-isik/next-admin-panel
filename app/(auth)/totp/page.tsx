import type { Metadata } from "next";
import { Suspense } from "react";
import { TOTPForm } from "@/modules/auth/components/totp-form";

export const metadata: Metadata = { title: "Two-Factor Authentication" };

export default function TOTPPage() {
  return (
    <Suspense>
      <TOTPForm />
    </Suspense>
  );
}
