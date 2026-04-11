# Mimari Doküman

Bu repo, Next.js App Router üzerinde çalışan bir admin panel frontend'idir. Backend tarafında FastAPI beklenir; Next.js uygulaması hem UI katmanını hem de backend'e giden ara proxy/auth katmanını barındırır.

## Üst Seviye Yapı

Sistem üç ana parçadan oluşur:

1. `app/` altındaki route, layout ve metadata katmanı
2. `app/api/*` ve `lib/server-auth.ts` içindeki BFF/proxy katmanı
3. Ayrı çalışan FastAPI backend

Temel amaçlar:

- token'ları tarayıcı JavaScript'ine açmamak
- backend URL ve auth davranışını merkezi yönetmek
- refresh/retry mantığını tek yerde toplamak
- UI modüllerini route dosyalarından ayırmak

## Route Organizasyonu

### `app/(auth)`

Public auth sayfalarını içerir:

- `/login`
- `/totp`
- `/forgot-password`
- `/reset-password`

Bu grup üst barda locale ve tema değiştirme aksiyonları olan sade bir layout kullanır.

### `app/(admin)`

Session gerektiren admin ekranlarını içerir:

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

Bu grup sidebar + topbar kullanan tam admin layout ile render edilir.

Kullanıcı yönetimi tarafında `/users` liste ekranı; create-admin dialog'unu, filtreleri ve hızlı aksiyonları taşır. Daha kapsamlı yönetim aksiyonları `/users/[id]` detay ekranında toplanır.

### Sistem route'ları

- `/` doğrudan `/dashboard` adresine yönlendirir.
- `/unauthorized` basit bir 403 ekranı sağlar.
- `/manifest.webmanifest`, `/robots.txt`, `/sitemap.xml` metadata route'larıdır.
- `/api/health` no-store JSON health yanıtı döner.

## Auth ve Session Tasarımı

Auth cookie tabanlıdır. Cookie isimleri ve politikaları `lib/env.ts` üzerinden environment ile kontrol edilir.

Ana cookie'ler:

- `access_token`
- `refresh_token`

Bu cookie'ler `httpOnly` yazılır ve istemci tarafında doğrudan okunmaz.

### Login akışı

1. Kullanıcı login formunu gönderir.
2. `app/api/auth/login/route.ts`, isteği FastAPI'deki `/api/v1/admin/auth/login` endpoint'ine forward eder.
3. Başarılı yanıtta access + refresh token gelirse cookie'ler yazılır.
4. Backend `requires_totp` dönerse partial auth yanıtı kullanıcıyı ikinci adıma taşır.
5. `/api/auth/totp`, FastAPI'deki `/api/v1/shared/auth/totp-challenge` endpoint'iyle akışı tamamlar.

### Logout ve refresh

- `/api/auth/logout`, refresh token varsa backend logout endpoint'ini çağırır; ne olursa olsun lokal cookie'leri temizler.
- `/api/auth/refresh`, refresh token'ı backend'e gönderir; başarılıysa yeni token setini yazar.
- Refresh yanıtı geçersiz veya başarısız ise cookie'ler temizlenir.

### Login sayfasında session kontrolü

`app/(auth)/login/page.tsx` şu davranışı uygular:

- access cookie varsa
- aynı origin içindeki `/api/v1/shared/me` endpoint'i `ok` dönüyorsa
- kullanıcı `/dashboard` sayfasına yönlendirilir

Bu kontrol, stale cookie ile yanlış yönlendirmeyi azaltır.

## Route Koruması

`proxy.ts` dosyası istek öncesi koruma uygular.

Kurallar:

- `/_next/*`, `favicon.ico`, `robots.txt` gibi varlıklar doğrudan geçer
- `/api/*` route'ları middleware benzeri auth kontrolünün dışında bırakılır
- auth route'ları public kalır
- diğer sayfalarda access token yoksa kullanıcı `/login?from=...` adresine yönlendirilir

`from` parametresi, kullanıcının hedeflediği orijinal path + query bilgisini korur.

## API Proxy Katmanı

### Genel proxy

