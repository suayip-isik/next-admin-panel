import { loadLocalEnv } from "./load-env.mjs";

loadLocalEnv(process.cwd());

const isCiSafe = process.argv.includes("--ci-safe");

function readEnv(name) {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : "";
}

function optionalEnv(name) {
  const value = readEnv(name);
  return value.length > 0 ? value : undefined;
}

function normalizeUrl(value, name) {
  try {
    return new URL(value).toString().replace(/\/+$/, "");
  } catch {
    throw new Error(`Invalid URL in environment variable ${name}: "${value}"`);
  }
}

function normalizeOptionalUrl(value, name) {
  return value ? normalizeUrl(value, name) : undefined;
}

function parseNumber(name, fallback) {
  const value = optionalEnv(name);
  if (value === undefined) return fallback;

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(
      `Invalid numeric value for environment variable ${name}: "${value}"`,
    );
  }

  return parsed;
}

function parseBoolean(name, fallback) {
  const value = optionalEnv(name);
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
        `Invalid boolean value for environment variable ${name}: "${value}"`,
      );
  }
}

function parseSameSite(name, fallback) {
  const value = optionalEnv(name);
  if (value === undefined) return fallback;

  if (["lax", "strict", "none"].includes(value.toLowerCase())) {
    return value.toLowerCase();
  }

  throw new Error(
    `Invalid ${name} value "${value}". Expected lax, strict, or none.`,
  );
}

try {
  const appUrl = normalizeUrl(
    optionalEnv("NEXT_PUBLIC_APP_URL") ?? "http://127.0.0.1:3000",
    "NEXT_PUBLIC_APP_URL",
  );
  const fastApiUrl = normalizeUrl(
    optionalEnv("NEXT_PUBLIC_FASTAPI_URL") ?? "http://127.0.0.1:8000",
    "NEXT_PUBLIC_FASTAPI_URL",
  );
  const openApiSchemaUrl = normalizeUrl(
    optionalEnv("OPENAPI_SCHEMA_URL") ??
      `${fastApiUrl}/schema/admin/openapi.json`,
    "OPENAPI_SCHEMA_URL",
  );
  normalizeUrl(
    optionalEnv("PLAYWRIGHT_FASTAPI_URL") ?? "http://127.0.0.1:18000",
    "PLAYWRIGHT_FASTAPI_URL",
  );

  parseNumber("NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE", 0.1);
  parseNumber("SENTRY_TRACES_SAMPLE_RATE", 0.1);
  parseNumber("AUTH_ACCESS_TOKEN_MAX_AGE_SECONDS", 1800);
  parseNumber("AUTH_REFRESH_TOKEN_MAX_AGE_SECONDS", 2592000);
  const cookieSecure = parseBoolean("AUTH_COOKIE_SECURE", false);
  const cookieSameSite = parseSameSite("AUTH_COOKIE_SAME_SITE", "lax");
  normalizeOptionalUrl(
    optionalEnv("NEXT_PUBLIC_SENTRY_DSN"),
    "NEXT_PUBLIC_SENTRY_DSN",
  );
  normalizeOptionalUrl(optionalEnv("SENTRY_DSN"), "SENTRY_DSN");
  const isProductionDeployment =
    optionalEnv("DEPLOY_ENVIRONMENT") === "production" ||
    optionalEnv("VERCEL_ENV") === "production";
  const sentryBuildFields = [
    optionalEnv("SENTRY_AUTH_TOKEN"),
    optionalEnv("SENTRY_ORG"),
    optionalEnv("SENTRY_PROJECT"),
  ];
  const hasAnySentryBuildField = sentryBuildFields.some(Boolean);
  const hasAllSentryBuildField = sentryBuildFields.every(Boolean);

  if (isProductionDeployment && new URL(appUrl).protocol !== "https:") {
    throw new Error(
      "NEXT_PUBLIC_APP_URL must use https in production deployments.",
    );
  }

  if (isProductionDeployment && !cookieSecure) {
    throw new Error(
      "AUTH_COOKIE_SECURE must be true in production deployments.",
    );
  }

  if (cookieSameSite === "none" && !cookieSecure) {
    throw new Error(
      "AUTH_COOKIE_SAME_SITE=none requires AUTH_COOKIE_SECURE=true.",
    );
  }

  if (hasAnySentryBuildField && !hasAllSentryBuildField) {
    throw new Error(
      "SENTRY_AUTH_TOKEN, SENTRY_ORG, and SENTRY_PROJECT must either all be set together or all be empty.",
    );
  }

  if (!isCiSafe) {
    if (!readEnv("NEXT_PUBLIC_APP_NAME")) {
      throw new Error(
        "Missing required environment variable: NEXT_PUBLIC_APP_NAME",
      );
    }

    if (!readEnv("NEXT_PUBLIC_APP_SHORT_NAME")) {
      throw new Error(
        "Missing required environment variable: NEXT_PUBLIC_APP_SHORT_NAME",
      );
    }
  }

  console.log("Environment contract is valid.");
  console.log(`- NEXT_PUBLIC_APP_URL=${appUrl}`);
  console.log(`- NEXT_PUBLIC_FASTAPI_URL=${fastApiUrl}`);
  console.log(`- OPENAPI_SCHEMA_URL=${openApiSchemaUrl}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
