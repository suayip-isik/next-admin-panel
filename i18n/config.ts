export const LOCALES = ["en", "tr"] as const;
export type AppLocale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "en";
export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

export function isSupportedLocale(locale: string): locale is AppLocale {
  return LOCALES.includes(locale as AppLocale);
}

export function resolveLocale(locale?: string | null): AppLocale {
  if (locale && isSupportedLocale(locale)) {
    return locale;
  }

  return DEFAULT_LOCALE;
}

export function getNextLocale(locale?: string | null): AppLocale {
  return resolveLocale(locale) === "en" ? "tr" : "en";
}

export function toAcceptLanguageHeader(
  locale?: string | null,
): string | undefined {
  const resolvedLocale = resolveLocale(locale);

  if (resolvedLocale === DEFAULT_LOCALE) {
    return undefined;
  }

  return resolvedLocale;
}
