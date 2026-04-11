import * as Sentry from "@sentry/nextjs";
import { getServerSentryConfig } from "@/lib/env";

Sentry.init({
  ...getServerSentryConfig(),
});
