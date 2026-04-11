# Environment Guide

## Source of Truth

The environment contract lives in:

1. `.env.example`
2. `lib/env.ts`
3. `pnpm env:check`

`pnpm env:init` is only a convenience helper. The primary setup path is to inspect `.env.example`, copy it to `.env.local`, and edit values explicitly.

## Local Setup

```bash
cp .env.example .env.local
pnpm env:check
pnpm dev
```

Local development works with safe defaults for URLs and test tooling. Optional observability variables can stay empty until you intentionally adopt Sentry.

## Public vs Server-only Variables

Public variables use the `NEXT_PUBLIC_` prefix and are exposed to client bundles.

Server-only variables are not prefixed. They should stay in local `.env.local` files or deployment secret stores only. Typical examples:

- auth cookie policy
- server-side Sentry credentials
- schema/tooling overrides

## Test and CI-safe Validation

The repository ships with `.env.test` for safe non-secret defaults used by local testing and CI assumptions.

CI runs:

```bash
pnpm env:check -- --ci-safe
```

`--ci-safe` validates the contract without requiring deployment-only secrets or completed branding values.

## Optional Provider Variables

The base repository is provider-agnostic. Real deployments should set `NEXT_PUBLIC_APP_URL` explicitly.

Optional provider/platform fallbacks may still be consumed when present:

- `DEPLOYMENT_URL`
- `DEPLOY_ENVIRONMENT`
- `VERCEL_URL`
- `VERCEL_ENV`
- `VERCEL_GIT_COMMIT_SHA`

These are optional conveniences, not part of the required local bootstrap path.

## Template Consumers vs Contributors

- Template consumers should replace branding, URLs, and observability values before the first production deploy.
- Contributors should keep `.env.local` local-only and never commit real credentials.
