# Geliştirme Rehberi

Bu rehber, projeyi yerelde ayağa kaldırmak ve standart geliştirme akışını izlemek için gereken adımları toplar.

## Gereksinimler

- Node.js 20+
- `pnpm` 10+
- erişilebilir bir FastAPI backend

Repo kökünde `.nvmrc` bulunduğu için aynı ana Node sürüm ailesiyle çalışmak gerekir.

## Yerel Kurulum

### 1. Bağımlılıkları yükleyin

```bash
pnpm install
```

### 2. Environment dosyasını oluşturun

```bash
cp .env.example .env.local
pnpm env:check
```

`.env.example`, desteklenen değişkenlerin canonical listesidir. Secret değerleri commit etmeyin; `.env.local` içinde tutun.

### 3. Geliştirme sunucusunu başlatın

```bash
pnpm dev
```

Varsayılan URL'ler:

- app: `http://localhost:3000`
- FastAPI: `http://localhost:8000`

Root route `/`, kullanıcıyı `/dashboard` sayfasına yönlendirir.

## Backend Bağımlılığı

Bu frontend tek başına tam anlamlı çalışmaz. Özellikle şu endpoint aileleri beklenir:

- `/api/v1/admin/auth/login`
- `/api/v1/shared/auth/totp-challenge`
- `/api/v1/shared/auth/refresh`
- `/api/v1/shared/auth/logout`
- `/api/v1/shared/me`
- `/api/v1/admin/users*`
- `/api/v1/admin/roles*`
- `/api/v1/admin/audit-logs*`
- `/api/v1/shared/notifications*`
- `/api/v1/shared/api-keys*`
- `/schema/admin/openapi.json`

Backend erişilemezse:

- auth akışları tamamlanmaz
- admin ekranlarının veri sorguları başarısız olur
- OpenAPI tip üretimi çalışmaz

## Environment Doğrulama

Environment sözleşmesini doğrulamak için:

```bash
pnpm env:check
```

CI-safe mod:

```bash
pnpm env:check -- --ci-safe
```

Bu kontrol URL, sayı, boolean ve cookie policy alanlarını doğrular. `--ci-safe`, branding benzeri bazı zorunlu alanları gevşetir.

## OpenAPI Tip Üretimi

Tipleri backend şemasından yeniden üretmek için:

```bash
pnpm generate:types
```

Üretilen dosya:

- [types/api.generated.ts](/Users/suayip-isik/Documents/Github/next-admin-panel/types/api.generated.ts)

Kaynak URL çözümleme sırası:

1. `OPENAPI_SCHEMA_URL`
2. `NEXT_PUBLIC_FASTAPI_URL + /schema/admin/openapi.json`
3. fallback `http://localhost:8000/schema/admin/openapi.json`

## Testler

### Unit testler

```bash
pnpm test:unit
```

Watch modu:

```bash
pnpm test:watch
```

Coverage:

```bash
pnpm test:coverage
```

Coverage çıktısı `coverage/` altında üretilir.

### E2E testler

```bash
pnpm test:e2e
```

Playwright davranışı:

- test klasörü `tests/e2e`
- output klasörü `test-results/playwright`
- HTML raporu `playwright-report/`
- gerekirse web server olarak `pnpm dev` çalıştırılır
- `PLAYWRIGHT_BASE_URL` ve `PLAYWRIGHT_WEB_SERVER_URL` env değerleri kullanılır

Mevcut e2e kapsamı, auth redirect ve TOTP step geçişine odaklıdır.

## Önerilen Yerel Kalite Hattı

PR açmadan önce tipik akış:

```bash
pnpm env:check
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm build
```

E2E, auth veya route davranışı etkileniyorsa ayrıca çalıştırılmalıdır.

## Dizin Sorumlulukları

- `app/`: route, layout, metadata ve route handler katmanı
- `modules/`: domain bazlı feature kodu
- `shared/`: ortak bileşenler, hook'lar, util'ler
- `lib/`: env, auth, API client ve entegrasyon kodu
- `i18n/`, `messages/`: locale çözümleme ve çeviri mesajları
- `tests/`: unit ve e2e testleri

Sayfa dosyalarına yoğun iş mantığı yığmak yerine ilgili modül veya yardımcı katmana taşımak tercih edilir.

## Next.js ile Çalışırken

Repo Next.js 16 kullanır ve davranışları eski sürüm varsayımlarıyla karıştırmamak gerekir. Framework seviyesinde değişiklik yapmadan önce `node_modules/next/dist/docs/` altındaki ilgili rehberi okuyun.

Bu repo özelinde önemli noktalar:

- App Router kullanılır
- route handler ve metadata route'ları aktif kullanılır
- auth koruması `proxy.ts` üzerinden yapılır
- server/client ayrımı bileşen bazında korunur

## Auth Hata Ayıklama

Auth veya session kaynaklı bir sorun incelerken genelde birlikte bakılması gereken dosyalar:

- [app/api/auth/login/route.ts](/Users/suayip-isik/Documents/Github/next-admin-panel/app/api/auth/login/route.ts)
- [app/api/auth/refresh/route.ts](/Users/suayip-isik/Documents/Github/next-admin-panel/app/api/auth/refresh/route.ts)
- [app/api/auth/logout/route.ts](/Users/suayip-isik/Documents/Github/next-admin-panel/app/api/auth/logout/route.ts)
- [lib/server-auth.ts](/Users/suayip-isik/Documents/Github/next-admin-panel/lib/server-auth.ts)
- [lib/api-client.ts](/Users/suayip-isik/Documents/Github/next-admin-panel/lib/api-client.ts)
- [proxy.ts](/Users/suayip-isik/Documents/Github/next-admin-panel/proxy.ts)
