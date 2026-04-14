"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { getNextLocale } from "@/i18n/config";
import { setLocale } from "@/shared/actions/set-locale";
import { runLocaleSwitch } from "@/shared/lib/locale-switch";

export function LocaleSwitcher() {
  const locale = useLocale();
  const t = useTranslations("nav");
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const nextLocale = getNextLocale(locale);

  function switchLocale(nextLocale: string) {
    setIsPending(true);

    void runLocaleSwitch(async () => {
      toast.dismiss();
      await queryClient.cancelQueries();
      await setLocale(nextLocale);
      window.location.reload();
      await new Promise<void>(() => {});
    }).catch(() => {
      setIsPending(false);
    });
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={() => switchLocale(nextLocale)}
      className="text-xs font-medium"
      aria-label={t("switchLocale", { locale: nextLocale.toUpperCase() })}
    >
      {nextLocale.toUpperCase()}
    </Button>
  );
}
