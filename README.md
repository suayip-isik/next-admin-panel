# Next Admin Panel

Next.js 16 ile geliştirilmiş bu proje, FastAPI tabanlı bir backend'e bağlanan modern bir yönetim paneli arayüzüdür. Uygulama; kimlik doğrulama, iki adımlı giriş, kullanıcı ve rol yönetimi, audit log takibi, bildirimler, API key yönetimi ve profil güvenliği gibi tipik admin panel ihtiyaçlarını kapsayan bir temel sunar.

Bu repository hem açık kaynak katkı akışına hem de template olarak yeni ürün başlatma akışına göre düzenlenmiştir.

## İçindekiler

- [Ne Sunar?](#ne-sunar)
- [Template mi Fork mu?](#template-mi-fork-mu)
- [Hızlı Başlangıç](#hızlı-başlangıç)
- [Ortam Değişkenleri](#ortam-değişkenleri)
- [NPM Scriptleri](#npm-scriptleri)
- [CI/CD ve Release](#cicd-ve-release)
- [Open Source Bakım Dosyaları](#open-source-bakım-dosyaları)
- [Detaylı Dokümantasyon](#detaylı-dokümantasyon)

## Ne Sunar?

- Next.js App Router tabanlı admin panel yapısı
- Cookie tabanlı oturum yönetimi
- İki adımlı doğrulama (TOTP) destekli giriş akışı
- FastAPI backend'e BFF/proxy katmanı üzerinden erişim
- React Query ile istemci veri yönetimi
- `next-intl` ile Türkçe ve İngilizce desteği
- Vitest ile unit test, Playwright ile e2e test altyapısı
- OpenAPI şemasından TypeScript tip üretimi
- Provider-agnostic GitHub Actions CI, security ve governance katmanı
- Opsiyonel provider deployment örneği olarak Vercel preview workflow'u

## Template mi Fork mu?

- Yeni bir ürün başlatıyorsanız tercih edilen yol `Use this template`.
- Upstream projeye katkı yapmak istiyorsanız `fork + pull request` akışını kullanın.

Template kullanımının tercih edilme nedeni:

- yeni ürün için temiz bir git geçmişi sağlar
- upstream senkronizasyon karmaşasını azaltır
- ürün tüketicisi ile upstream katkı veren geliştiriciyi ayırır

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
pnpm env:check
```

`pnpm env:init` yardımcı script olarak bulunur, ancak canonical kurulum yolu `.env.example` dosyasını açık şekilde kopyalamaktır.

### 4. Geliştirme sunucusunu başlatın

```bash
pnpm dev
```

Uygulama varsayılan olarak `http://localhost:3000` üzerinde çalışır.

## Ortam Değişkenleri

Bu repo için canonical kaynak `.env.example` dosyasıdır. Lokal geliştirmede gerçek değerleri `.env.local` içinde, deployment sırasında ise kullandığınız hosting platformunun secret/environment store'larında tanımlayın.

Ana başlıklar:

- public runtime değerleri: `NEXT_PUBLIC_*`
- server-only değerler: auth cookie ve server observability anahtarları
- tooling/test değerleri: OpenAPI ve Playwright URL'leri
- opsiyonel platform fallback'leri: `DEPLOYMENT_URL`, `DEPLOY_ENVIRONMENT`, `VERCEL_*`

Detaylı sözleşme için [docs/environment.md](/Users/suayip-isik/Documents/Github/next-admin-panel/docs/environment.md) dosyasına bakın.

## NPM Scriptleri

| Komut                 | Açıklama                                                             |
| --------------------- | -------------------------------------------------------------------- |
| `pnpm dev`            | Geliştirme sunucusunu başlatır                                       |
| `pnpm build`          | Production build alır                                                |
| `pnpm start`          | Production sunucusunu başlatır                                       |
| `pnpm env:init`       | `.env.example` dosyasından `.env.local` oluşturur                    |
| `pnpm env:check`      | Ortam değişkenleri sözleşmesini doğrular                             |
| `pnpm lint`           | ESLint çalıştırır                                                    |
| `pnpm typecheck`      | TypeScript type check çalıştırır                                     |
| `pnpm test`           | `test:unit` alias'ı olarak unit testleri çalıştırır                  |
| `pnpm test:unit`      | Unit testleri çalıştırır                                             |
| `pnpm test:watch`     | Unit testleri watch modunda çalıştırır                               |
| `pnpm test:coverage`  | Coverage raporu üretir                                               |
| `pnpm test:e2e`       | Playwright e2e testlerini çalıştırır                                 |
| `pnpm generate:types` | FastAPI OpenAPI şemasından `types/api.generated.ts` dosyasını üretir |

## CI/CD ve Release

- `CI` workflow'u env validation, lint, typecheck, unit test, coverage, build ve e2e adımlarını otomatik çalıştırır
- `dependency-review` workflow'u PR'lara yeni güvenlik riski taşıyan bağımlılıkların girmesini engeller
- `codeql` workflow'u `main` ve schedule üzerinde statik güvenlik taraması yapar
- `Release` workflow'u yalnızca trusted tag/manual context'te GitHub Release üretir
- `Preview Example (Vercel)` workflow'u opsiyonel provider örneğidir; base contributor CI'nın parçası değildir

Base repo provider-agnostic tutulur. Deployment örnekleri opsiyonel ve ayrı katman olarak düşünülmelidir.

## Open Source Bakım Dosyaları

- `LICENSE`
- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- `SECURITY.md`
- `.github/ISSUE_TEMPLATE/*`
- `.github/pull_request_template.md`
- `.github/CODEOWNERS`

## Detaylı Dokümantasyon

- [Mimari Doküman](docs/architecture.md)
- [Geliştirme Rehberi](docs/development.md)
- [Environment Rehberi](docs/environment.md)
- [Özellikler ve Akışlar](docs/features.md)
- [Operasyon Rehberi](docs/operations.md)

## Notlar

- Repo, standart `create-next-app` şablonundan çıkmış olsa da artık üretim odaklı bir admin panel iskeletidir.
- Proje Next.js 16 kullanır. Framework davranışlarıyla ilgili geliştirme yaparken mevcut repo sürümüne göre hareket edin.
