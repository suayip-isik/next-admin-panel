# Özelleştirme Rehberi

Bu belgeyi repo'yu kendi ürününüze dönüştürürken, ilk branding ve ortam ayarlarını yaparken okuyun.

## Amaç

Bu repo, temel admin panel yapısını verir; ancak ilk production deploy'dan önce placeholder değerlerin sizin ürününüze göre değiştirilmesi gerekir. Bu rehber, hangi alanların ilk gün değişmesi beklendiğini karar bırakmadan listeler.

## İlk Gün Değiştirmeniz Gerekenler

### Branding ve uygulama kimliği

`.env.local` veya deployment environment'ında şu alanları güncelleyin:

- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_APP_SHORT_NAME`
- `NEXT_PUBLIC_APP_DESCRIPTION`
- `NEXT_PUBLIC_APP_THEME_COLOR`
- `NEXT_PUBLIC_APP_BACKGROUND_COLOR`

Bu alanlar şu yüzeyleri etkiler:

- uygulama başlığı ve metadata
- PWA manifest alanları
- bazı SEO ve tarayıcı UI meta değerleri

### Uygulama ve backend URL'leri

Değiştirilmesi gereken minimum alanlar:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_FASTAPI_URL`

Gerekirse ayrıca:

- `OPENAPI_SCHEMA_URL`

Kural:

- yerelde `NEXT_PUBLIC_APP_URL` genelde `http://127.0.0.1:3000`
- production'da `NEXT_PUBLIC_APP_URL` mutlaka HTTPS olmalı
- backend schema yolu standart değilse `OPENAPI_SCHEMA_URL` açıkça set edilmeli

### Cookie güvenlik ayarları

Production'da mutlaka gözden geçirin:

- `AUTH_COOKIE_SECURE=true`
- `AUTH_COOKIE_SAME_SITE`
- `AUTH_ACCESS_COOKIE_NAME`
- `AUTH_REFRESH_COOKIE_NAME`

Önemli invariant:

- `AUTH_COOKIE_SAME_SITE=none` ise `AUTH_COOKIE_SECURE=true` zorunludur

### Observability

Sentry kullanacaksanız:

- `NEXT_PUBLIC_SENTRY_DSN`
- `SENTRY_DSN`
- `SENTRY_AUTH_TOKEN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `SENTRY_RELEASE`

Sentry kullanmayacaksanız bu alanları boş bırakabilirsiniz.

## Template Tüketicisi İçin Net Başlangıç Sırası

1. `.env.example` içindeki varsayılan markalama değerlerini kendi ürününüz için yeniden belirleyin.
2. `.env.local` içinde gerçek URL'leri set edin.
3. deploy ortamında aynı anahtarları platform secret/env ayarlarına taşıyın.
4. `pnpm env:check` ile sözleşmeyi doğrulayın.
5. build öncesi `pnpm build` çalıştırın.

## Genellikle Korunması Gereken Teknik Yapılar

Kendi ürününüze uyarlarken aşağıdaki iskeleti korumak genelde doğru olur:

- `/api/auth/*` route handler yapısı
- `/api/v1/*` proxy katmanı
- `httpOnly` cookie tabanlı token yaklaşımı
- `lib/api-client.ts` içindeki refresh + retry mantığı
- OpenAPI'den tip üretme akışı

Bu parçalar, UI'yı backend'den tamamen koparmadan güvenli ve yönetilebilir bir frontend/BFF modeli sağlar.

## Ürüne Göre Uyumlandırılabilecek Alanlar

- uygulama adı ve açıklaması
- renkler, logo ve görsel kimlik
- rota seti ve sidebar yapısı
- modül kapsamı
- backend endpoint ayrıntıları
- RBAC görünürlük politikaları
- Sentry ve deploy entegrasyonları

## Kopya Aldıktan Sonra Gözden Geçirilecek Placeholder İçerikler

- `README.md` içindeki ürün açıklaması
- `.env.example` içindeki örnek app adı ve açıklaması
- release/tag politikasıyla ilgili repo açıklamaları
- deploy örneği olarak duran provider-specific notlar

## Upstream'den Ayrışma Notu

Bu repo'yu doğrudan kopyaladıysanız, zamanla şu iki yoldan birini seçmeniz gerekir:

- upstream'den tamamen ayrılmak
- upstream değişikliklerini belirli aralıklarla takip etmek

Upstream takibi planlıyorsanız:

- auth/proxy/env sözleşmesini gereksiz yere parçalamayın
- OpenAPI ve route yapısını çok geniş dosya taşıma operasyonlarıyla dağınık hale getirmeyin
- katkı verecek başka ekipler varsa `CONTRIBUTING.md`'yi kendi çalışma şeklinize göre güncelleyin

## İlgili Belgeler

- ilk kurulum için: [Başlangıç Rehberi](getting-started.md)
- env ayrıntıları için: [Environment Rehberi](environment.md)
- backend beklentileri için: [Backend Kontratı](backend-contract.md)
- deploy hazırlığı için: [Operations Guide](operations.md)
