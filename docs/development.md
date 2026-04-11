# Geliştirme Rehberi

Bu rehber, projeyi lokal ortamda ayağa kaldırmak ve geliştirirken izlenecek temel akışı özetler.

## Gereksinimler

- Node.js 20 veya üzeri
- `pnpm`
- Çalışan bir FastAPI backend servisi
- Base repository için herhangi bir hosting hesabı zorunlu değildir

## Kurulum

### 1. Bağımlılıkları yükleyin

```bash
pnpm install
```

### 2. Ortam değişkenlerini oluşturun

```bash
cp .env.example .env.local
pnpm env:check
```

Varsayılan örnek değerler:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=Next Admin Panel
AUTH_ACCESS_COOKIE_NAME=access_token
OPENAPI_SCHEMA_URL=http://localhost:8000/schema/admin/openapi.json
PLAYWRIGHT_BASE_URL=http://localhost:3000
```

`.env.example` desteklenen tüm anahtarların canonical listesidir. Secret veya ortam özel değerleri `.env.local` içinde tutun.

## Geliştirme Sunucusu

```bash
pnpm dev
```

Uygulama varsayılan olarak `http://localhost:3000` üzerinde açılır.

Ana giriş route'u `/` olsa da uygulama kullanıcıyı `/dashboard` sayfasına yönlendirir.

## Backend Bağımlılığı

Bu frontend tek başına anlamlı çalışmaz; auth ve veri endpoint'leri için FastAPI servisine ihtiyaç duyar.

Beklenen kritik endpoint örnekleri:

- auth login/refresh/logout uçları
- `/api/v1/shared/me`
- OpenAPI şema endpoint'i: `/schema/admin/openapi.json`

Backend çalışmıyorsa:

- login akışı tamamlanmaz
- korumalı sayfalarda veri yüklenmez
- tip üretim komutu başarısız olur

## OpenAPI Tip Üretimi

Backend şemasından TypeScript tipleri üretmek için:

```bash
pnpm generate:types
```

Bu komut şu dosyayı günceller:

- `types/api.generated.ts`

Komut önce `OPENAPI_SCHEMA_URL` değerini okur. Bu değişken tanımlı değilse `NEXT_PUBLIC_FASTAPI_URL + /schema/admin/openapi.json` fallback'i kullanılır.

## Test Çalıştırma

### Unit testler

```bash
pnpm test:unit
```

İzleme modu:

```bash
pnpm test:watch
```

Coverage:

```bash
pnpm test:coverage
```

Coverage raporları `coverage/` altında üretilir.

### E2E testler

```bash
pnpm test:e2e
```

Playwright yapılandırması:

- testleri `tests/e2e` klasöründen okur
- gerekirse `pnpm dev` ile lokal sunucuyu ayağa kaldırır
- varsayılan base URL olarak `PLAYWRIGHT_BASE_URL` kullanır
- HTML raporunu `playwright-report/`, artefaktları `test-results/` altında üretir

Farklı bir URL üzerinde test koşmak için `PLAYWRIGHT_BASE_URL` ve gerekirse `PLAYWRIGHT_WEB_SERVER_URL` tanımlanabilir.

## CI/CD ve Deployment

- GitHub Actions kalite hattı önce `pnpm env:check -- --ci-safe` çalıştırır
- ardından `pnpm lint`, `pnpm typecheck`, `pnpm test:unit`, `pnpm test:coverage`, `pnpm build` ve `pnpm test:e2e` komutları çalışır
- `main` production branch'tir
- provider-specific deployment örnekleri base contributor CI'dan ayrıdır
- resmi release akışı trusted tag veya manual dispatch ile çalışır
- Docker, Kubernetes, Helm ve benzeri deployment stratejileri bu repository kapsamında base davranış değildir

## Dizinler Arasında Çalışma Kuralı

Geliştirme yaparken şu sorumluluk ayrımını koruyun:

- `app/`: route tanımları ve sayfa kabuğu
- `modules/`: feature veya domain bazlı uygulama kodu
- `shared/`: tekrar kullanılabilir bileşenler ve ortak hook/util'ler
- `lib/`: framework veya entegrasyon seviyesindeki yardımcılar
- `i18n/` ve `messages/`: locale altyapısı ve metinler

Sayfa dosyalarına iş mantığını yığmak yerine bunu ilgili modül veya yardımcı katmana taşımak tercih edilmelidir.

## Auth Akışıyla Çalışırken

Auth sistemi cookie tabanlıdır. Geliştirme sırasında şu noktalar önemlidir:

- token'lar `httpOnly` cookie olarak yazılır
- cookie adı, `path`, `sameSite`, `secure` ve TTL değerleri `.env` ile override edilebilir
- route koruması `proxy.ts` ile yapılır
- `/api/v1/*` çağrıları Next.js üzerinden FastAPI'ye iletilir
- istemci tarafı `401` sonrasında refresh dener
- refresh sonrası retry mekanizması body taşıyan mutation isteklerini de yeniden gönderebilir

Bu nedenle auth ile ilgili sorunları ayıklarken sadece form bileşenine değil şu katmanlara birlikte bakmak gerekir:

- `app/api/auth/*`
- `lib/server-auth.ts`
- `lib/api-client.ts`
- `proxy.ts`

## i18n ve Tema ile Çalışırken

- Desteklenen locale'ler: `en`, `tr`
- Varsayılan locale: `en`
- Locale tercihi cookie ile saklanır
- Tema tercihi `localStorage` ile saklanır

Yeni UI eklerken metinleri mümkün olduğunca çeviri dosyalarına taşıyın ve bileşenleri mevcut tema davranışıyla uyumlu kurun.
