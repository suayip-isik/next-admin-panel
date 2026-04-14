# Troubleshooting

Bu belgeyi kurulum, login, env, type generation veya test akışlarında takıldığınızda okuyun.

## `pnpm env:check` Hata Veriyor

Tipik belirtiler:

- URL formatı hatası
- zorunlu branding alanı eksikliği
- production güvenlik kuralı ihlali

Kontrol edin:

- `.env.local`
- `.env.example`
- `lib/env.ts`
- `scripts/env-check.mjs`

Sık nedenler:

- `NEXT_PUBLIC_APP_NAME` veya `NEXT_PUBLIC_APP_SHORT_NAME` boş
- `NEXT_PUBLIC_APP_URL` geçerli URL değil
- production benzeri ortamda `NEXT_PUBLIC_APP_URL` HTTPS değil
- `AUTH_COOKIE_SAME_SITE=none` ama `AUTH_COOKIE_SECURE=false`

Çözüm:

1. `.env.local` içindeki ilgili alanları düzeltin.
2. Gerekirse `.env.example` ile karşılaştırın.
3. Tekrar `pnpm env:check` çalıştırın.

## Backend'e Bağlanamıyor

Tipik belirtiler:

- login başarısız
- kullanıcı listesi boş veya hata durumda
- dashboard kartları yüklenmiyor

Kontrol edin:

- `NEXT_PUBLIC_FASTAPI_URL`
- backend'in gerçekten çalışıp çalışmadığı
- beklenen endpoint yolları

Çözüm:

1. backend origin'inin doğru olduğundan emin olun.
2. backend'in `/api/v1/...` endpoint ailesini sunduğunu doğrulayın.
3. schema üretimi de başarısızsa `/schema/admin/openapi.json` erişimini ayrıca kontrol edin.

## Login Sonrası Tekrar Login'e Düşüyor

Tipik belirtiler:

- login başarılı görünse de korumalı route'a geçilemiyor
- sayfa yenilemede session kayboluyor

Muhtemel nedenler:

- access/refresh cookie'leri yazılamıyor
- cookie policy backend ve frontend arasında uyumsuz
- `/api/v1/shared/me` isteği başarısız
- refresh akışı başarısız

Kontrol edin:

- `AUTH_COOKIE_SECURE`
- `AUTH_COOKIE_SAME_SITE`
- backend'in login ve refresh yanıtları
- `/api/v1/shared/me`

Çözüm:

1. yerelde HTTPS kullanmıyorsanız `AUTH_COOKIE_SECURE=false` olduğundan emin olun.
2. production'da `AUTH_COOKIE_SECURE=true` kullanın.
3. `AUTH_COOKIE_SAME_SITE=none` ise secure zorunluluğunu unutmayın.
4. login sonrası `/api/v1/shared/me` isteğinin gerçekten `200` döndüğünü doğrulayın.

## `pnpm generate:types` Çalışmıyor

Tipik belirtiler:

- schema fetch hatası
- bağlantı reddedildi
- beklenmeyen HTML veya 404 yanıtı

Kontrol edin:

- `OPENAPI_SCHEMA_URL`
- `NEXT_PUBLIC_FASTAPI_URL`
- backend schema endpoint'i

Çözüm:

1. schema endpoint'ini tarayıcı veya curl ile test edin.
2. yol standart değilse `OPENAPI_SCHEMA_URL` set edin.
3. backend ayakta değilse önce backend'i başlatın.

## E2E Testleri Yerelde Başarısız

Tipik belirtiler:

- Playwright sunucuya bağlanamıyor
- login akışı beklenenden farklı
- route redirect assertion'ları kırılıyor

Kontrol edin:

- `PLAYWRIGHT_BASE_URL`
- `PLAYWRIGHT_WEB_SERVER_URL`
- `PLAYWRIGHT_FASTAPI_URL`
- `tests/e2e`
- `playwright.config.ts`

Not:

- E2E suite mock FastAPI server ile çalışır; gerçek backend zorunlu değildir.
- web server URL ve base URL karışırsa testler yanlış origin'e gidebilir.

Çözüm:

1. varsayılan env değerleriyle deneyin.
2. `pnpm test:e2e` öncesi çakışan local server süreçlerini kontrol edin.
3. auth ve redirect davranışı değiştiyse test beklentilerini güncelleyin.

## Production URL veya Cookie Ayarı Yanlış

Tipik belirtiler:

- login sadece local'de çalışıyor
- deploy sonrası cookie set edilmiyor
- redirect veya callback davranışı bozuluyor

Kontrol edin:

- `NEXT_PUBLIC_APP_URL`
- `AUTH_COOKIE_SECURE`
- `AUTH_COOKIE_SAME_SITE`
- production deployment domain'i

Çözüm:

1. `NEXT_PUBLIC_APP_URL` değerini gerçek HTTPS domain'e ayarlayın.
2. production'da `AUTH_COOKIE_SECURE=true` kullanın.
3. cross-site senaryo varsa `sameSite` politikasını backend ile birlikte değerlendirin.

## İlk Fork Sonrası Kısa Sağlık Kontrolü

Sorun yaşamadan ilerlemek için şu sırayı kullanın:

```bash
pnpm env:check
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm build
```

Sonra şu göz kontrollerini yapın:

- `/login` açılıyor mu
- session yokken `/dashboard` login'e düşüyor mu
- backend bağlıysa login tamamlanıyor mu
- branding değerleri beklediğiniz gibi görünüyor mu

## Sonraki Belgeler

- başlangıç akışı için: [Başlangıç Rehberi](getting-started.md)
- backend beklentileri için: [Backend Kontratı](backend-contract.md)
- env sözleşmesi için: [Environment Rehberi](environment.md)
