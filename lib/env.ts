const DEFAULT_APP_URL = "http://127.0.0.1:3000";
const DEFAULT_FASTAPI_URL = "http://127.0.0.1:8000";
const DEFAULT_APP_NAME = "Next Admin Panel";
const DEFAULT_APP_SHORT_NAME = "Admin Panel";
const DEFAULT_APP_DESCRIPTION =
  "Production-ready Next.js admin panel boilerplate";
const DEFAULT_THEME_COLOR = "#111827";
const DEFAULT_BACKGROUND_COLOR = "#ffffff";
const DEFAULT_SENTRY_TRACES_SAMPLE_RATE = 0.1;
const DEFAULT_ACCESS_TOKEN_MAX_AGE_SECONDS = 30 * 60;
const DEFAULT_REFRESH_TOKEN_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;
const DEFAULT_AUTH_COOKIE_PATH = "/";
const DEFAULT_AUTH_COOKIE_SAME_SITE = "lax";
const DEFAULT_ACCESS_COOKIE_NAME = "access_token";
const DEFAULT_REFRESH_COOKIE_NAME = "refresh_token";
const DEFAULT_OPENAPI_SCHEMA_PATH = "/schema/admin/openapi.json";
const DEFAULT_PLAYWRIGHT_FASTAPI_URL = "http://127.0.0.1:18000";

type SameSitePolicy = "lax" | "strict" | "none";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function readEnv(name: string) {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : "";
}

function getOptionalEnv(name: string) {
  const value = readEnv(name);
  return value.length > 0 ? value : undefined;
}

function getRequiredEnv(name: string) {
  const value = getOptionalEnv(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function normalizeUrl(value: string, envName: string) {
  try {
    return trimTrailingSlash(new URL(value).toString());
  } catch {
    throw new Error(
      `Invalid URL in environment variable ${envName}: "${value}"`,
    );
  }
}

function normalizeOptionalUrl(value: string | undefined, envName: string) {
  return value ? normalizeUrl(value, envName) : undefined;
}

function isSecureUrl(value: string) {
  return new URL(value).protocol === "https:";
}

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (value === undefined) return fallback;

  switch (value.toLowerCase()) {
    case "true":
    case "1":
    case "yes":
    case "on":
      return true;
    case "false":
    case "0":
    case "no":
    case "off":
      return false;
    default:
      throw new Error(
        `Invalid boolean value "${value}" in environment configuration`,
      );
  }
}

function parseNumber(
  value: string | undefined,
  fallback: number,
  envName: string,
) {
  if (value === undefined) return fallback;

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(
      `Invalid numeric value for environment variable ${envName}: "${value}"`,
    );
  }

  return parsed;
}

function parseSameSite(
  value: string | undefined,
  fallback: SameSitePolicy,
): SameSitePolicy {
  if (value === undefined) return fallback;

  switch (value.toLowerCase()) {
    case "lax":
    case "strict":
    case "none":
      return value.toLowerCase() as SameSitePolicy;
    default:
      throw new Error(
        `Invalid AUTH_COOKIE_SAME_SITE value "${value}". Expected lax, strict, or none.`,
      );
  }
}

function buildPublicEnv() {
  const explicitUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const deploymentUrl = process.env.DEPLOYMENT_URL?.trim();
  const vercelUrl = process.env.VERCEL_URL?.trim();
  const appUrl = explicitUrl
    ? normalizeUrl(explicitUrl, "NEXT_PUBLIC_APP_URL")
    : deploymentUrl
      ? normalizeUrl(deploymentUrl, "DEPLOYMENT_URL")
      : vercelUrl
        ? normalizeUrl(`https://${vercelUrl}`, "VERCEL_URL")
        : DEFAULT_APP_URL;

  const fastApiUrl = normalizeUrl(
    process.env.NEXT_PUBLIC_FASTAPI_URL?.trim() || DEFAULT_FASTAPI_URL,
    "NEXT_PUBLIC_FASTAPI_URL",
  );

  return {
    appUrl,
    fastApiUrl,
    appName: process.env.NEXT_PUBLIC_APP_NAME?.trim() || DEFAULT_APP_NAME,
    appShortName:
      process.env.NEXT_PUBLIC_APP_SHORT_NAME?.trim() || DEFAULT_APP_SHORT_NAME,
    appDescription:
      process.env.NEXT_PUBLIC_APP_DESCRIPTION?.trim() ||
      DEFAULT_APP_DESCRIPTION,
    themeColor:
      process.env.NEXT_PUBLIC_APP_THEME_COLOR?.trim() || DEFAULT_THEME_COLOR,
    backgroundColor:
      process.env.NEXT_PUBLIC_APP_BACKGROUND_COLOR?.trim() ||
      DEFAULT_BACKGROUND_COLOR,
    sentryDsn: normalizeOptionalUrl(
      process.env.NEXT_PUBLIC_SENTRY_DSN?.trim() || undefined,
      "NEXT_PUBLIC_SENTRY_DSN",
    ),
    sentryTracesSampleRate: parseNumber(
      process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE?.trim(),
      DEFAULT_SENTRY_TRACES_SAMPLE_RATE,
      "NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE",
    ),
  };
}

