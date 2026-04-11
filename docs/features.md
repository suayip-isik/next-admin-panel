# Özellikler ve Akışlar

Bu doküman, projedeki temel ekranları ve kullanıcı akışlarını özetler. Amaç, “bu projede hangi admin özellikleri var?” sorusuna hızlı cevap vermektir.

## Auth Özellikleri

### Login

- Kullanıcı e-posta ve parola ile giriş yapar
- Geçerli oturum varsa login sayfası kullanıcıyı tekrar `/dashboard` sayfasına yönlendirir
- Login başarısız olursa backend yanıtı üzerinden hata gösterilebilir

### TOTP / İki Adımlı Doğrulama

- Bazı kullanıcılar için login sonrası ek doğrulama gerekir
- Backend `requires_totp` dönerse kullanıcı `/totp` sayfasına alınır
- Geçici doğrulama durumu istemci tarafında tamamlanır

### Şifre Sıfırlama ve E-posta Doğrulama

- `forgot-password`
- `reset-password`

Bu ekranlar auth grubunda yer alır ve kullanıcı hesabı yaşam döngüsünün temel parçalarını kapsar.

## Admin Özellikleri

### Dashboard

- Uygulamanın varsayılan açılış ekranıdır
- Kullanıcı istatistikleri gibi özet metrikleri gösterir
- Üst seviye durum görünümü için tasarlanmıştır

### Kullanıcı Yönetimi

Route'lar:

- `/users`
- `/users/deleted`
- `/users/[id]`

Beklenen görevler:

- aktif kullanıcıları listelemek
- silinmiş kullanıcıları görmek
- kullanıcı detayına gitmek
- rol veya durum bazlı yönetim işlemleri yapmak

### Rol Yönetimi

Route'lar:

- `/roles`
- `/roles/[id]`

Beklenen görevler:

- mevcut rolleri listelemek
- rol detaylarını incelemek
- rol oluşturma veya düzenleme akışlarını yürütmek

### Bildirimler

Route:

- `/notifications`

Yönetim paneli içi bildirimlerin veya ilgili kayıtların listelenmesi için kullanılır.

### Audit Logs

Route:

- `/audit-logs`

Sistem üzerindeki önemli işlemleri ve değişiklik geçmişini gözlemlemek için kullanılır.

### API Key Yönetimi

Route:

- `/api-keys`

Entegrasyon veya servis erişimleri için oluşturulan anahtarların görüntülenmesi ve yönetimi amacıyla kullanılır.

### Profil ve Güvenlik

Route'lar:

- `/profile`
- `/profile/security`

Beklenen görevler:

- profil bilgilerini güncellemek
- parola değiştirmek
- TOTP ayarlarını yönetmek
- backup code gibi güvenlik unsurlarını yönetmek

## Global UI Özellikleri

### Sidebar ve Topbar

Admin ekranlarında ortak layout şu parçaları içerir:

- sidebar navigasyonu
- topbar
- bildirim alanı
- sayfa içeriği

Bu yapı tüm korumalı sayfalarda tutarlı gezinme deneyimi sağlar.

### Tema Değişimi

- light
- dark
- system

Tema tercihi kullanıcı bazında tarayıcıda saklanır.

### Dil Değişimi

- İngilizce (`en`)
- Türkçe (`tr`)

Locale seçimi cookie ile saklandığı için hem sunucu hem istemci tarafında korunabilir.

## Teknik Olarak Önemli Davranışlar

### Korumalı route davranışı

- Kullanıcı oturum açmamışsa admin sayfalarına gidemez
- Sistem kullanıcıyı `/login` sayfasına yönlendirir
- Orijinal hedef route `from` query parametresinde korunur

### API proxy davranışı

- İstemci, backend detaylarını doğrudan bilmek zorunda kalmaz
- `/api/v1/*` route'ları sunucu tarafında FastAPI'ye iletilir
- access token cookie'den okunur ve uygun header ile backend'e taşınır

### Refresh davranışı

- İstekler `401` dönerse token yenileme denenir
- Aynı anda gelen çoklu `401` durumlarında tek refresh akışı paylaşılır
- Refresh başarısız olursa kullanıcı tekrar login'e yönlendirilir
