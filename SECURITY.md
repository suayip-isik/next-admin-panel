# Security Policy

## Supported Versions

Güvenlik düzeltmeleri aktif `main` branch'i ve en güncel release tag'i için ele alınır.

## Security Posture

Bu repo şu güvenlik desenlerini uygular:

- auth token'ları `httpOnly` cookie'lerde tutulur
- tarayıcı, backend'e çoğunlukla Next.js proxy katmanı üzerinden erişir
- refresh token akışı server tarafında yönetilir
- route koruması `proxy.ts` ile uygulanır
- security header seti ve CSP merkezi olarak uygulanır
- auth ve API route yanıtları cache dışı (`no-store`) tutulur

Bu önlemler saldırı yüzeyini azaltır, ancak güvenlik yalnızca frontend ile garanti edilmez; backend doğrulamaları ve deployment ayarları da kritik önemdedir.

Production deploy için minimum beklenti:

- `NEXT_PUBLIC_APP_URL` https olmalıdır
- `AUTH_COOKIE_SECURE=true` olmalıdır
- `AUTH_COOKIE_SAME_SITE=none` ise `AUTH_COOKIE_SECURE=true` olmalıdır

## Reporting a Vulnerability

Hassas güvenlik açıkları için public issue açmayın.

Şunları içeren özel rapor paylaşın:

- etki ve şiddet
- yeniden üretim adımları
- etkilenen route, modül veya endpoint ailesi
- varsa geçici çözüm veya mitigasyon önerisi

Raporlama kanalı olarak GitHub Security Advisories veya maintainer iletişim kanalı kullanılmalıdır.

## Response Targets

- ilk dönüş: 3 iş günü içinde
- triage kararı: 5 iş günü içinde
- düzeltme planı veya workaround: etki doğrulanınca mümkün olan en kısa sürede