function buildServerEnv() {
  const publicEnv = buildPublicEnv();
  const fastApiUrl = publicEnv.fastApiUrl;
  const openApiSchemaUrl = normalizeUrl(
    getOptionalEnv("OPENAPI_SCHEMA_URL") ??
      `${fastApiUrl}${DEFAULT_OPENAPI_SCHEMA_PATH}`,
    "OPENAPI_SCHEMA_URL",
  );

  return {
    auth: {
      accessCookieName:
        getOptionalEnv("AUTH_ACCESS_COOKIE_NAME") ?? DEFAULT_ACCESS_COOKIE_NAME,
      refreshCookieName:
        getOptionalEnv("AUTH_REFRESH_COOKIE_NAME") ??
        DEFAULT_REFRESH_COOKIE_NAME,
      cookiePath:
        getOptionalEnv("AUTH_COOKIE_PATH") ?? DEFAULT_AUTH_COOKIE_PATH,
      cookieSameSite: parseSameSite(
        getOptionalEnv("AUTH_COOKIE_SAME_SITE"),
        DEFAULT_AUTH_COOKIE_SAME_SITE,
      ),
      cookieSecure: parseBoolean(
        getOptionalEnv("AUTH_COOKIE_SECURE"),
        process.env.NODE_ENV === "production",
      ),
      accessTokenMaxAgeSeconds: parseNumber(
        getOptionalEnv("AUTH_ACCESS_TOKEN_MAX_AGE_SECONDS"),
        DEFAULT_ACCESS_TOKEN_MAX_AGE_SECONDS,
        "AUTH_ACCESS_TOKEN_MAX_AGE_SECONDS",
      ),
      refreshTokenMaxAgeSeconds: parseNumber(
        getOptionalEnv("AUTH_REFRESH_TOKEN_MAX_AGE_SECONDS"),
        DEFAULT_REFRESH_TOKEN_MAX_AGE_SECONDS,
        "AUTH_REFRESH_TOKEN_MAX_AGE_SECONDS",
      ),
    },
    sentry: {
      dsn: normalizeOptionalUrl(
        getOptionalEnv("SENTRY_DSN") ??
          getOptionalEnv("NEXT_PUBLIC_SENTRY_DSN"),
        getOptionalEnv("SENTRY_DSN") ? "SENTRY_DSN" : "NEXT_PUBLIC_SENTRY_DSN",
      ),
      authToken: getOptionalEnv("SENTRY_AUTH_TOKEN"),
      org: getOptionalEnv("SENTRY_ORG"),
      project: getOptionalEnv("SENTRY_PROJECT"),
      tracesSampleRate: parseNumber(
        getOptionalEnv("SENTRY_TRACES_SAMPLE_RATE"),
        DEFAULT_SENTRY_TRACES_SAMPLE_RATE,
        "SENTRY_TRACES_SAMPLE_RATE",
      ),
      release:
        getOptionalEnv("SENTRY_RELEASE") ??
        getOptionalEnv("VERCEL_GIT_COMMIT_SHA"),
    },
    openApiSchemaUrl,
    playwright: {
      baseUrl: normalizeUrl(
        getOptionalEnv("PLAYWRIGHT_BASE_URL") ?? publicEnv.appUrl,
        "PLAYWRIGHT_BASE_URL",
      ),
      webServerUrl: normalizeUrl(
        getOptionalEnv("PLAYWRIGHT_WEB_SERVER_URL") ??
          getOptionalEnv("PLAYWRIGHT_BASE_URL") ??
          publicEnv.appUrl,
        "PLAYWRIGHT_WEB_SERVER_URL",
      ),
      fastApiUrl: normalizeUrl(
        getOptionalEnv("PLAYWRIGHT_FASTAPI_URL") ??
          getOptionalEnv("NEXT_PUBLIC_FASTAPI_URL") ??
          DEFAULT_PLAYWRIGHT_FASTAPI_URL,
        "PLAYWRIGHT_FASTAPI_URL",
      ),
    },
  };
}

