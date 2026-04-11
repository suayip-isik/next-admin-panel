# Next Admin Panel

Next.js 16, React 19 ve FastAPI odaklı bir backend entegrasyonu için hazırlanmış admin panel temelidir. Uygulama App Router kullanır, auth token'larını `httpOnly` cookie'lerde tutar ve tarayıcı isteklerini Next.js route handler/proxy katmanı üzerinden backend'e iletir.

## Ne Var?

- E-posta + parola ile giriş
- Gerekirse TOTP ikinci adım doğrulaması
- Şifre sıfırlama akışları
- Dashboard üzerinde kullanıcı istatistik kartları
- Kullanıcı, silinmiş kullanıcı ve kullanıcı detay ekranları
- Admin kullanıcı oluşturma, e-posta değişikliği, doğrulama ve davet yeniden gönderme
- Rol listeleme, oluşturma, güncelleme ve silme
- Audit log listeleme, stream tabanlı `Load more` ve detay görüntüleme
- Bildirim listeleme, okunma ve silme işlemleri
- API key listeleme, oluşturma ve silme
- Profil güncelleme, avatar yönetimi, parola değiştirme, TOTP yönetimi ve backup code yenileme
- Türkçe ve İngilizce arayüz
- Tema desteği: `light`, `dark`, `system`
- OpenAPI şemasından TypeScript tip üretimi
- Vitest unit testleri ve Playwright e2e testleri
- İsteğe bağlı Sentry entegrasyonu

## Teknoloji Özeti

- `next@16.2.2`
- `react@19.2.4`
- `typescript@5`
- `@tanstack/react-query`
- `next-intl`
- `openapi-fetch` + `openapi-typescript`
- `vitest` + `@testing-library/*`
- `playwright`

## Route Yapısı

Auth ekranları:

- `/login`
- `/totp`
- `/forgot-password`
- `/reset-password`

Admin ekranları:

- `/dashboard`
- `/users`
- `/users/deleted`
- `/users/[id]`
- `/roles`
- `/roles/[id]`
- `/notifications`
- `/audit-logs`
- `/api-keys`
- `/profile`
- `/profile/security`

API ve sistem route'ları:

- `/api/auth/login`
- `/api/auth/totp`
- `/api/auth/refresh`
- `/api/auth/logout`
- `/api/v1/*`
- `/api/health`
- `/manifest.webmanifest`
- `/robots.txt`
- `/sitemap.xml`
- `/unauthorized`

## Mimari Özeti

- UI, Next.js App Router ile `app/` altında tanımlıdır.
- Domain mantığı `modules/` altında gruplanır.
- Tekrarlı UI ve yardımcılar `shared/` ve `lib/` altında tutulur.
- Tarayıcı backend'e doğrudan değil, çoğunlukla `/api/auth/*` ve `/api/v1/*` üzerinden gider.
- `proxy.ts`, auth route'ları ve `/api/*` dışındaki sayfalarda access token cookie'si yoksa kullanıcıyı `/login?from=...` adresine yönlendirir.
- İstemci API katmanı `401` durumunda tek bir refresh isteği paylaşır ve başarılı olursa ilk isteği tekrar dener.

Detaylar için:

- [Mimari](docs/architecture.md)
- [Özellikler](docs/features.md)
- [Geliştirme](docs/development.md)
- [Environment](docs/environment.md)
- [Operasyonlar](docs/operations.md)

## Hızlı Başlangıç

### Gereksinimler

- Node.js 20+
- `pnpm` 10+
- Erişilebilir bir FastAPI backend

Repo `.nvmrc` dosyasında Node sürümünü pinler.

### Kurulum

```bash
pnpm install
cp .env.example .env.local
pnpm env:check
pnpm dev
```

Varsayılan uygulama adresi `http://localhost:3000`, varsayılan backend adresi `http://localhost:8000` olur.

## Environment

Canonical sözleşme şu dosyalardadır:

- [.env.example](/Users/suayip-isik/Documents/Github/next-admin-panel/.env.example)
- [lib/env.ts](/Users/suayip-isik/Documents/Github/next-admin-panel/lib/env.ts)
- [scripts/env-check.mjs](/Users/suayip-isik/Documents/Github/next-admin-panel/scripts/env-check.mjs)

Başlıca değişken aileleri:

- public runtime: `NEXT_PUBLIC_*`
- auth cookie ayarları: `AUTH_*`
- observability: `NEXT_PUBLIC_SENTRY_*`, `SENTRY_*`
- tooling/test: `OPENAPI_SCHEMA_URL`, `PLAYWRIGHT_*`
- platform fallback: `DEPLOYMENT_URL`, `DEPLOY_ENVIRONMENT`, `VERCEL_*`

Detaylar için [docs/environment.md](docs/environment.md).

## Scriptler

| Komut                 | Açıklama                                           |
| --------------------- | -------------------------------------------------- |
| `pnpm dev`            | Geliştirme sunucusunu başlatır                     |
| `pnpm build`          | Production build alır                              |
| `pnpm start`          | Production sunucusunu başlatır                     |
| `pnpm env:init`       | `.env.example` tabanlı `.env.local` oluşturur      |
| `pnpm env:check`      | Environment sözleşmesini doğrular                  |
| `pnpm lint`           | ESLint çalıştırır                                  |
| `pnpm typecheck`      | TypeScript type check çalıştırır                   |
| `pnpm test`           | `pnpm test:unit` alias'ıdır                        |
| `pnpm test:unit`      | Unit testleri çalıştırır                           |
| `pnpm test:watch`     | Vitest watch modunu başlatır                       |
| `pnpm test:coverage`  | Coverage raporu üretir                             |
| `pnpm test:e2e`       | Playwright e2e testlerini çalıştırır               |
| `pnpm generate:types` | OpenAPI şemasından `types/api.generated.ts` üretir |

## CI/CD

Repo şu GitHub Actions workflow'larını içerir:

- `CI`: `env-check`, `lint`, `typecheck`, `unit-tests`, `build`, `e2e`
- `dependency-review`: pull request bağımlılık risk kontrolü
- `codeql`: `main` ve haftalık schedule için statik analiz
- `Release`: tag veya manuel tetikleme ile GitHub Release üretimi
- `Preview Example (Vercel)`: opsiyonel Vercel preview build örneği

Base repo provider-agnostic tutulur. Vercel workflow'u örnek katmandır; contributor PR kalite hattının zorunlu parçası değildir.

## Test ve Kalite

Unit testler:

```bash
pnpm test:unit
```

E2E testler:

```bash
pnpm test:e2e
```

Önerilen yerel kalite hattı:

```bash
pnpm env:check
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm build
```

## Açık Kaynak Dosyaları

- [CONTRIBUTING.md](CONTRIBUTING.md)
- [SECURITY.md](SECURITY.md)
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- [CHANGELOG.md](CHANGELOG.md)
- `.github/ISSUE_TEMPLATE/*`
- `.github/pull_request_template.md`
- `.github/CODEOWNERS`

## Notlar

- Root route `/`, doğrudan `/dashboard` adresine yönlendirir.
- Login sayfası, geçerli cookie ve başarılı `/api/v1/shared/me` yanıtı varsa kullanıcıyı tekrar `/dashboard` sayfasına taşır.
- `robots.txt` ve `sitemap.xml`, yalnızca production benzeri ve localhost olmayan ortamlarda indekslemeye izin verecek şekilde üretilir.
- Next.js sürüm ailesi standart eğitim verilerinden farklı davranışlar içerebilir; framework değişikliği yaparken `node_modules/next/dist/docs/` altındaki güncel rehberleri referans alın.
