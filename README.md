# Next Admin Panel

Next.js 16 ile geliştirilmiş bu proje, FastAPI tabanlı bir backend'e bağlanan modern bir yönetim paneli arayüzüdür. Uygulama; kimlik doğrulama, iki adımlı giriş, kullanıcı ve rol yönetimi, audit log takibi, bildirimler, API key yönetimi ve profil güvenliği gibi tipik admin panel ihtiyaçlarını kapsayan bir temel sunar.

Bu README, projeyi ilk kez açan bir geliştiricinin kısa sürede sistemi anlaması ve lokal ortamda çalıştırabilmesi için hazırlandı. Daha detaylı teknik dokümanlar için `docs/` klasörüne bakın.

## İçindekiler

- [Ne Sunar?](#ne-sunar)
- [Teknoloji Yığını](#teknoloji-yığını)
- [Hızlı Başlangıç](#hızlı-başlangıç)
- [Ortam Değişkenleri](#ortam-değişkenleri)
- [NPM Scriptleri](#npm-scriptleri)
- [Proje Yapısı](#proje-yapısı)
- [Uygulama Nasıl Çalışır?](#uygulama-nasıl-çalışır)
- [Testler](#testler)
- [Detaylı Dokümantasyon](#detaylı-dokümantasyon)

## Ne Sunar?

- Next.js App Router tabanlı admin panel yapısı
- Cookie tabanlı oturum yönetimi
- İki adımlı doğrulama (TOTP) destekli giriş akışı
- FastAPI backend'e BFF/proxy katmanı üzerinden erişim
- React Query ile istemci veri yönetimi
- `next-intl` ile Türkçe ve İngilizce desteği
- Açık/koyu tema ve sistem teması desteği
- Vitest ile unit test, Playwright ile e2e test altyapısı
- OpenAPI şemasından TypeScript tip üretimi

## Teknoloji Yığını

- `next@16`
- `react@19`
- `tailwindcss@4`
- `@tanstack/react-query`
- `@tanstack/react-table`
- `next-intl`
- `openapi-fetch`
- `react-hook-form`
- `zod`
- `vitest`
- `playwright`

## Hızlı Başlangıç

### 1. Gereksinimler

- Node.js 20+
- `pnpm`
- Lokal veya erişilebilir bir FastAPI backend servisi

### 2. Bağımlılıkları kurun

```bash
pnpm install
```

### 3. Ortam değişkenlerini hazırlayın

```bash
cp .env.example .env.local
```

`.env.local` dosyasındaki değerleri kendi ortamınıza göre güncelleyin.

### 4. Geliştirme sunucusunu başlatın

```bash
pnpm dev
```

Uygulama varsayılan olarak `http://localhost:3000` üzerinde çalışır.

## Ortam Değişkenleri

| Değişken                  | Açıklama                                                                                             | Örnek                   |
| ------------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------- |
| `NEXT_PUBLIC_FASTAPI_URL` | FastAPI backend taban URL'si. BFF route'ları ve istemci istekleri bu servise bağlanır.               | `http://localhost:8000` |
| `NEXT_PUBLIC_APP_URL`     | Next.js uygulamasının public URL'si. Mutlak yönlendirme veya dış entegrasyonlar için kullanılabilir. | `http://localhost:3000` |

## NPM Scriptleri

| Komut                 | Açıklama                                                             |
| --------------------- | -------------------------------------------------------------------- |
| `pnpm dev`            | Geliştirme sunucusunu başlatır                                       |
| `pnpm build`          | Production build alır                                                |
| `pnpm start`          | Production sunucusunu başlatır                                       |
| `pnpm lint`           | ESLint çalıştırır                                                    |
| `pnpm test`           | Unit testleri çalıştırır                                             |
| `pnpm test:watch`     | Unit testleri watch modunda çalıştırır                               |
| `pnpm test:coverage`  | Coverage raporu üretir                                               |
| `pnpm test:e2e`       | Playwright e2e testlerini çalıştırır                                 |
| `pnpm generate:types` | FastAPI OpenAPI şemasından `types/api.generated.ts` dosyasını üretir |

`pnpm generate:types` komutu için backend servisinin `http://localhost:8000/schema/admin/openapi.json` endpoint'ini erişilebilir şekilde sunması gerekir.

## Proje Yapısı

```text
.
|-- app/           # Route tanımları, sayfalar ve API route'ları
|-- docs/          # Detaylı teknik dokümantasyon
|-- i18n/          # Locale çözümleme ve next-intl yapılandırması
|-- lib/           # Sunucu tarafı auth/proxy yardımcıları ve ortak kütüphaneler
|-- messages/      # Çeviri dosyaları
|-- modules/       # Domain bazlı modüller
|-- shared/        # Paylaşılan UI bileşenleri, hook'lar ve yardımcılar
|-- tests/         # Unit ve e2e testleri
|-- types/         # Üretilmiş API tipleri
`-- proxy.ts       # Route koruma ve yönlendirme mantığı
```

Klasörlerin sorumlulukları:

- `app/`: App Router sayfaları, layout'lar ve `/api/*` route handler'ları
- `modules/`: Kullanıcılar, roller, profil, bildirimler gibi iş alanı bazlı bileşenler
- `shared/`: UI primitive'leri, layout parçaları, yardımcı hook ve util'ler
- `lib/`: Auth cookie yönetimi, FastAPI forward/proxy işlemleri, API client yardımcıları
- `tests/`: Vitest unit testleri ve Playwright senaryoları

## Uygulama Nasıl Çalışır?

### Route yapısı

- `app/(auth)`: login, forgot-password, reset-password ve TOTP akışları
- `app/(admin)`: dashboard, users, roles, notifications, audit-logs, api-keys, profile gibi korumalı sayfalar
- `app/api/auth/*`: login, logout, refresh ve TOTP doğrulama gibi auth işlemleri
- `app/api/v1/[...path]`: FastAPI backend'e proxy görevi gören genel API geçidi

### Kimlik doğrulama akışı

1. Kullanıcı giriş ekranından kimlik bilgilerini gönderir.
2. Next.js tarafındaki auth route'u isteği FastAPI'ye iletir.
3. Başarılı yanıtta access ve refresh token'lar HTTP-only cookie olarak saklanır.
4. Bazı kullanıcılar için login yanıtı `requires_totp` dönebilir; bu durumda kullanıcı `/totp` adımına yönlenir.
5. Korunan route'lar `proxy.ts` içinde cookie kontrolü ile korunur; oturum yoksa kullanıcı `/login` sayfasına yönlendirilir.

### Backend entegrasyonu

- Tarayıcı tarafındaki istekler ağırlıklı olarak Next.js içindeki `/api/v1/*` route'larına yapılır.
- Bu route'lar access token'ı cookie'den alır ve FastAPI'ye server-side forward eder.
- İstemci tarafındaki API client, `401` yanıtı aldığında `/api/auth/refresh` üzerinden token yenilemeyi dener.
- Yenileme başarısız olursa kullanıcı yeniden giriş akışına gönderilir.

### Locale ve tema

- Desteklenen diller: `en`, `tr`
- Locale bilgisi `NEXT_LOCALE` cookie'sinde tutulur
- Tema tercihi istemci tarafında `localStorage` üzerinde saklanır
- Kök layout; `next-intl`, React Query, tema sağlayıcısı ve toast altyapısını birlikte kurar

## Testler

### Unit testler

```bash
pnpm test
```

Vitest yapılandırması `jsdom` ortamı kullanır. Coverage eşikleri:

- Satır: `%80`
- Fonksiyon: `%80`
- Branch: `%70`

### E2E testler

```bash
pnpm test:e2e
```

Playwright testleri varsayılan olarak `pnpm dev` ile uygulamayı ayağa kaldırır ve `http://localhost:3000` üzerinden çalışır.

## Detaylı Dokümantasyon

- [Mimari Doküman](docs/architecture.md)
- [Geliştirme Rehberi](docs/development.md)
- [Özellikler ve Akışlar](docs/features.md)

## Notlar

- Repo, standart `create-next-app` şablonundan çıkmış olsa da artık üretim odaklı bir admin panel iskeletidir; README buna göre özelleştirilmiştir.
- Proje Next.js 16 kullanır. Framework davranışlarıyla ilgili geliştirme yaparken mevcut repo sürümüne göre hareket edin.
