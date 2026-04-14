# RBAC Rehberi

Bu belgeyi bir route veya aksiyonun hangi permission ile açıldığını, menü görünürlüğü ile gerçek erişim farkını veya `/api/v1/shared/me` tabanlı authorization çözümlemesini anlamak istediğinizde okuyun.

Kurulum ve ürünleştirme için bu belge başlangıç noktası değildir; önce [Başlangıç Rehberi](getting-started.md) ve gerekirse [Backend Kontratı](backend-contract.md) okunmalıdır.

Bu repoda RBAC kararları role adına göre değil, canonical permission listesine göre verilir. `role === "admin"` benzeri shortcut'lar kullanılmaz.

## Temel Model

Frontend tarafında authorization üç ayrı katmanda çalışır:

1. Route/page access
2. Navigation visibility
3. Action/component access

Bu ayrım kritiktir:

- Bir menü öğesinin görünmesi, o sayfadaki tüm aksiyonların açık olduğu anlamına gelmez.
- Bir route'a erişim olması, o route içindeki tüm butonların kullanılabilir olduğu anlamına gelmez.
- Backend her zaman nihai otoritedir; frontend yalnızca görünürlük, yönlendirme ve UX kontrolü yapar.

Merkezi kaynaklar:

- [shared/utils/permissions.ts](/Users/suayip-isik/Documents/Github/next-admin-panel/shared/utils/permissions.ts)
- [shared/lib/authz-policy.ts](/Users/suayip-isik/Documents/Github/next-admin-panel/shared/lib/authz-policy.ts)
- [lib/auth/server-access.ts](/Users/suayip-isik/Documents/Github/next-admin-panel/lib/auth/server-access.ts)
- [shared/lib/routes.ts](/Users/suayip-isik/Documents/Github/next-admin-panel/shared/lib/routes.ts)
- [shared/hooks/use-permissions.ts](/Users/suayip-isik/Documents/Github/next-admin-panel/shared/hooks/use-permissions.ts)

## Permission Kaynağı Nasıl Çözülür?

Uygulama önce kullanıcının permission listesini bulur, sonra bu liste üzerinden tüm kontrolleri yapar.

Çözümleme sırası:

1. `/api/v1/shared/me` yanıtındaki top-level `permissions`
2. `user.role.permissions`
3. Sadece role id varsa `GET /api/v1/admin/roles/{role_id}` ile role detail yüklenmesi
4. Hiçbiri yoksa authz snapshot `unavailable`

Bu mantık hem client hem server tarafında aynıdır:

- Client çözümleme: [shared/lib/authz.ts](/Users/suayip-isik/Documents/Github/next-admin-panel/shared/lib/authz.ts)
- Server çözümleme: [lib/auth/server-access.ts](/Users/suayip-isik/Documents/Github/next-admin-panel/lib/auth/server-access.ts)

Snapshot kaynakları:

- `user.permissions`
- `role.permissions`
- `role-detail`
- `unavailable`

`unavailable` durumu önemli bir sinyaldir: kullanıcı authenticate olabilir ama permission seti çözülememiştir. Bu durumda permission-gated UI parçaları açılmaz.

## Route Erişimi Nasıl Çalışır?

Admin sayfaları server-side guard ile korunur. Sayfa dosyalarında `requireNamedPageAccess(...)` çağrısı vardır ve bu çağrı [shared/lib/authz-policy.ts](/Users/suayip-isik/Documents/Github/next-admin-panel/shared/lib/authz-policy.ts) içindeki `PAGE_ACCESS` tablosunu kullanır.

Akış şu şekildedir:

1. `requireNamedPageAccess(pageName)` çağrılır.
2. İlgili page config `adminSurface: true` ise önce `requireAdminSurface()` çalışır.
3. Sonra ilgili `all` veya `any` permission check uygulanır.
4. Yetki yoksa sayfa render edilmeden `forbidden()` ile 403 üretilir.

### Admin Surface Ne Demek?

Bu projede admin alana giriş için eski tip global bir `admin:panel_access` izni yoktur.

`requireAdminSurface()` şu mantıkla çalışır:

- `user.surface === "admin"` ise geçer
- veya kullanıcı `ADMIN_SURFACE_PERMISSIONS` listesinden en az bir izne sahipse geçer

Bu nedenle admin tarafta olabilmek için yalnızca role adına bakılmaz; somut permission'lar esas alınır.

## Sayfa Bazlı Yetki Tablosu

Bugün repoda gerçek erişim eşlemesi şöyledir:

| Route               | Named access      | Gerekli permission         |
| ------------------- | ----------------- | -------------------------- |
| `/dashboard`        | `dashboard`       | `users.read.stats` (`any`) |
| `/users`            | `usersList`       | `users.list`               |
| `/users/deleted`    | `usersDeleted`    | `users.read.deleted`       |
| `/users/[id]`       | `userDetail`      | `users.read.basic`         |
| `/roles`            | `rolesList`       | `roles.list`               |
| `/roles/[id]`       | `roleDetail`      | `roles.read.detail`        |
| `/audit-logs`       | `auditLogs`       | `audit_logs.list`          |
| `/api-keys`         | `apiKeys`         | `api_keys.list`            |
| `/notifications`    | `notifications`   | `notifications.list`       |
| `/profile`          | `profile`         | `profile.read.self`        |
| `/profile/security` | `profileSecurity` | `profile.read.self`        |

Pratik cevap:

- Bir kullanıcının `/dashboard` sayfasına girebilmesi için `users.read.stats` iznine sahip olması gerekir.

## Sidebar ve Menü Görünürlüğü

Sidebar görünürlüğü page guard'dan ayrı bir mekanizmadır. Menü öğeleri [shared/lib/routes.ts](/Users/suayip-isik/Documents/Github/next-admin-panel/shared/lib/routes.ts) içindeki `ADMIN_NAV_ITEMS` ve `PROFILE_NAV_ITEMS` listelerinden gelir.

Örnek navigation eşlemesi:

- `dashboard` menüsü: `users.read.stats`
- `users` menüsü: `users.list`
- `roles` menüsü: `roles.list`
- `auditLogs` menüsü: `audit_logs.list`
- `apiKeys` menüsü: `api_keys.list`
- `notifications` menüsü: `notifications.list`
- `profile` ve `security` menüleri: `profile.read.self`

[shared/components/layout/sidebar.tsx](/Users/suayip-isik/Documents/Github/next-admin-panel/shared/components/layout/sidebar.tsx) içinde her nav item için `usePermissionGate(item.access)` çağrılır. İzin yoksa item hiç render edilmez.

Bu yüzden bir sayfanın sidebar'da görünmemesi, route guard ile de kapalı olduğu anlamına gelir; ancak tersinin de ayrıca kontrol edildiğini unutmayın. Kullanıcı URL'yi elle yazsa bile sayfa tarafında server guard tekrar çalışır.

## Login Sonrası Yönlendirme

Login sonrası ilk gidilecek route permission listesine göre seçilir. Bu mantık [shared/lib/authz-routing.ts](/Users/suayip-isik/Documents/Github/next-admin-panel/shared/lib/authz-routing.ts) içinde bulunur.

Akış:

1. Admin ve profile nav item'ları birleştirilir.
2. Kullanıcının erişebildiği ilk nav item bulunur.
3. O route'a yönlendirme yapılır.
4. Hiç eşleşme yoksa fallback olarak `/dashboard` döner.

Burada dikkat edilmesi gereken nokta:

- Fallback route `/dashboard` olsa da, kullanıcıda `users.read.stats` yoksa page guard son aşamada 403 üretir.

Yani post-login routing ile page access aynı şey değildir.

## Component ve Action Yetkileri

UI içinde butonlar, dialog'lar ve aksiyonlar route guard'dan bağımsız olarak ayrıca korunur. Bunun için iki ana araç kullanılır:

- `usePermissionGate(...)`
- `ActionGuard`

İlgili dosyalar:

- [shared/hooks/use-permissions.ts](/Users/suayip-isik/Documents/Github/next-admin-panel/shared/hooks/use-permissions.ts)
- [shared/components/auth/action-guard.tsx](/Users/suayip-isik/Documents/Github/next-admin-panel/shared/components/auth/action-guard.tsx)

`usePermissionGate(...)` sonuç durumları:

- `loading`
- `allowed`
- `denied`
- `unavailable`

`ActionGuard`, bu sonucu kullanıp child component'i render eder veya fallback gösterir.

### Users Modülü Örnekleri

[modules/users/components/users-table.tsx](/Users/suayip-isik/Documents/Github/next-admin-panel/modules/users/components/users-table.tsx) içinde aksiyonlar ayrı ayrı gate edilir:

- detay görüntüleme: `users.read.basic`
- admin kullanıcı oluşturma: `users.create.admin`
- aktive etme: `users.activate`
- deaktive etme: `users.deactivate`
- silme: `users.delete`
- rol değiştirme: `users.update.role`

Bu şu anlama gelir:

