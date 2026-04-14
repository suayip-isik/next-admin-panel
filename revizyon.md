Sen, bu projeye atanmış kıdemli bir frontend migration ve authorization ajanısın. Görevin, Next.js tabanlı admin
paneli mevcut backend ile birebir senkron çalışacak şekilde revize etmektir. Bu görev analiz değil, doğrudan uygulama
görevidir. Gerekli tüm frontend refactor, API client güncellemeleri, permission guard revizyonları, ekran akışları,
form submit path’leri ve test değişiklikleri bu görevin kapsamındadır.

Çalışma prensibin:

- Backend nihai otoritedir. Frontend yalnızca UX, visibility ve navigation kontrolü yapar.
- Backend canonical contract dışına çıkma.
- Legacy permission alias üretme.
- Legacy endpoint path kullanma.
- Eski permission isimlerini fallback olarak destekleme.
- `role === "admin"` benzeri role-based shortcut üretme.
- Permission mantığını component içine dağınık `if` bloklarıyla kopyalama.
- Geçici “todo”, “compat later”, “legacy support for now” türü çözümler üretme.
- Var olan frontend yapısı yetersizse refactor et; ama backend contract’ını eğip bükme.

Bu migration için zorunlu backend gerçekleri:

- Permission sözlüğü artık colon formatında değil, dot-notation canonical formatındadır.
- `admin:panel_access` kaldırılmıştır.
- Admin erişimi artık global panel permission ile değil, `surface=admin` ve somut admin permission’ları ile
  belirlenir.
- API key scope oluşturma artık strict’tir; kullanıcıda olmayan scope istenirse backend reddeder.
- Generic update endpoint’leri parçalanmıştır; frontend eski toplu update akışlarını kullanamaz.

Canonical permission sözlüğü:

- `profile.read.self`
- `profile.update.basic`
- `profile.update.email`
- `profile.update.password`
- `profile.update.avatar`
- `profile.delete.avatar`
- `uploads.create.own`
- `uploads.delete.own`
- `uploads.delete.any`
- `users.list`
- `users.read.basic`
- `users.read.deleted`
- `users.read.stats`
- `users.create.admin`
- `users.update.profile`
- `users.update.email`
- `users.update.role`
- `users.update.avatar`
- `users.delete.avatar`
- `users.resend.verification`
- `users.resend.admin_invite`
- `users.activate`
- `users.deactivate`
- `users.delete`
- `users.restore`
- `roles.list`
- `roles.read.detail`
- `roles.create`
- `roles.update.description`
- `roles.update.permissions`
- `roles.delete`
- `audit_logs.list`
- `audit_logs.read.detail`
- `audit_logs.stream`
- `api_keys.list`
- `api_keys.create`
- `api_keys.revoke`
- `notifications.list`
- `notifications.read.unread_count`
- `notifications.update.read`
- `notifications.update.all_read`
- `notifications.delete`

Bu canonical permission’lar dışında eski biçimde hiçbir permission kullanma:

- Yasak örnekler: `users:view`, `users:update`, `roles:update`, `audit:view`, `admin:panel_access`, `profile:view`

Backend route contract’ı:

- Self service:
  - `GET /api/v1/shared/me`
  - `PATCH /api/v1/shared/me/profile`
  - `PATCH /api/v1/shared/me/email`
  - `PATCH /api/v1/shared/me/password`
  - `PUT /api/v1/shared/me/avatar`
  - `DELETE /api/v1/shared/me/avatar`
- Shared uploads:
  - `POST /api/v1/shared/uploads`
  - `DELETE /api/v1/shared/uploads?key=...`
- API keys:
  - `POST /api/v1/shared/api-keys`
  - `GET /api/v1/shared/api-keys`
  - `DELETE /api/v1/shared/api-keys/{key_id}`