function isProductionDeployment() {
  return (
    process.env.DEPLOY_ENVIRONMENT === "production" ||
    process.env.VERCEL_ENV === "production"
  );
}

function validatePublicSecurityContract() {
  const publicEnv = buildPublicEnv();
  if (isProductionDeployment() && !isSecureUrl(publicEnv.appUrl)) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL must use https in production deployments.",
    );
  }
}

function validateServerSecurityContract() {
  validatePublicSecurityContract();
  const serverEnv = buildServerEnv();
  const isProductionDeployment =
    process.env.DEPLOY_ENVIRONMENT === "production" ||
    process.env.VERCEL_ENV === "production";

  if (isProductionDeployment && !serverEnv.auth.cookieSecure) {
    throw new Error(
      "AUTH_COOKIE_SECURE must be true in production deployments.",
    );
  }

  if (
    serverEnv.auth.cookieSameSite === "none" &&
    !serverEnv.auth.cookieSecure
  ) {
    throw new Error(
      "AUTH_COOKIE_SAME_SITE=none requires AUTH_COOKIE_SECURE=true.",
    );
  }

  const sentryBuildFields = [
    serverEnv.sentry.authToken,
    serverEnv.sentry.org,
    serverEnv.sentry.project,
  ];
  const hasAnySentryBuildField = sentryBuildFields.some(Boolean);
  const hasAllSentryBuildFields = sentryBuildFields.every(Boolean);

  if (hasAnySentryBuildField && !hasAllSentryBuildFields) {
    throw new Error(
      "SENTRY_AUTH_TOKEN, SENTRY_ORG, and SENTRY_PROJECT must either all be set together or all be empty.",
    );
  }
}

export function getPublicEnv() {
  validatePublicSecurityContract();
  return buildPublicEnv();
}

export function getServerEnv() {
  validateServerSecurityContract();
  return buildServerEnv();
}

export function getAppUrl() {
  return getPublicEnv().appUrl;
}

export function getFastApiUrl() {
  return getPublicEnv().fastApiUrl;
}

export function getAppName() {
  return getPublicEnv().appName;
}

export function getAppShortName() {
  return getPublicEnv().appShortName;
}

export function getAppDescription() {
  return getPublicEnv().appDescription;
}

export function getAppThemeColor() {
  return getPublicEnv().themeColor;
}

export function getAppBackgroundColor() {
  return getPublicEnv().backgroundColor;
}

export function getDeployEnvironment() {
  return (
    process.env.DEPLOY_ENVIRONMENT ??
    process.env.VERCEL_ENV ??
    process.env.NODE_ENV ??
    "development"
  );
}

export function isSearchIndexingEnabled() {
  return (
    getDeployEnvironment() === "production" &&
    !getAppUrl().includes("localhost")
  );
}

export function getClientSentryConfig() {
  const env = getPublicEnv();

  return {
    dsn: env.sentryDsn,
    enabled: Boolean(env.sentryDsn),
    tracesSampleRate: env.sentryTracesSampleRate,
    environment: process.env.NODE_ENV,
  };
}

export function isClientSentryTracingEnabled() {
  const env = getPublicEnv();

  return process.env.NODE_ENV === "production" && Boolean(env.sentryDsn);
}

export function getServerSentryConfig() {
  const sentry = getServerEnv().sentry;

  return {
    dsn: sentry.dsn,
    enabled: Boolean(sentry.dsn),
    tracesSampleRate: sentry.tracesSampleRate,
    environment: getDeployEnvironment(),
    release: sentry.release,
  };
}

export function getAuthCookieConfig() {
  return getServerEnv().auth;
}

export function getOpenApiSchemaUrl() {
  return getServerEnv().openApiSchemaUrl;
}

export function getPlaywrightConfig() {
  return getServerEnv().playwright;
}

export function getSentryBuildConfig() {
  const sentry = getServerEnv().sentry;

  return {
    authToken: sentry.authToken,
    org: sentry.org,
    project: sentry.project,
  };
}

export function requireEnv(name: string) {
  return getRequiredEnv(name);
}
