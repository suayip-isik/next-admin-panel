# Özellikler ve Akışlar

Bu belgeyi repoda bugün gerçekten hangi ekranların ve akışların bulunduğunu hızlıca görmek istediğinizde okuyun.

Kurulum için [Başlangıç Rehberi](getting-started.md), backend bağımlılıkları için [Backend Kontratı](backend-contract.md) daha doğru başlangıç noktalarıdır.

## Auth

### Login

- Kullanıcı `/login` ekranında e-posta ve parola ile giriş yapar.
- Login isteği `/api/auth/login` üzerinden FastAPI'deki `/api/v1/admin/auth/login` endpoint'ine iletilir.
- Başarılı token yanıtında access ve refresh token `httpOnly` cookie olarak yazılır.
- Login sayfası, cookie mevcutsa `/api/v1/shared/me` ile oturumu doğrular ve kullanıcıyı `/dashboard` sayfasına yönlendirir.

### TOTP doğrulama

- Backend `requires_totp` ve `partial_token` dönerse kullanıcı `/totp` sayfasına geçer.
- TOTP doğrulaması `/api/auth/totp` route'u üzerinden tamamlanır.
- TOTP başarılı olduğunda nihai token seti cookie'lere yazılır.

### Şifre sıfırlama

- `/forgot-password` ekranı şifre sıfırlama talebi başlatır.
- `/reset-password` ekranı reset token + yeni parola ile akışı tamamlar.
- Bu akışlar `/api/v1/shared/auth/forgot-password` ve `/api/v1/shared/auth/reset-password` endpoint'lerini kullanır.

## Admin Alanları

### Dashboard

Route:

- `/dashboard`

Davranış:

- Sayfa başlığı ve açıklaması gösterir.
- `UserStatsCards` üzerinden kullanıcı istatistik kartlarını yükler.
- Veri yüklenene kadar skeleton fallback kullanır.

### Kullanıcı yönetimi

Route'lar:

- `/users`
- `/users/deleted`
- `/users/[id]`

Desteklenen işlemler:

- aktif kullanıcıları listeleme
- silinmiş kullanıcıları listeleme
- kullanıcı detayını görüntüleme
- admin kullanıcı oluşturma
- kullanıcı profil alanlarını güncelleme
- kullanıcı e-posta değişikliğini başlatma
- kullanıcı doğrulama e-postasını yeniden gönderme
- admin davetini yeniden gönderme
- kullanıcı avatarını yükleme ve silme
- kullanıcıyı aktive etme
- kullanıcıyı deaktive etme
- kullanıcıyı silme
- kullanıcıyı geri yükleme
- kullanıcı rolünü değiştirme

### Rol yönetimi

Route'lar:

- `/roles`
- `/roles/[id]`

Desteklenen işlemler:

- rol listesini görüntüleme
- rol detayını görüntüleme
- yeni rol oluşturma
- mevcut rolü güncelleme
- rol silme

### Audit logs

Route:

- `/audit-logs`

Desteklenen işlemler:

- cursor tabanlı audit log listesi
- `Load more` ile ek kayıtları akış halinde yükleme
- `action`, `user_id`, `date_from`, `date_to` filtreleri
- tekil audit log detayı görüntüleme

### Bildirimler

Route:

- `/notifications`

Desteklenen işlemler:

- bildirim listesi
- okunmamış bildirim sayısı
- tek bildirimi okundu işaretleme
- tüm bildirimleri okundu işaretleme
- bildirim silme

Topbar içindeki bildirim zili, unread count için periyodik sorgu yapar.

### API key yönetimi

Route:

- `/api-keys`

Desteklenen işlemler:

- API key listeleme
- yeni API key oluşturma
- API key silme

### Profil ve güvenlik

Route'lar:

- `/profile`
- `/profile/security`

Desteklenen işlemler:

- profil bilgilerini güncelleme
- profil avatarını yükleme ve silme
- parola değiştirme
- TOTP kurulum bilgisi alma
- TOTP doğrulama
- TOTP devre dışı bırakma
- backup code sayısını görüntüleme
- backup code'ları yeniden üretme

## Ortak UI Davranışları

### Admin layout

- Sidebar, topbar ve scroll eden ana içerik alanı kullanılır.
- Sidebar içinde dashboard, users, roles, audit logs, API keys, notifications, profile ve security bağlantıları bulunur.
- Sidebar daraltılıp genişletilebilir.

### Topbar

- bildirim zili
- locale değiştirici
- tema değiştirici
- kullanıcı avatar menüsü
- çıkış işlemi

### Locale desteği

- desteklenen diller: `en`, `tr`
- varsayılan locale: `en`
- locale tercihi `NEXT_LOCALE` cookie'sinde saklanır

### Tema desteği

- `light`, `dark`, `system`
- tema tercihi istemci tarafında saklanır
- hydration öncesi script ile ilk render teması ayarlanır

## Teknik Davranışlar

### Route koruması

- `proxy.ts`, `/api/*` ve auth route'ları dışındaki sayfaları korur.
- Access token cookie'si yoksa kullanıcı `/login?from=...` adresine yönlendirilir.
- Static asset ve metadata route'ları bypass edilir.

### API proxy

- `/api/v1/*` istekleri Next.js route handler tarafından FastAPI'ye forward edilir.
- Access token varsa `Authorization` header olarak eklenir.
- `accept-language` header'ı locale cookie'sinden türetilir.
- `cookie`, `host`, `connection`, `content-length` gibi header'lar upstream'e taşınmaz.

### Refresh ve retry

- Client API katmanı `401` durumunda tek bir refresh isteği paylaşır.
- Refresh başarılıysa ilk request tekrar gönderilir.
- Refresh başarısızsa kullanıcı `/login` sayfasına yönlendirilir.
- Retry için original request clone edilerek saklanır; mutation request body'leri de yeniden gönderilebilir.
