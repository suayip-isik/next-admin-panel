"use client";

import { useEffect } from "react";

export default function AdminError({
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
    <div className="mx-auto flex max-w-xl flex-col gap-4 rounded-2xl border border-border bg-card p-8 shadow-sm">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Admin segment error
      </p>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">
          This admin page could not be rendered.
        </h2>
        <p className="text-sm text-muted-foreground">
          Retry the segment. Persistent failures should be investigated in
          Sentry and Vercel logs.
        </p>
      </div>
      {error.digest ? (
        <code className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
          digest: {error.digest}
        </code>
      ) : null}
      <button
        className="inline-flex w-fit items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        onClick={() => {
          if (typeof unstableRetry === "function") {
            unstableRetry();
            return;
          }

          reset?.();
        }}
        type="button"
      >
        Retry
      </button>
    </div>
  );
}
