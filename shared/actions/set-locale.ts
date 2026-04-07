"use server";

import { cookies } from "next/headers";

const LOCALES = ["en", "tr"] as const;

export async function setLocale(locale: string) {
  if (!LOCALES.includes(locale as (typeof LOCALES)[number])) {
    return;
  }
  const cookieStore = await cookies();
  cookieStore.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
