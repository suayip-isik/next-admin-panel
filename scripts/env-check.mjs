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
    optionalEnv("NEXT_PUBLIC_APP_URL") ?? "http://localhost:3000",
    "NEXT_PUBLIC_APP_URL",
  );
  const fastApiUrl = normalizeUrl(
    optionalEnv("NEXT_PUBLIC_FASTAPI_URL") ?? "http://localhost:8000",
    "NEXT_PUBLIC_FASTAPI_URL",
  );
  const openApiSchemaUrl = normalizeUrl(
    optionalEnv("OPENAPI_SCHEMA_URL") ??
      `${fastApiUrl}/schema/admin/openapi.json`,
    "OPENAPI_SCHEMA_URL",
  );

  parseNumber("NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE", 0.1);
  parseNumber("SENTRY_TRACES_SAMPLE_RATE", 0.1);
  parseNumber("AUTH_ACCESS_TOKEN_MAX_AGE_SECONDS", 1800);
  parseNumber("AUTH_REFRESH_TOKEN_MAX_AGE_SECONDS", 2592000);
  parseBoolean("AUTH_COOKIE_SECURE", false);
  parseSameSite("AUTH_COOKIE_SAME_SITE", "lax");

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
