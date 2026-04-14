import * as Sentry from "@sentry/nextjs";
import { getClientSentryConfig, isClientSentryTracingEnabled } from "@/lib/env";

const tracingEnabled = isClientSentryTracingEnabled();

Sentry.init({
  ...getClientSentryConfig(),
  integrations: tracingEnabled
    ? undefined
    : (defaultIntegrations) =>
        defaultIntegrations.filter(
          (integration) => integration.name !== "BrowserTracing",
        ),
});

export function onRouterTransitionStart(
  url: string,
  navigationType: "push" | "replace" | "traverse",
) {
  if (!tracingEnabled) {
    return;
  }

  Sentry.captureRouterTransitionStart(url, navigationType);
}
