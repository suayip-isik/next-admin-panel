# Contributing

## Development Baseline

- Node.js 20+
- `pnpm` 10+
- Non-mocked akışlar için erişilebilir bir FastAPI backend
- Provider-agnostic ana repo; deployment entegrasyonları opsiyonel örnek katmandır

## Başlangıç Akışı

- Yeni ürün başlatıyorsanız GitHub `Use this template` akışını kullanın.
- Upstream projeye katkı verecekseniz fork + pull request akışını kullanın.

## Local Setup

```bash
pnpm install
cp .env.example .env.local
pnpm env:check
pnpm dev
```

## PR Öncesi Doğrulama

Minimum önerilen kontrol:

```bash
pnpm env:check
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm build
```

Şu durumlarda ayrıca çalıştırın:

- auth, navigation, protected route veya form akışları değiştiyse `pnpm test:e2e`
- OpenAPI yüzeyi değiştiyse `pnpm generate:types`

## Katkı Kuralları

- Conventional Commit kullanın: `feat:`, `fix:`, `docs:`, `chore:`
- PR açıklamasında kullanıcı etkisini ve doğrulama adımlarını belirtin
- Gerçek secret veya provider kimlik bilgilerini commit etmeyin
- Provider-specific workflow'ları base contributor deneyiminin zorunlu parçası yapmayın

## Repo Yapısı Beklentisi

- route ve layout kodu `app/` altında kalmalı
- domain davranışı mümkün olduğunca `modules/` altında gruplanmalı
- tekrar kullanılabilir UI ve yardımcılar `shared/` ve `lib/` katmanında tutulmalı
- iş mantığı doğrudan page dosyalarına yığılmamalı

## Next.js 16 Notu

Bu repo standart eski Next.js varsayımlarıyla ele alınmamalıdır. Framework düzeyinde değişiklik yapmadan önce `node_modules/next/dist/docs/` altındaki ilgili rehberi okuyun.

Özellikle dikkat edilmesi gerekenler:

- App Router kullanımı
- route handler davranışı
- metadata route'ları
- server/client component ayrımı

## CI/CD Beklentileri

- `main` korumalı ana branch olarak düşünülür
- pull request'lerde `CI` ve `dependency-review` workflow'ları beklenir
- release akışı tag veya maintainer manual dispatch ile yürütülür
- Vercel preview workflow'u örnek amaçlıdır
