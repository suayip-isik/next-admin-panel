"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { setLocale } from "@/shared/actions/set-locale";
import { runLocaleSwitch } from "@/shared/lib/locale-switch";

export function LocaleSwitcher() {
  const locale = useLocale();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  function switchLocale(nextLocale: string) {
    setIsPending(true);

    void runLocaleSwitch(async () => {
      toast.dismiss();
      await queryClient.cancelQueries();
      queryClient.clear();
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
      onClick={() => switchLocale(locale === "en" ? "tr" : "en")}
      className="text-xs font-medium"
    >
      {locale === "en" ? "TR" : "EN"}
    </Button>
  );
}
