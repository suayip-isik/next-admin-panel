import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { getSentryBuildConfig } from "./lib/env";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const sentryBuildConfig = getSentryBuildConfig();
const hasSentryAuthToken = Boolean(sentryBuildConfig.authToken);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: hasSentryAuthToken,
};

export default withSentryConfig(withNextIntl(nextConfig), {
  org: sentryBuildConfig.org,
  project: sentryBuildConfig.project,
  authToken: sentryBuildConfig.authToken,
  silent: !process.env.CI,
  sourcemaps: {
    disable: !hasSentryAuthToken,
  },
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
