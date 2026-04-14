# Next Admin Panel

Next.js 16, React 19 ve FastAPI odaklı backend entegrasyonu için hazırlanmış admin panel template'i. Repo; UI katmanını, auth cookie yönetimini ve Next.js üzerinden çalışan BFF/proxy katmanını birlikte sunar.

Bu proje özellikle şu kullanım için tasarlanmıştır:

- mevcut veya planlanan bir FastAPI backend'in önüne admin arayüzü koymak
- repo'yu `Use this template`, fork veya doğrudan kopya ile yeni ürüne dönüştürmek
- auth token'larını tarayıcı JavaScript'ine açmadan admin panel geliştirmek

Bu repo tek başına tam bir ürün değildir. Anlamlı şekilde çalışabilmesi için beklenen endpoint sözleşmesini sağlayan erişilebilir bir backend gerekir.

## Kim İçin Uygun?

- kendi ürününe uyarlamak için template arayan ekipler
- Next.js tabanlı admin/BFF katmanı isteyen ekipler
- upstream repo'ya katkı vermek isteyen geliştiriciler

Şu senaryolar için uygun değildir:

- backend olmadan tam çalışan bağımsız admin panel beklentisi
- provider-specific deploy kurallarını doğrudan kutudan çıktığı gibi istemek
- auth, RBAC ve veri modeli tamamen farklı bir sistemle sıfır entegrasyon çabası olmadan ilerlemek

## Hızlı Başlangıç

### Gereksinimler

- Node.js 20+
- `pnpm` 10+
- erişilebilir bir FastAPI backend

Repo `.nvmrc` dosyasında Node sürüm ailesini pinler.

### 5 Dakikada Ayağa Kaldır

```bash
pnpm install
cp .env.example .env.local
pnpm env:check
pnpm dev
```

Varsayılan yerel adresler:

- app: `http://127.0.0.1:3000`
- backend: `http://127.0.0.1:8000`

İlk açılışta beklenenler:

- `/` route'u `/dashboard` adresine yönlendirir
- session yoksa korumalı route'lar `/login?from=...` adresine düşer
- backend erişilemiyorsa login ve veri yükleme akışları başarısız olur

## Başlangıç Yolunu Seç

### 1. Bu repo'yu kendi ürününe uyarlayacaksan

Önerilen akış:

1. GitHub üzerinden `Use this template` veya repo kopyası oluştur.
2. `README`, `.env.example` ve branding değerlerini kendi ürününe göre değiştir.
3. `NEXT_PUBLIC_FASTAPI_URL` değerini kendi backend'ine bağla.
4. `pnpm env:check`, `pnpm test:unit` ve `pnpm build` ile temel doğrulamayı yap.
5. Gerekirse OpenAPI tiplerini `pnpm generate:types` ile yeniden üret.

İlk gün okunacak rehber:

- [Başlangıç Rehberi](docs/getting-started.md)
- [Özelleştirme Rehberi](docs/customization.md)
- [Backend Kontratı](docs/backend-contract.md)
- [Environment Rehberi](docs/environment.md)

### 2. Upstream projeye katkı vereceksen

Önerilen akış:

1. Repo'yu fork et.
2. Branch aç.
3. Değişikliği yap.
4. Beklenen kalite komutlarını çalıştır.
5. Pull request aç.

Detaylar için:

- [Contributing](CONTRIBUTING.md)
- [Geliştirme Rehberi](docs/development.md)

## Bu Repo Ne Sağlar?

- e-posta + parola ile giriş
- gerekirse TOTP ikinci adım doğrulaması
- şifre sıfırlama akışları
- dashboard istatistik kartları
- kullanıcı, silinmiş kullanıcı ve kullanıcı detay ekranları
- admin kullanıcı oluşturma, e-posta değiştirme, doğrulama ve davet yeniden gönderme
- rol listeleme, oluşturma, güncelleme ve silme
- audit log listeleme ve detay görüntüleme
- bildirim listeleme, okundu işaretleme ve silme
- API key listeleme, oluşturma ve silme
- profil güncelleme, avatar, parola ve TOTP yönetimi
- Türkçe ve İngilizce arayüz
- `light`, `dark`, `system` tema desteği
- OpenAPI şemasından TypeScript tip üretimi
- Vitest unit testleri ve Playwright e2e testleri
- isteğe bağlı Sentry entegrasyonu

## Bu Repo Tek Başına Ne Yapmaz?