- Notifications:
  - `GET /api/v1/shared/notifications`
  - `GET /api/v1/shared/notifications/unread-count`
  - `PATCH /api/v1/shared/notifications/read-all`
  - `PATCH /api/v1/shared/notifications/{notification_id}`
  - `DELETE /api/v1/shared/notifications/{notification_id}`
- Admin users:
  - `GET /api/v1/admin/users`
  - `GET /api/v1/admin/users/stats`
  - `GET /api/v1/admin/users/deleted`
  - `GET /api/v1/admin/users/{user_id}`
  - `POST /api/v1/admin/users`
  - `PATCH /api/v1/admin/users/{user_id}/profile`
  - `POST /api/v1/admin/users/{user_id}/change-email`
  - `PATCH /api/v1/admin/users/{user_id}/role`
  - `PUT /api/v1/admin/users/{user_id}/avatar`
  - `DELETE /api/v1/admin/users/{user_id}/avatar`
  - `POST /api/v1/admin/users/{user_id}/resend-verification`
  - `POST /api/v1/admin/users/{user_id}/resend-invite`
  - `POST /api/v1/admin/users/{user_id}/activate`
  - `POST /api/v1/admin/users/{user_id}/deactivate`
  - `DELETE /api/v1/admin/users/{user_id}`
  - `POST /api/v1/admin/users/{user_id}/restore`
- Admin roles:
  - `GET /api/v1/admin/roles`
  - `GET /api/v1/admin/roles/{role_id}`
  - `POST /api/v1/admin/roles`
  - `PATCH /api/v1/admin/roles/{role_id}/description`
  - `PUT /api/v1/admin/roles/{role_id}/permissions`
  - `DELETE /api/v1/admin/roles/{role_id}`
- Admin audit logs:
  - `GET /api/v1/admin/audit-logs`
  - `GET /api/v1/admin/audit-logs/stream`
  - `GET /api/v1/admin/audit-logs/{log_id}`

Zorunlu frontend authorization kuralları:

- Navigation, route ve component/action kontrollerini ayrı katmanlarda uygula.
- Bir menü öğesinin görünmesi ile o sayfadaki tüm aksiyonların kullanılabilir olması aynı şey değildir.
- Bir route’a erişim olması o route içindeki tüm butonları açmaz.
- Permission check helper’ları merkezi olmalıdır.
- En az şu helper katmanı bulunmalıdır:
  - `hasPermission(permission)`
  - `hasAllPermissions(permissions)`
  - `hasAnyPermission(permissions)`
  - route guard / page guard
  - action-level guard
- Doğrudan role name kontrolü yasaktır.
- Route guard’lar manuel URL girişinde de yetkisiz sayfayı render etmemelidir.
- Yetkisiz durumda uygun `403`/`AccessDenied` UX’i üret.

Zorunlu UI eşleme kuralları:

- Users modülü:
  - liste görünürlüğü: `users.list`
  - user detail sayfası: `users.read.basic`
  - stats widget: `users.read.stats`
  - deleted users view: `users.read.deleted`
  - create admin user action: `users.create.admin`
  - profile edit action/form: `users.update.profile`
  - email change action/form: `users.update.email`
  - role change action/form: `users.update.role`
  - avatar upload action: `users.update.avatar`
  - avatar delete action: `users.delete.avatar`
  - resend verification action: `users.resend.verification`
  - resend invite action: `users.resend.admin_invite`
  - activate action: `users.activate`
  - deactivate action: `users.deactivate`
  - delete action: `users.delete`
  - restore action: `users.restore`
- Roles modülü:
  - roles list page: `roles.list`
  - role detail: `roles.read.detail`
  - create role: `roles.create`
  - description edit: `roles.update.description`
  - permission set edit: `roles.update.permissions`
  - delete role: `roles.delete`
- Audit logs modülü:
  - list page: `audit_logs.list`
  - detail drawer/page: `audit_logs.read.detail`
  - stream/live mode: `audit_logs.stream`
- API keys:
  - list: `api_keys.list`
  - create: `api_keys.create`
  - revoke: `api_keys.revoke`
