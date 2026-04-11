# Environment Guide

## Source of Truth

Environment sözleşmesi üç yerde tanımlıdır:

1. [.env.example](/Users/suayip-isik/Documents/Github/next-admin-panel/.env.example)
2. [lib/env.ts](/Users/suayip-isik/Documents/Github/next-admin-panel/lib/env.ts)
3. [scripts/env-check.mjs](/Users/suayip-isik/Documents/Github/next-admin-panel/scripts/env-check.mjs)

`pnpm env:init` yalnızca yardımcı script'tir. Canonical kurulum yolu `.env.example` dosyasını kopyalayıp gerçek değerleri açıkça doldurmaktır.

## Yerel Kurulum

```bash
cp .env.example .env.local
pnpm env:check
pnpm dev
```

Varsayılan yerel değerler:

- `NEXT_PUBLIC_APP_URL=http://localhost:3000`
- `NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000`
- `OPENAPI_SCHEMA_URL=http://localhost:8000/schema/admin/openapi.json`
- `PLAYWRIGHT_BASE_URL=http://localhost:3000`
- `PLAYWRIGHT_WEB_SERVER_URL=http://localhost:3000`

## Public ve Server-only Alanlar

### Public

`NEXT_PUBLIC_` ile başlayan değişkenler client bundle'a girer.

Bu repo için başlıca public alanlar:

- uygulama URL ve branding bilgileri
- tema ve arka plan renkleri
- istemci Sentry DSN ve trace rate

### Server-only

Prefix'siz alanlar server tarafında kullanılır.

Başlıca örnekler:

- auth cookie isimleri ve policy ayarları
- server Sentry DSN ve build upload bilgileri
- OpenAPI schema override URL'i
- Playwright base/web server URL ayarları

## Değişken Grupları

### Uygulama URL ve branding

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_FASTAPI_URL`
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_APP_SHORT_NAME`
- `NEXT_PUBLIC_APP_DESCRIPTION`
- `NEXT_PUBLIC_APP_THEME_COLOR`
- `NEXT_PUBLIC_APP_BACKGROUND_COLOR`

### Auth cookie ayarları

- `AUTH_ACCESS_COOKIE_NAME`
- `AUTH_REFRESH_COOKIE_NAME`
- `AUTH_COOKIE_PATH`
- `AUTH_COOKIE_SAME_SITE`
- `AUTH_COOKIE_SECURE`
- `AUTH_ACCESS_TOKEN_MAX_AGE_SECONDS`
- `AUTH_REFRESH_TOKEN_MAX_AGE_SECONDS`

### Observability

- `NEXT_PUBLIC_SENTRY_DSN`
- `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE`
- `SENTRY_DSN`
- `SENTRY_TRACES_SAMPLE_RATE`
- `SENTRY_AUTH_TOKEN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `SENTRY_RELEASE`

### Tooling ve test

- `OPENAPI_SCHEMA_URL`
- `PLAYWRIGHT_BASE_URL`
- `PLAYWRIGHT_WEB_SERVER_URL`

## Fallback Davranışları

### App URL

Çözümleme sırası:

1. `NEXT_PUBLIC_APP_URL`
2. `DEPLOYMENT_URL`
3. `https://${VERCEL_URL}`
4. fallback `http://localhost:3000`

### FastAPI URL

Çözümleme sırası:

1. `NEXT_PUBLIC_FASTAPI_URL`
2. fallback `http://localhost:8000`

### OpenAPI schema URL

Çözümleme sırası:

1. `OPENAPI_SCHEMA_URL`
2. `${NEXT_PUBLIC_FASTAPI_URL}/schema/admin/openapi.json`

### Deploy environment

Çözümleme sırası:

1. `DEPLOY_ENVIRONMENT`
2. `VERCEL_ENV`
3. `NODE_ENV`
4. fallback `development`

### Sentry release

Çözümleme sırası:

1. `SENTRY_RELEASE`
2. `VERCEL_GIT_COMMIT_SHA`

## Zorunlu ve Opsiyonel Alanlar

Pratikte tüm alanlar aynı sertlikte zorunlu değildir.

Yerel geliştirme için fiilen gerekli olanlar:

- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_APP_SHORT_NAME`

Diğer birçok alan güvenli fallback ile çalışır. Sentry değişkenleri ve build upload alanları opsiyoneldir.

## Validation

Standart doğrulama:

```bash
pnpm env:check
```

CI-safe doğrulama:

```bash
pnpm env:check -- --ci-safe
```

Doğrulanan başlıklar:

- URL biçimi
- sayısal alanlar
- boolean alanlar
- `AUTH_COOKIE_SAME_SITE` değerleri

`--ci-safe`, branding alanlarından bazılarını zorunlu tutmadan kontrol yapar.

## Template Tüketicileri ve Katkı Verenler

- Template tüketicileri ilk production deploy'dan önce branding, URL ve observability değerlerini değiştirmelidir.
- Katkı verenler `.env.local` dosyasını yerel tutmalı ve gerçek secret commit etmemelidir.
- `.env.example` ve `.env.test` commit edilir; `.env.local` edilmez.
