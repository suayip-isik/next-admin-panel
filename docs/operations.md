# Operations Guide

## Deployment Model

Repo provider-agnostic bir temel sunar. CI, güvenlik ve release akışları GitHub Actions ile tanımlıdır; provider özel deployment örnekleri ayrı katman olarak tutulur.

## Çalışan Workflow'lar

### `CI`

`.github/workflows/ci.yml` içindeki job'lar:

- `env-check`
- `lint`
- `typecheck`
- `unit-tests`
- `build`
- `e2e`

CI job'ları ortak olarak:

- `.nvmrc` üzerinden Node sürümünü kullanır
- `pnpm@10.29.3` aktive eder
- bağımlılıkları `pnpm install --frozen-lockfile` ile yükler

### Diğer workflow'lar

- `dependency-review`: PR bağımlılık risk kapısı
- `codeql`: `main` ve haftalık tarama
- `Release`: tag veya manual dispatch ile GitHub Release üretimi
- `Preview Example (Vercel)`: manuel tetiklenen Vercel preview build örneği

## Branch Protection Önerisi

`main` için önerilen korumalar:

- merge öncesi pull request zorunlu
- en az 1 onay
- yeni commit gelince stale approval temizleme
- çözülmemiş conversation bırakmama
- force push kapalı
- branch deletion kapalı

Önerilen required checks:

- `env-check`
- `lint`
- `typecheck`
- `unit-tests`
- `build`
- `dependency-review`
- `e2e` gerektiğinde zorunlu gate olarak

## Runtime Environment

### Fiilen gerekli alanlar

- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_APP_SHORT_NAME`
- production deploy için doğru `NEXT_PUBLIC_APP_URL`
- backend erişimi için doğru `NEXT_PUBLIC_FASTAPI_URL`

### Güçlü şekilde önerilen alanlar

- `NEXT_PUBLIC_APP_DESCRIPTION`
- `NEXT_PUBLIC_APP_THEME_COLOR`
- `NEXT_PUBLIC_APP_BACKGROUND_COLOR`
- auth cookie policy alanları
- `PLAYWRIGHT_BASE_URL`
- `PLAYWRIGHT_WEB_SERVER_URL`

### Opsiyonel alanlar

- `NEXT_PUBLIC_SENTRY_DSN`
- `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE`
- `SENTRY_DSN`
- `SENTRY_TRACES_SAMPLE_RATE`
- `SENTRY_AUTH_TOKEN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `SENTRY_RELEASE`
- `OPENAPI_SCHEMA_URL`
- `DEPLOYMENT_URL`
- `DEPLOY_ENVIRONMENT`
- `VERCEL_*`

## Health, Robots ve Sitemap

- `/api/health` no-store JSON health endpoint'idir.
- `robots.txt` ve `sitemap.xml`, yalnızca deploy environment production benzeri ve `NEXT_PUBLIC_APP_URL` localhost değilse indexing açar.
- Bu nedenle preview veya local ortamlarda tüm rota setinin indekslenmesi beklenmez.

## Sentry İşletim Notları

- Sentry client/server init dosyaları repo içinde hazırdır.
- Runtime DSN verilmezse izleme pasif kalabilir.
- Build-time source map upload yalnızca `SENTRY_AUTH_TOKEN`, `SENTRY_ORG` ve `SENTRY_PROJECT` sağlandığında anlamlıdır.

## GitHub Secrets

Yalnızca ilgili entegrasyonlar kullanılıyorsa gerekir:

- `SENTRY_AUTH_TOKEN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## Maintainer Checklist

1. `main` için branch protection/ruleset kur.
2. Deployment platformunda runtime env değerlerini `.env.example` ve `lib/env.ts` ile eşleştir.
3. Gerekliyse Sentry runtime ve build secret'larını ekle.
4. Vercel preview örneği kullanılacaksa ilgili secret'ları tanımla.
5. Release süreci için semver tag politikası uygula.