`app/api/v1/[...path]/route.ts`, `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS` isteklerini yakalar ve `proxyApiRequestToFastApi()` ile FastAPI'ye forward eder.

Forward sırasında:

- access token varsa `Authorization: Bearer ...` eklenir
- locale cookie'si `accept-language` header'ına çevrilir
- gereksiz request header'ları temizlenir
- response body ve status upstream'den korunur

Bu katman, multipart upload isteklerini de taşıyabilir; profil avatarı ve kullanıcı avatarı akışları aynı `/api/v1/*` proxy hattından backend'e gider.

### Client API katmanı

`lib/api-client.ts` içinde `openapi-fetch` tabanlı istemci bulunur.

Önemli davranışlar:

- `credentials: "include"` kullanılır
- locale değişim akışıyla yarış olmaması için request öncesi bekleme yapılır
- aynı anda gelen tüm `401` yanıtları tek bir refresh promise'ini paylaşır
- refresh başarılıysa ilk request tekrar denenir
- refresh başarısızsa istemci `/login` sayfasına yönlenir

## UI ve Provider Katmanı

Kök layout şu ortak katmanları kurar:

- `NextIntlClientProvider`
- `NuqsAdapter`
- `ThemeProvider`
- `QueryProvider`
- `Toaster`

Ek olarak hydration öncesi çalışan bir script, kayıtlı tema tercihini uygulayıp FOUC etkisini azaltır.

Admin layout:

- `Sidebar`
- `Topbar`
- scroll eden `main` alanı

Auth layout:

- üstte locale + tema aksiyonları
- ortalanmış dar form alanı

## Modül Organizasyonu

Kod, route yerine domain bazlı modüllere ayrılmıştır:

- `modules/auth`
- `modules/users`
- `modules/roles`
- `modules/notifications`
- `modules/audit-logs`
- `modules/api-keys`
- `modules/profile`

Bu modüller çoğunlukla:

- query fonksiyonları
- ekran bileşenleri
- form şemaları
- query key tanımları

Örnekler:

- `modules/users`: kullanıcı listesi, create-admin dialog'u, kullanıcı detay aksiyonları, avatar/e-posta/verification yönetimi
- `modules/profile`: kendi profil formu, avatar yönetimi, parola ve 2FA bölümleri
- `modules/audit-logs`: filtreli liste, cursor tabanlı stream yükleme ve detail sheet

içerir.

Ortak parçalar:

- `shared/components`: tekrar kullanılabilir UI
- `shared/hooks`: ortak hook'lar
- `shared/utils`: saf yardımcı fonksiyonlar
- `lib`: env, auth forward, API client gibi altyapı kodu

## i18n, Metadata ve Gözlemlenebilirlik

### i18n

- desteklenen locale'ler `en` ve `tr`
- varsayılan locale `en`
- locale tercihi `NEXT_LOCALE` cookie'sinde tutulur
- upstream isteklerde non-default locale `accept-language` header'ına yazılır

### Metadata route'ları

- `manifest.ts` uygulama adı, kısa adı, açıklaması ve tema renklerini env üzerinden üretir
- `robots.ts` yalnızca production benzeri ve localhost olmayan ortamda indexing açar
- `sitemap.ts` aynı koşulla public route'ları listeler

### Sentry

- istemci, server ve edge init dosyaları mevcuttur
- DSN veya build auth token verilmediyse entegrasyon pasif kalabilir
- source map upload yalnızca build auth token varsa etkinleşir

## Test Mimarisi

- `tests/unit`: env, proxy, auth route'ları, metadata route'ları, query katmanı ve yardımcı fonksiyonlar
- `tests/e2e`: auth yönlendirme ve TOTP geçiş akışı

Playwright yapılandırması gerekirse `pnpm dev` ile web server başlatır ve `PLAYWRIGHT_*` env değerlerini kullanır.

Audit log ekranı istemci tarafında cursor tabanlı `Load more` davranışı kullanır; sayfa numarasını URL'de tutmak yerine yalnızca filtre parametrelerini URL state'te korur. Profil ve kullanıcı detay ekranlarındaki avatar işlemleri mutation sonrası React Query cache invalidation ile topbar ve ilgili kartları anında günceller.
