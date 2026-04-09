import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  resolveLocale,
} from "@/i18n/config";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  const locale = resolveLocale(localeCookie ?? DEFAULT_LOCALE);

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
