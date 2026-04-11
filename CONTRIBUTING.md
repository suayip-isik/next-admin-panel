# Contributing

## Development Baseline

- Node.js 20 LTS
- `pnpm`
- reachable FastAPI backend for non-mocked flows
- provider-agnostic base CI/CD; hosting integrations are optional examples, not part of core contributor CI

## Choose the Right Starting Path

- Use GitHub's `Use this template` when you want to start a new product from this boilerplate.
- Use a fork when you want to contribute changes back upstream.

## Local Setup

```bash
pnpm install
cp .env.example .env.local
pnpm env:check
pnpm dev
```

## Validation Before Opening a PR

```bash
pnpm env:check
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm build
pnpm test:e2e
```

## Commit and PR Rules

- Use Conventional Commits such as `feat:`, `fix:`, `chore:`, `docs:`
- Describe user impact and validation steps in the PR template
- Do not make provider secrets or deployment accounts a requirement for public pull-request validation
- Keep provider-specific deployment examples clearly optional and isolated from base CI

## CI/CD Expectations

- `main` is the protected production branch
- pull requests run env validation, lint, typecheck, unit tests, build, dependency review, and e2e checks
- releases are maintainer-controlled from trusted tags or manual dispatches
- provider-specific previews are example-only and must not be required for contributor PRs
