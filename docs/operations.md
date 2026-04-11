# Operations Guide

## Deployment Model

This repository ships with a provider-agnostic CI, security, and governance baseline. Deployment integrations are optional examples layered on top of the base repository.

## Branch Protection / Ruleset Baseline

Configure `main` so that it requires:

- pull request before merge
- at least 1 approving review
- stale approval dismissal when new commits are pushed
- resolved conversations before merge
- force pushes disabled
- branch deletion disabled

Recommended required checks:

- `env-check`
- `lint`
- `typecheck`
- `unit-tests`
- `build`
- `dependency-review`
- `e2e` if you keep e2e in the normal PR gate

## Optional GitHub Secrets

- `SENTRY_AUTH_TOKEN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## Required Runtime Environment Variables

- `NEXT_PUBLIC_FASTAPI_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_APP_SHORT_NAME`
- `NEXT_PUBLIC_APP_DESCRIPTION`
- `NEXT_PUBLIC_APP_THEME_COLOR`
- `NEXT_PUBLIC_APP_BACKGROUND_COLOR`
- `NEXT_PUBLIC_SENTRY_DSN`
- `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE`
- `AUTH_ACCESS_COOKIE_NAME`
- `AUTH_REFRESH_COOKIE_NAME`
- `AUTH_COOKIE_PATH`
- `AUTH_COOKIE_SAME_SITE`
- `AUTH_COOKIE_SECURE`
- `AUTH_ACCESS_TOKEN_MAX_AGE_SECONDS`
- `AUTH_REFRESH_TOKEN_MAX_AGE_SECONDS`
- `SENTRY_DSN`
- `SENTRY_TRACES_SAMPLE_RATE`
- `SENTRY_RELEASE`
- `OPENAPI_SCHEMA_URL`
- `PLAYWRIGHT_BASE_URL`
- `PLAYWRIGHT_WEB_SERVER_URL`

## Environment File Policy

- Commit `.env.example` and `.env.test`
- Use `.env.local` for local development
- Keep deployment-provider secrets and runtime environment variables separate
- Keep Sentry upload credentials in GitHub secrets, not in `.env.example`

## GitHub Actions

- `CI`: env validation, lint, typecheck, unit tests, coverage, build, and e2e
- `dependency-review`: PR dependency risk gate
- `codeql`: default branch and scheduled static security scanning
- `Release`: maintainer-controlled tag/manual GitHub release workflow
- `Preview Example (Vercel)`: optional provider-specific example, not part of default PR validation

## Maintainer Checklist

1. Configure GitHub branch protection or rulesets for `main`.
2. Decide whether you want any provider-specific deployment example enabled at all.
3. If you use Vercel, configure preview/production environments outside PR CI and populate the optional Vercel secrets.
4. Add runtime variables from `.env.example` to your chosen deployment platform.
5. Add Sentry upload credentials to GitHub secrets if release/source-map integration is needed.
6. Enable GitHub Advanced Security features available to the repository.
