# Production Readiness

Bu repo, provider-agnostic bir Next.js admin frontend/BFF katmanı olarak production deploy hedefiyle hazırlanmıştır. Bu doküman, repo içinde garanti edilen readiness seviyesini ve operatörün ayrıca doğrulaması gereken dış bağımlılıkları netleştirir.

## Bu Repo Ne Garanti Eder?

- `next build` ve `next start` ile çalışan tek-process Node deploy modeli
- runtime tarafından import edilen bağımlılıkların production install içinde bulunması
- auth cookie, CSP ve temel security header sözleşmesi
- env sözleşmesi ve production güvenlik invariant'larının otomatik doğrulanması
- kritik akışlar için unit + e2e kalite hattı
- provider-agnostic release ve operasyon checklist'i

## Bu Repo Ne Garanti Etmez?

- FastAPI backend'in authorization, rate limiting ve veri bütünlüğü davranışı
- deployment platformunun secret yönetimi, TLS sonlandırması veya WAF/rate-limit politikaları
- GitHub repository settings seviyesindeki branch protection ve required checks
- merkezi loglama, alerting ve incident response süreçlerinin işletilmesi

## Release Gate

Production release adayı kabul etmek için aşağıdaki hattın tamamı yeşil olmalıdır:

```bash
pnpm env:check
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm test:coverage
pnpm build
pnpm test:e2e
```

## First Launch Checklist

1. `NEXT_PUBLIC_APP_URL` production HTTPS URL ile set edildi.
2. `NEXT_PUBLIC_FASTAPI_URL` doğru backend origin'ini gösteriyor.
3. `AUTH_COOKIE_SECURE=true` ve gerekiyorsa `AUTH_COOKIE_SAME_SITE` production ihtiyacına göre ayarlandı.
4. Sentry kullanılacaksa runtime DSN'ler set edildi; source map upload için `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` birlikte tanımlandı.
5. `main` branch protection ve required checks etkin.
6. Preview veya staging deploy üzerinde smoke test tamamlandı.

## Post-Deploy Smoke Test

1. `/login` üzerinden giriş yapılabiliyor.
2. Session yokken `/dashboard` ve `/users` login'e yönleniyor.
3. Giriş sonrası kullanıcı dashboard'a ulaşıyor.
4. `/users` ekranı veri yükleyebiliyor ve en az bir mutation başarılı.
5. Çıkış sonrası korumalı route'lar tekrar login'e yönleniyor.
6. `/api/health` 200 dönüyor.
7. Production ortamında `robots.txt` ve `sitemap.xml` beklenen davranışı gösteriyor.

## Rollback Minimumu

- Release'ler semver tag veya immutable build artifact ile yayınlanmalı.
- Rollback için en az bir önceki doğrulanmış tag/build yeniden deploy edilebilir olmalı.
- Sentry release veya benzeri gözlem anahtarları deploy sürümüyle eşlenmeli.
