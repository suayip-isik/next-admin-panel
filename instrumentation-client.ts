import * as Sentry from "@sentry/nextjs";
import { getClientSentryConfig } from "@/lib/env";

Sentry.init({
  ...getClientSentryConfig(),
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
