# Backend Kontratı

Bu belgeyi bu frontend'i gerçek backend'e bağlarken, endpoint beklentilerini anlamaya çalışırken veya `pnpm generate:types` akışını kurarken okuyun.

## Amaç

Bu repo bir admin frontend/BFF katmanıdır. Backend'e doğrudan tarayıcıdan gitmek yerine, isteklerin çoğu Next.js route handler/proxy katmanından geçer. Bu nedenle backend tarafında belirli endpoint ailelerinin ve yanıt şekillerinin varlığı beklenir.

## Çalışma Modeli

İstek akışı özetle şöyledir:

1. Kullanıcı UI üzerinde aksiyon alır.
2. Tarayıcı çoğunlukla `/api/auth/*` veya `/api/v1/*` adreslerine istek atar.
3. Next.js route handler katmanı isteği FastAPI'ye forward eder.
4. Access token varsa `Authorization` header olarak eklenir.
5. Gerekirse refresh akışı `/api/auth/refresh` üzerinden çalışır.

## Endpoint Aileleri

| Endpoint grubu                                      | Amaç                                   | Etkilediği alan             |
| --------------------------------------------------- | -------------------------------------- | --------------------------- |
| `/api/v1/admin/auth/login`                          | admin login                            | `/login`                    |
| `/api/v1/shared/auth/totp-challenge`                | ikinci adım doğrulama                  | `/totp`                     |
| `/api/v1/shared/auth/refresh`                       | token yenileme                         | tüm oturumlu istekler       |
| `/api/v1/shared/auth/logout`                        | session kapatma                        | topbar logout               |
| `/api/v1/shared/auth/forgot-password`               | reset talebi                           | `/forgot-password`          |
| `/api/v1/shared/auth/reset-password`                | reset tamamlama                        | `/reset-password`           |
| `/api/v1/shared/me`                                 | mevcut kullanıcı ve permission bilgisi | login guard, profile, authz |
| `/api/v1/shared/me/avatar`                          | kendi avatarını yönetme                | `/profile`                  |
| `/api/v1/admin/users*`                              | kullanıcı yönetimi                     | `/users`, `/users/[id]`     |
| `/api/v1/admin/users/{user_id}/avatar`              | kullanıcı avatarı                      | kullanıcı detay             |
| `/api/v1/admin/users/{user_id}/change-email`        | e-posta değiştirme                     | kullanıcı detay             |
| `/api/v1/admin/users/{user_id}/resend-verification` | doğrulama yeniden gönderme             | kullanıcı detay             |
| `/api/v1/admin/users/{user_id}/resend-invite`       | davet yeniden gönderme                 | kullanıcı detay             |
| `/api/v1/admin/roles*`                              | rol yönetimi                           | `/roles`, `/roles/[id]`     |
| `/api/v1/admin/audit-logs*`                         | audit log sorguları                    | `/audit-logs`               |
| `/api/v1/shared/notifications*`                     | bildirimler                            | `/notifications`, topbar    |
| `/api/v1/shared/api-keys*`                          | API key yönetimi                       | `/api-keys`                 |
| `/schema/admin/openapi.json`                        | OpenAPI şeması                         | `pnpm generate:types`       |

## Login ve TOTP Beklentisi

Login akışı şu iki tür sonucu bekler:

- standart başarılı login: access + refresh token seti
- TOTP gerekli login: `requires_totp: true` ve `partial_token`

TOTP gerektiğinde:

1. login sonrası kullanıcı `/totp` sayfasına gider
2. `partial_token` istemci tarafında geçici tutulur
3. `/api/auth/totp` isteği ile nihai token seti alınır

## `/api/v1/shared/me` Neden Kritik?

Bu endpoint birçok davranış için merkezi kaynaktır:

- login sayfasında geçerli session kontrolü
- topbar/profile verisi
- permission çözümleme
- bazı server-side access guard akışları

Mümkünse bu endpoint mevcut kullanıcıyı ve permission bilgisini stabil biçimde döndürmelidir.

## Refresh Davranışı

İstemci API katmanı `401` aldığında:

1. tek bir refresh isteği paylaşır
2. refresh başarılıysa ilk isteği tekrar dener
3. refresh başarısızsa kullanıcıyı login akışına döndürür

Bu yüzden backend refresh endpoint'inin cookie veya token akışına uygun ve idempotent davranması önemlidir.

## OpenAPI Tip Üretimi

Tip üretimi için komut:

```bash
pnpm generate:types
```

URL çözümleme sırası:

1. `OPENAPI_SCHEMA_URL`
2. `NEXT_PUBLIC_FASTAPI_URL + /schema/admin/openapi.json`
3. fallback `http://127.0.0.1:8000/schema/admin/openapi.json`

Tip üretimi başarısız olursa ilk bakılacaklar:

- backend ayakta mı
- schema endpoint'i erişilebilir mi
- CORS değil, doğrudan URL erişimi doğru mu
- schema yolu gerçekten `/schema/admin/openapi.json` mı

## Backend Olmadan ve Backend ile Çalışan Alanlar

### Backend olmadan ilerlenebilen alanlar

- statik route ve layout geliştirme
- ortak UI bileşenleri
- unit testler
- mock tabanlı e2e testler

### Gerçek backend gerektiren alanlar

- gerçek login/logout
- kullanıcı, rol, bildirim ve audit verileri
- gerçek RBAC davranışı
- OpenAPI tip üretimi

## Entegrasyon Öncesi Kısa Checklist

- `NEXT_PUBLIC_FASTAPI_URL` doğru origin'i gösteriyor mu
- auth endpoint aileleri erişilebilir mi
- `/api/v1/shared/me` beklendiği gibi dönüyor mu
- OpenAPI schema endpoint'i erişilebilir mi
- production'da cookie güvenlik ayarları backend davranışıyla uyumlu mu

## İlgili Belgeler

- ilk kurulum için: [Başlangıç Rehberi](getting-started.md)
- env alanları için: [Environment Rehberi](environment.md)
- auth/proxy yapısı için: [Mimari Dokümanı](architecture.md)
- hata durumları için: [Troubleshooting](troubleshooting.md)