- Kullanıcı `/users` sayfasına girebilir çünkü `users.list` izni vardır.
- Ama `users.update.role` izni yoksa aynı tabloda rol değiştirme aksiyonu görünmez.
- `users.read.basic` yoksa kullanıcı detail linki de açılmaz.

### Roles Modülü Örnekleri

[modules/roles/components/roles-table.tsx](/Users/suayip-isik/Documents/Github/next-admin-panel/modules/roles/components/roles-table.tsx) ve [modules/roles/components/role-detail-client.tsx](/Users/suayip-isik/Documents/Github/next-admin-panel/modules/roles/components/role-detail-client.tsx) içinde aksiyonlar ayrı ayrı gate edilir:

- role detail'e gitme: `roles.read.detail`
- role create: `roles.create`
- description düzenleme: `roles.update.description`
- permission set değiştirme: `roles.update.permissions`
- role silme: `roles.delete`

Bir kullanıcı `/roles` sayfasına girebilir ama `roles.create` yoksa yeni rol oluşturamaz. Aynı şekilde role detail sayfasına girebilmek için ayrıca `roles.read.detail` gerekir.

## Permission Check Helper'ları

Permission kontrolü merkezi helper'larla yapılır. Bunlar [shared/utils/permissions.ts](/Users/suayip-isik/Documents/Github/next-admin-panel/shared/utils/permissions.ts) içindedir.

Temel fonksiyonlar:

- `hasPermission(userPermissions, permission)`
- `hasAllPermissions(userPermissions, permissions)`
- `hasAnyPermission(userPermissions, permissions)`
- `matchesPermissionCheck(userPermissions, check)`

`PermissionCheck` yapısı:

```ts
interface PermissionCheck {
  all?: Permission[];
  any?: Permission[];
}
```

Kurallar:

- `all`: listedeki tüm permission'lar gerekli
- `any`: listedeki permission'lardan en az biri gerekli
- ikisi birlikte verilirse ikisi de sağlanmalı
- check verilmezse sonuç `true`

## Canonical Permission Sözlüğü

Projede kullanılan permission string'leri merkezi olarak [shared/utils/permissions.ts](/Users/suayip-isik/Documents/Github/next-admin-panel/shared/utils/permissions.ts) içinde tutulur. Yeni bir kontrol eklerken string literal'i dağınık biçimde yazmak yerine bu typed katmanı referans almak gerekir.

Başlıca alanlar:

- Profile: `profile.*`
- Uploads: `uploads.*`
- Users: `users.*`
- Roles: `roles.*`
- Audit logs: `audit_logs.*`
- API keys: `api_keys.*`
- Notifications: `notifications.*`

## Sık Sorulan Sorular

### `/dashboard` için hangi yetki gerekir?

`users.read.stats`

### Kullanıcı sayfaya girebiliyor ama neden bazı butonları göremiyor?

Çünkü route erişimi ile action yetkileri ayrı kontrol edilir. Sayfa `users.list` ile açılıyor olabilir ama iç aksiyonlar `users.update.role`, `users.delete`, `users.activate` gibi ayrı izinler ister.

### Menüde görünmeyen sayfaya kullanıcı URL'yi elle girerse ne olur?

Sidebar item'ı client-side gizlenir; ayrıca sayfa açılırken server-side `requireNamedPageAccess(...)` tekrar çalışır. Gerekli izin yoksa sayfa render edilmez, 403 döner.

### Permission kontrolü role adına göre mi yapılmalı?

Hayır. Bu projede kararlar role adına göre değil, permission listesine göre verilir.

### `/me` response'unda permission gelmezse ne olur?

Sistem önce `user.role.permissions` alanına bakar. O da yoksa role detail endpoint'inden permission setini çözmeye çalışır. Bu da başarısız olursa snapshot `unavailable` olur ve permission-gated UI açılmaz.

## Pratik Çalışma Kuralı

Bir kullanıcıya hangi yetkinin verilmesi gerektiğini belirlerken şu sırayla düşünmek en doğru yaklaşımdır:

1. Kullanıcı hangi route'a girecek?
2. O route için `PAGE_ACCESS` içinde hangi permission gerekiyor?
3. Sayfa içinde hangi aksiyonları kullanacak?
4. O aksiyonlar için ilgili component içinde hangi ek permission check'leri var?

Örnek:

- Kullanıcı `/dashboard` görecekse: `users.read.stats`
- Kullanıcı `/users` görecekse: `users.list`
- Aynı kullanıcı kullanıcı rolü de değiştirecekse buna ek olarak: `users.update.role`

Yani permission seti her zaman "sayfaya giriş" ve "sayfa içi işlem" olarak birlikte düşünülmelidir.
