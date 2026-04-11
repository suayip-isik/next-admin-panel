"use client";

import { useEffect } from "react";

function retryBoundary(reset?: () => void, unstableRetry?: () => void) {
  if (typeof unstableRetry === "function") {
    unstableRetry();
    return;
  }

  reset?.();
}

export default function GlobalError({
  error,
  reset,
  unstable_retry: unstableRetry,
}: {
  error: Error & { digest?: string };
  reset?: () => void;
  unstable_retry?: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <div className="mx-auto flex w-full max-w-lg flex-col gap-4 rounded-2xl border border-border bg-card p-8 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Unexpected error
          </p>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold">
              The application hit an unrecoverable error.
            </h1>
            <p className="text-sm text-muted-foreground">
              Retry the request. If the issue persists, inspect the Sentry event
              and deployment logs.
            </p>
          </div>
          {error.digest ? (
            <code className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
              digest: {error.digest}
            </code>
          ) : null}
          <button
            className="inline-flex w-fit items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            onClick={() => retryBoundary(reset, unstableRetry)}
            type="button"
          >
            Retry
          </button>
        </div>
      </body>
    </html>
  );
}
