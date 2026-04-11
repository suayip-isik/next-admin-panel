import { afterEach, describe, expect, it, vi } from "vitest";

describe("env helpers", () => {
  afterEach(() => {
    vi.resetModules();
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.NEXT_PUBLIC_FASTAPI_URL;
    delete process.env.NEXT_PUBLIC_APP_NAME;
    delete process.env.NEXT_PUBLIC_APP_SHORT_NAME;
    delete process.env.NEXT_PUBLIC_APP_DESCRIPTION;
    delete process.env.NEXT_PUBLIC_APP_THEME_COLOR;
    delete process.env.NEXT_PUBLIC_APP_BACKGROUND_COLOR;
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;
    delete process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE;
    delete process.env.AUTH_ACCESS_COOKIE_NAME;
    delete process.env.AUTH_REFRESH_COOKIE_NAME;
    delete process.env.AUTH_COOKIE_PATH;
    delete process.env.AUTH_COOKIE_SAME_SITE;
    delete process.env.AUTH_COOKIE_SECURE;
    delete process.env.AUTH_ACCESS_TOKEN_MAX_AGE_SECONDS;
    delete process.env.AUTH_REFRESH_TOKEN_MAX_AGE_SECONDS;
    delete process.env.OPENAPI_SCHEMA_URL;
    delete process.env.PLAYWRIGHT_BASE_URL;
    delete process.env.PLAYWRIGHT_WEB_SERVER_URL;
    delete process.env.DEPLOYMENT_URL;
    delete process.env.DEPLOY_ENVIRONMENT;
    delete process.env.VERCEL_URL;
    delete process.env.VERCEL_ENV;
  });

  it("prefers NEXT_PUBLIC_APP_URL when available", async () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://admin.example.com/";

    const { getAppUrl } = await import("@/lib/env");

    expect(getAppUrl()).toBe("https://admin.example.com");
  });

  it("falls back to the Vercel deployment URL", async () => {
    process.env.VERCEL_URL = "preview-admin.vercel.app";

    const { getAppUrl } = await import("@/lib/env");

    expect(getAppUrl()).toBe("https://preview-admin.vercel.app");
  });

  it("supports provider-agnostic deployment URL fallbacks", async () => {
    process.env.DEPLOYMENT_URL = "https://deploy.example.com/";
    process.env.DEPLOY_ENVIRONMENT = "staging";

    const { getAppUrl, getDeployEnvironment } = await import("@/lib/env");

    expect(getAppUrl()).toBe("https://deploy.example.com");
    expect(getDeployEnvironment()).toBe("staging");
  });

  it("enables indexing only for production deployments", async () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://admin.example.com";
    process.env.VERCEL_ENV = "preview";

    const { isSearchIndexingEnabled } = await import("@/lib/env");

    expect(isSearchIndexingEnabled()).toBe(false);
  });

  it("parses public metadata and sentry config", async () => {
    process.env.NEXT_PUBLIC_APP_NAME = "Acme Console";
    process.env.NEXT_PUBLIC_APP_SHORT_NAME = "Acme";
    process.env.NEXT_PUBLIC_APP_DESCRIPTION = "Acme admin surface";
    process.env.NEXT_PUBLIC_APP_THEME_COLOR = "#000000";
    process.env.NEXT_PUBLIC_APP_BACKGROUND_COLOR = "#fafafa";
    process.env.NEXT_PUBLIC_SENTRY_DSN =
      "https://public@example.ingest.sentry.io/1";
    process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE = "0.25";

    const { getPublicEnv, getClientSentryConfig } = await import("@/lib/env");

    expect(getPublicEnv()).toMatchObject({
      appName: "Acme Console",
      appShortName: "Acme",
      appDescription: "Acme admin surface",
      themeColor: "#000000",
      backgroundColor: "#fafafa",
      sentryDsn: "https://public@example.ingest.sentry.io/1",
      sentryTracesSampleRate: 0.25,
    });
    expect(getClientSentryConfig()).toMatchObject({
      dsn: "https://public@example.ingest.sentry.io/1",
      enabled: true,
      tracesSampleRate: 0.25,
    });
  });

  it("parses auth cookie and tooling settings", async () => {
    process.env.NEXT_PUBLIC_FASTAPI_URL = "https://api.example.com/";
    process.env.AUTH_ACCESS_COOKIE_NAME = "acme_access";
    process.env.AUTH_REFRESH_COOKIE_NAME = "acme_refresh";
    process.env.AUTH_COOKIE_PATH = "/admin";
    process.env.AUTH_COOKIE_SAME_SITE = "strict";
    process.env.AUTH_COOKIE_SECURE = "true";
    process.env.AUTH_ACCESS_TOKEN_MAX_AGE_SECONDS = "900";
    process.env.AUTH_REFRESH_TOKEN_MAX_AGE_SECONDS = "86400";
    process.env.PLAYWRIGHT_BASE_URL = "https://preview.example.com/";

    const {
      getAuthCookieConfig,
      getFastApiUrl,
      getOpenApiSchemaUrl,
      getPlaywrightConfig,
    } = await import("@/lib/env");

    expect(getFastApiUrl()).toBe("https://api.example.com");
    expect(getOpenApiSchemaUrl()).toBe(
      "https://api.example.com/schema/admin/openapi.json",
    );
    expect(getAuthCookieConfig()).toEqual({
      accessCookieName: "acme_access",
      refreshCookieName: "acme_refresh",
      cookiePath: "/admin",
      cookieSameSite: "strict",
      cookieSecure: true,
      accessTokenMaxAgeSeconds: 900,
      refreshTokenMaxAgeSeconds: 86400,
    });
    expect(getPlaywrightConfig()).toEqual({
      baseUrl: "https://preview.example.com",
      webServerUrl: "https://preview.example.com",
    });
  });

  it("throws for invalid numeric env values", async () => {
    process.env.AUTH_ACCESS_TOKEN_MAX_AGE_SECONDS = "oops";

    const { getAuthCookieConfig } = await import("@/lib/env");

    expect(() => getAuthCookieConfig()).toThrow(
      'Invalid numeric value for environment variable AUTH_ACCESS_TOKEN_MAX_AGE_SECONDS: "oops"',
    );
  });
});