- Notifications:
  - list: `notifications.list`
  - unread count: `notifications.read.unread_count`
  - single mark read: `notifications.update.read`
  - mark all read: `notifications.update.all_read`
  - delete: `notifications.delete`
- Profile:
  - read self page: `profile.read.self`
  - basic profile update: `profile.update.basic`
  - email update: `profile.update.email`
  - password update: `profile.update.password`
  - avatar upload: `profile.update.avatar`
  - avatar delete: `profile.delete.avatar`
- Uploads:
  - own upload create: `uploads.create.own`
  - own upload delete: `uploads.delete.own`
  - any upload delete admin action: `uploads.delete.any`

Zorunlu refactor kuralları:

- Eski generic user edit form’unu yeni backend contract’a göre böl:
  - basic profile form
  - email change form
  - role assignment form
  - avatar form
- Eski generic role update form’unu böl:
  - description form
  - permissions replacement form
- Form submitter’lar yeni endpoint path’lerini kullanmalı.
- API client katmanında endpoint isimlerini ve DTO’ları yeni contract’a göre yeniden adlandır.
- Request/response tiplerini backend yüzeyine göre güncelle.
- Cache key, React Query key, SWR key veya store slice isimleri permission/resource mantığıyla tutarlı olmalı.
- Permission string literal’larını uygulama geneline saçma; merkezi constants veya typed layer kullan.
- Route metadata, sidebar config ve page config aynı canonical permission sözlüğünü kullanmalı.

`view yok ama action var` kuralı:

- Kullanıcıda dar bir action permission’ı varsa full detail page render etme.
- Örnek: `users.update.role` var ama `users.read.basic` yoksa:
  - user detail page’i açma
  - gerekiyorsa list row action, modal veya targeted form kullan
  - yalnızca gerekli alanları göster
- Aynı ilke diğer dar action’lar için de geçerlidir.

Hata yönetimi:

- 401, 403, 404, validation ve backend business-rule hatalarını ekran bazlı doğru işle.
- Backend 403 dönüyorsa frontend bunu gizleme veya success gibi gösterme.
- API key create akışında unauthorized scope hatasını kullanıcıya açık göster.
- Eski path’e düşen çağrılar varsa düzelt; client-side fallback veya retry ile gizleme.

Test zorunluluğu:

- Permission helper’ları için unit test ekle veya güncelle.
- Route guard’lar için test ekle.
- Menü visibility ve action visibility için test ekle.
- API client endpoint mapping testlerini güncelle.
- Kullanıcı yönetimi, rol yönetimi ve audit log erişimi için e2e veya integration seviyesinde permission-gated UI
  testleri ekle/güncelle.
- Testsiz bırakma.
- Var olan testler eski permission string’lerine veya eski endpoint path’lerine dayanıyorsa yeni canonical sözlüğe
  göre revize et.

Çalışma şekli:

1. Önce mevcut frontend kodunda tüm eski permission string’lerini, eski endpoint path’lerini, role-based shortcut’ları
   ve dağınık guard mantığını tara.
2. Sonra merkezi permission/authz katmanını canonical backend modeline getir.
3. Sonra API client katmanını yeni path’lerle güncelle.
4. Sonra page/menu/action seviyesinde tüm admin paneli uyumlu hale getir.
5. Son olarak testleri güncelle ve çalıştır.
6. İş bitmeden “analiz tamam” deyip durma; kodu değiştir, doğrula, kırıkları kapat.

Teslim standardı:

- Admin panel backend ile kusursuz senkron çalışmalı.
- Legacy permission veya legacy endpoint referansı kalmamalı.
- Menü, route ve action yetkilendirmeleri ayrıştırılmış olmalı.
- Permission mantığı merkezi ve denetlenebilir olmalı.
- Kod derlenmeli, testler geçmeli.
- Yaptığın değişiklikler backend canonical RBAC modeline tam uyumlu olmalı.
