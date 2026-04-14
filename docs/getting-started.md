# Başlangıç Rehberi

Bu belgeyi repo'yu ilk kez açtığınızda, fork aldığınızda veya bu template'i yeni bir ürüne dönüştürmeye başladığınızda okuyun.

## Bu Rehberin Amacı

Bu rehber, sıfırdan gelen bir geliştiricinin şu sorularına doğrudan cevap verir:

- Bu repo'yu fork mu etmeliyim, template olarak mı kullanmalıyım?
- Yerelde nasıl çalıştırırım?
- Backend olmadan ne kadar ilerleyebilirim?
- İlk gün hangi değerleri değiştirmeliyim?
- İlk doğrulamayı hangi komutlarla yapmalıyım?

## Hangi Başlangıç Yolu Doğru?

### `Use this template` veya repo kopyası

Şu durumda tercih edin:

- kendi ürününüzü bu repo üzerine kuracaksanız
- upstream commit geçmişini taşımak zorunlu değilse
- proje adı, branding, deploy ve backend entegrasyonu size ait olacaksa

### Fork

Şu durumda tercih edin:

- upstream repo ile bağınızı korumak istiyorsanız
- upstream'e pull request açacaksanız
- ileride upstream değişikliklerini cherry-pick veya merge ile takip etmeyi düşünüyorsanız

## İlk Kurulum

### 1. Gereksinimleri doğrulayın

- Node.js 20+
- `pnpm` 10+
- erişilebilir bir FastAPI backend

Repo kökündeki `.nvmrc`, beklenen Node sürüm ailesini gösterir.

### 2. Bağımlılıkları kurun

```bash
pnpm install
```

### 3. Environment dosyasını oluşturun

```bash
cp .env.example .env.local
```

İsterseniz aynı işi aşağıdaki script ile de yapabilirsiniz:

```bash
pnpm env:init
```

### 4. Minimum değerleri doldurun

Yerelde en azından şunları kontrol edin:

- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_APP_SHORT_NAME`
- `NEXT_PUBLIC_FASTAPI_URL`
- gerekirse `OPENAPI_SCHEMA_URL`

### 5. Environment sözleşmesini doğrulayın

```bash
pnpm env:check
```

### 6. Uygulamayı başlatın

```bash
pnpm dev
```

Varsayılan URL'ler:

- app: `http://127.0.0.1:3000`
- backend: `http://127.0.0.1:8000`

## İlk Açılışta Beklenen Davranış

Session yoksa tipik akış şu şekildedir:

1. `/` route'u `/dashboard` adresine yönlendirir.
2. `proxy.ts`, korumalı route'larda access token cookie'si görmezse sizi `/login?from=...` adresine taşır.
3. Geçerli login sonrası kullanıcı dashboard veya yetkili olduğu ilk admin route'una gider.

Backend erişilemiyorsa:

- login isteği başarısız olur
- kullanıcı listesi, dashboard kartları ve diğer veri ekranları yüklenmez
- `pnpm generate:types` çalışmaz

## İlk Gün Yapılacaklar

Template tüketicileri için önerilen sıra:

1. README ve proje adını kendi ürününüze göre güncelleyin.
2. `.env.local` içinde branding alanlarını değiştirin.
3. `NEXT_PUBLIC_FASTAPI_URL` değerini gerçek backend origin'inize bağlayın.
4. Gerekirse `OPENAPI_SCHEMA_URL` ile admin şema adresini override edin.
5. `pnpm env:check` çalıştırın.
6. `pnpm test:unit` ve `pnpm build` ile taban sağlık kontrolü yapın.
7. Backend şeması hazırsa `pnpm generate:types` çalıştırın.

## Backend Olmadan Ne Kadar İlerlenir?

Backend olmadan şunları yapabilirsiniz:

- proje yapısını incelemek
- UI bileşenlerini geliştirmek
- mevcut unit testleri çalıştırmak
- mock tabanlı e2e akışları çalıştırmak

Backend olmadan şunlar eksik kalır:

- gerçek login
- gerçek kullanıcı, rol, bildirim ve audit log verileri
- OpenAPI tip üretimi
- gerçek entegrasyon doğrulaması

## İlk Doğrulama Checklist'i

Fork veya kopya sonrası minimum kontrol:

```bash
pnpm env:check
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm build
```

Ayrıca şu kontrolleri gözle doğrulayın:

- `/login` açılıyor mu
- tema ve locale değiştirici görünüyor mu
- backend bağlıysa login tamamlanıyor mu
- korumalı route'lar session yokken login'e düşüyor mu

## Sonraki Belgeler

- branding ve ürünleştirme için: [Özelleştirme Rehberi](customization.md)
- beklenen backend yüzeyi için: [Backend Kontratı](backend-contract.md)
- env alanları için: [Environment Rehberi](environment.md)
- günlük geliştirme için: [Geliştirme Rehberi](development.md)
- sorun yaşarsanız: [Troubleshooting](troubleshooting.md)