- FastAPI backend'in authorization ve iş kurallarını sağlamaz
- gerçek veri olmadan admin ekranlarını tam işlevli hale getirmez
- deployment platformu secret/TLS/WAF ayarlarını sizin yerinize çözmez
- branch protection, alerting veya rollback operasyonunu otomatik kurmaz

## Route Özeti

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

Sistem route'ları:

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

- `app/` route, layout ve route handler katmanını taşır.
- `modules/` domain bazlı feature kodlarını taşır.
- `shared/` ve `lib/` ortak UI, auth, env ve API yardımcılarını içerir.
- tarayıcı istekleri çoğunlukla `/api/auth/*` ve `/api/v1/*` üzerinden backend'e iletilir.
- `proxy.ts`, auth route'ları ve `/api/*` dışındaki sayfalarda session yoksa kullanıcıyı `/login?from=...` adresine taşır.
- istemci API katmanı `401` durumunda tek refresh isteği paylaşır ve başarılı olursa ilk isteği tekrar dener.

Detaylar için [Mimari Dokümanı](docs/architecture.md).

## Kurulum ve Doğrulama

### Environment

Canonical kaynaklar:

- `.env.example`
- `lib/env.ts`
- `scripts/env-check.mjs`

Önemli değişken aileleri:

- public runtime: `NEXT_PUBLIC_*`
- auth cookie ayarları: `AUTH_*`
- observability: `NEXT_PUBLIC_SENTRY_*`, `SENTRY_*`
- tooling/test: `OPENAPI_SCHEMA_URL`, `PLAYWRIGHT_*`
- deploy fallback: `DEPLOYMENT_URL`, `DEPLOY_ENVIRONMENT`, `VERCEL_*`

Detaylar için [Environment Rehberi](docs/environment.md).

### Scriptler

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

### Önerilen Yerel Kalite Hattı

```bash
pnpm env:check
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm build
```

Şu durumlarda ayrıca çalıştırın:

- auth, navigation, protected route veya form akışları değiştiyse `pnpm test:e2e`
- backend OpenAPI yüzeyi değiştiyse `pnpm generate:types`

## CI/CD Özeti

Repo şu GitHub Actions workflow'larını içerir:

- `CI`: `env-check`, `lint`, `typecheck`, `unit-tests`, `build`, `e2e`
- `dependency-review`: pull request bağımlılık risk kontrolü
- `codeql`: pull request, `main` ve haftalık schedule için statik analiz
- `Release`: tag veya manuel tetikleme ile GitHub Release üretimi
- `Preview Example (Vercel)`: opsiyonel Vercel preview build örneği

Base repo provider-agnostic tutulur. Vercel workflow'u örnek amaçlıdır.

## Hangi Rehberi Ne Zaman Okumalıyım?

- repo'yu ilk kez açtıysan: [docs/getting-started.md](docs/getting-started.md)
- kendi ürününe uyarlıyorsan: [docs/customization.md](docs/customization.md)
- backend'i bağlayacaksan: [docs/backend-contract.md](docs/backend-contract.md)
- env değerleri kafanı karıştırıyorsa: [docs/environment.md](docs/environment.md)
- günlük geliştirme akışı lazımsa: [docs/development.md](docs/development.md)
- auth/proxy yapısını anlaman gerekiyorsa: [docs/architecture.md](docs/architecture.md)
- yetki modeliyle uğraşıyorsan: [docs/rbac.md](docs/rbac.md)
- deploy hazırlığı yapıyorsan: [docs/operations.md](docs/operations.md)
- release gate ve smoke test arıyorsan: [docs/production-readiness.md](docs/production-readiness.md)
- bir şey çalışmıyorsa: [docs/troubleshooting.md](docs/troubleshooting.md)

## Açık Kaynak Meta Dosyaları

- [CONTRIBUTING.md](CONTRIBUTING.md)
- [SECURITY.md](SECURITY.md)
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- [CHANGELOG.md](CHANGELOG.md)
- `.github/ISSUE_TEMPLATE/*`
- `.github/pull_request_template.md`
- `.github/CODEOWNERS`

## Notlar

- Login sayfası, geçerli cookie ve başarılı `/api/v1/shared/me` yanıtı varsa kullanıcıyı tekrar `/dashboard` sayfasına taşır.
- `robots.txt` ve `sitemap.xml`, yalnızca production benzeri ve localhost olmayan ortamlarda indekslemeye izin verecek şekilde üretilir.
- Next.js 16 davranışları eski eğitim verilerindeki Next.js sürümleriyle birebir aynı olmayabilir; framework değişikliği yapmadan önce `node_modules/next/dist/docs/` altındaki ilgili rehberleri okuyun.
