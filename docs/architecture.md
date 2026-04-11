# Mimari Doküman

Bu doküman, uygulamanın ana mimari kararlarını ve istek akışlarını açıklar. Amaç, projeye yeni giren bir geliştiricinin dosya yapısını ezberlemeden sistemin nerede nasıl davrandığını anlayabilmesidir.

## Genel Mimari

Uygulama üç katmanlı bir yapı gibi düşünülebilir:

1. Next.js App Router ile oluşturulmuş UI ve route katmanı
2. Next.js içindeki BFF/proxy route'ları
3. Ayrı çalışan FastAPI backend servisi

Tarayıcı doğrudan backend'e bağlanmak yerine çoğu durumda önce Next.js route'larına gider. Bu sayede:

- auth cookie yönetimi sunucu tarafında tutulur
- access token istemci JavaScript'ine açılmaz
- backend'e giden istekler merkezi olarak yönlendirilir
- `401` ve refresh davranışı tek yerde kontrol edilir

## Route Organizasyonu

### `app/(auth)`

Kullanıcının oturum açmadan eriştiği ekranlar burada bulunur:

- `/login`
- `/totp`
- `/forgot-password`
- `/reset-password`

Bu grup daha sade bir layout kullanır. Üst alanda locale değiştirici ve tema değiştirici yer alır.

### `app/(admin)`

Oturum gerektiren asıl yönetim paneli ekranları burada bulunur:

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

Bu grup sidebar + topbar içeren admin layout'u kullanır.

### `app/api/auth/*`

Auth ile ilgili route handler'lar bu klasörde yer alır. Tipik görevleri:

- login isteğini FastAPI'ye iletmek
- token'ları cookie olarak yazmak veya temizlemek
- refresh akışını yönetmek
- gerekiyorsa TOTP doğrulama adımını tamamlamak

### `app/api/v1/[...path]`

Bu route genel amaçlı bir proxy katmanıdır. Tarayıcıdan gelen `/api/v1/*` istekleri burada alınır ve aynı path FastAPI backend'e forward edilir.

## Auth ve Session Tasarımı

Oturum yönetimi cookie tabanlıdır.

- `access_token`: kısa ömürlü token
- `refresh_token`: daha uzun ömürlü token

Bu cookie'ler `httpOnly` olarak yazılır. Böylece istemci tarafındaki uygulama token değerini doğrudan okuyamaz.

### Login akışı

1. Kullanıcı login formunu gönderir.
2. Next.js route handler isteği FastAPI'ye iletir.
3. Başarılı cevap access ve refresh token içeriyorsa cookie'ler set edilir.
4. Backend bazı durumlarda tam token seti yerine `requires_totp` ve `partial_token` dönebilir.
5. Bu durumda istemci TOTP sayfasına geçer ve ikinci adımı tamamlar.

### Route koruması

`proxy.ts` dosyası korumalı route'lara gelen istekleri denetler.

- Statik asset'ler doğrudan geçer
- `/api/*` route'ları bu kontrolün dışında bırakılır
- auth dışındaki sayfalarda `access_token` yoksa kullanıcı `/login` sayfasına yönlendirilir
- yönlendirilen URL'ye `from` parametresi eklenir; böylece login sonrası geri dönüş mümkün olur

### `401` ve refresh akışı

İstemci tarafındaki API katmanı `401` alınca tek bir refresh isteği paylaşır. Aynı anda birden fazla sorgu başarısız olursa hepsi aynı refresh promise'ini bekler.

Başarılı durumda:

- refresh tamamlanır
- orijinal istek tekrar denenir
- body içeren `POST` veya benzeri mutation istekleri de yeniden gönderilebilir şekilde korunur

Başarısız durumda:

- kullanıcı `/login` sayfasına yönlendirilir

## Veri Akışı

### Tarayıcıdan FastAPI'ye istek

1. UI bileşeni bir veri sorgusu başlatır.
2. İstek çoğunlukla `/api/v1/...` endpoint'ine gider.
3. Next.js route handler cookie'den access token'ı alır.
4. İstek, gerekli header temizliği ve locale header ayarı ile FastAPI'ye forward edilir.
5. FastAPI yanıtı Next.js üzerinden tarayıcıya geri döner.

Bu modelin avantajı, backend URL'si ve auth davranışının istemci katmanından soyutlanmasıdır.

## Provider Yapısı

Kök layout içinde şu provider'lar kurulur:

- `NextIntlClientProvider`: çeviri mesajlarını sağlar
- `NuqsAdapter`: query string state yönetimi için altyapı sağlar
- `ThemeProvider`: tema durumunu yönetir
- `QueryProvider`: React Query istemcisini ve devtools'u sağlar
- `Toaster`: uygulama genelinde toast bildirimleri üretir

Bu yapı, sayfaların tekrar tekrar ortak kurulum yapmasını engeller.

## i18n Yaklaşımı

- Desteklenen locale'ler `en` ve `tr`
- Varsayılan locale `en`
- Locale tercihi `NEXT_LOCALE` cookie'sinde saklanır
- Sunucu tarafındaki forward işlemleri, locale bilgisini `accept-language` header'ına dönüştürebilir

Bu sayede backend gerekli olduğunda locale bilgisinden faydalanabilir.

## Modül Organizasyonu

`modules/` dizini domain bazlı bir ayrım için kullanılır. Bu projede kullanıcılar, roller, bildirimler, profil ve benzeri özellikler kendi modül alanları altında tutulur. Amaç:

- sayfa dosyalarını sade tutmak
- veri sorgularını ve UI'ı iş alanı bazında gruplayabilmek
- yeni özellik eklemeyi daha kontrollü hale getirmek

## Test Mimarisi

- `tests/unit`: yardımcı fonksiyonlar, proxy mantığı, auth route'ları ve veri sorguları için unit testler
- `tests/e2e`: kullanıcı akışlarını doğrulayan Playwright senaryoları

E2E testlerde özellikle auth yönlendirmeleri ve TOTP gibi kullanıcı açısından kritik davranışlar doğrulanır.
