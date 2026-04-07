"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/shared/components/ui/button";
import { setLocale } from "@/shared/actions/set-locale";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchLocale(nextLocale: string) {
    startTransition(async () => {
      await setLocale(nextLocale);
      router.refresh();
    });
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={() => switchLocale(locale === "en" ? "tr" : "en")}
      className="text-xs font-medium"
    >
      {locale === "en" ? "TR" : "EN"}
    </Button>
  );
}
