import { getAppUrl, getDeployEnvironment, getPublicEnv } from "@/lib/env";

const HSTS_HEADER_VALUE = "max-age=63072000; includeSubDomains; preload";
const PAGE_RESPONSE_HEADER_NAMES = [
  "content-security-policy",
  "referrer-policy",
  "x-content-type-options",
  "x-frame-options",
  "permissions-policy",
  "cross-origin-opener-policy",
  "strict-transport-security",
] as const;
const API_RESPONSE_HEADER_NAMES = [
  "cache-control",
  "pragma",
  "expires",
  "x-content-type-options",
  "referrer-policy",
  "x-frame-options",
  "permissions-policy",
  "cross-origin-opener-policy",
] as const;
const FORWARDED_REQUEST_HEADER_ALLOWLIST = new Set([
  "accept",
  "content-type",
  "content-disposition",
  "if-match",
  "if-none-match",
  "if-modified-since",
  "if-unmodified-since",
  "range",
]);
const FORWARDED_RESPONSE_HEADER_ALLOWLIST = new Set([
  "content-type",
  "content-length",
  "content-disposition",
  "cache-control",
  "etag",
  "last-modified",
  "vary",
  "www-authenticate",
]);

function isDevelopment() {
  return process.env.NODE_ENV !== "production";
}

function isProductionLike() {
  return getDeployEnvironment() === "production";
}

function shouldEnableHsts() {
  return isProductionLike() && getAppUrl().startsWith("https://");
}

function getSentryConnectSource() {
  const sentryDsn = getPublicEnv().sentryDsn;
  if (!sentryDsn) {
    return null;
  }

  try {
    return new URL(sentryDsn).origin;
  } catch {
    return null;
  }
}

export function createCspNonce() {
  return Buffer.from(crypto.randomUUID()).toString("base64");
}

export function buildContentSecurityPolicy(nonce: string) {
  const sentryOrigin = getSentryConnectSource();
  const connectSrc = ["'self'"];

  if (sentryOrigin) {
    connectSrc.push(sentryOrigin);
  }

  if (isDevelopment()) {
    connectSrc.push("http:", "https:", "ws:", "wss:");
  }

  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${
      isDevelopment() ? " 'unsafe-eval'" : ""
    }`,
    `style-src 'self' 'nonce-${nonce}'`,
    "img-src 'self' blob: data:",
    "font-src 'self' data:",
    `connect-src ${connectSrc.join(" ")}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "frame-src 'none'",
  ];

  if (isProductionLike()) {
    directives.push("upgrade-insecure-requests");
  }

  return directives.join("; ");
}

export function applyPageSecurityHeaders(
  headers: Headers,
  options: {
    nonce: string;
  },
) {
  const csp = buildContentSecurityPolicy(options.nonce);

  headers.set("Content-Security-Policy", csp);
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set(
    "Permissions-Policy",
    [
      "accelerometer=()",
      "camera=()",
      "geolocation=()",
      "gyroscope=()",
      "magnetometer=()",
      "microphone=()",
      "payment=()",
      "usb=()",
      "fullscreen=(self)",
    ].join(", "),
  );
  headers.set("Cross-Origin-Opener-Policy", "same-origin");

  if (shouldEnableHsts()) {
    headers.set("Strict-Transport-Security", HSTS_HEADER_VALUE);
  }
}

export function createPageSecurityHeaders(nonce: string) {
  const headers = new Headers();
  applyPageSecurityHeaders(headers, { nonce });
  return headers;
}

export function getPageSecurityHeaderNames() {
  return PAGE_RESPONSE_HEADER_NAMES;
}

export function applyNoStoreApiHeaders(headers: Headers) {
  headers.set("Cache-Control", "no-store, max-age=0");
  headers.set("Pragma", "no-cache");
  headers.set("Expires", "0");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "no-referrer");
  headers.set("X-Frame-Options", "DENY");
  headers.set(
    "Permissions-Policy",
    "accelerometer=(), camera=(), geolocation=(), microphone=()",
  );
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
}

export function withNoStoreApiHeaders(response: Response) {
  const headers = new Headers(response.headers);
  applyNoStoreApiHeaders(headers);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function getApiSecurityHeaderNames() {
  return API_RESPONSE_HEADER_NAMES;
}

export function createForwardHeaders(
  headersInit?: HeadersInit,
  options?: {
    accessToken?: string | null;
    locale?: string | null;
  },
) {
  const headers = new Headers();
  const incoming = new Headers(headersInit);

  for (const [key, value] of incoming.entries()) {
    const normalizedKey = key.toLowerCase();
    if (FORWARDED_REQUEST_HEADER_ALLOWLIST.has(normalizedKey)) {
      headers.set(normalizedKey, value);
    }
  }

  if (options?.accessToken) {
    headers.set("authorization", `Bearer ${options.accessToken}`);
  }

  if (options?.locale) {
    headers.set("accept-language", options.locale);
  }

  return headers;
}

export function filterUpstreamResponseHeaders(headersInit: HeadersInit) {
  const safeHeaders = new Headers();
  const headers = new Headers(headersInit);

  for (const [key, value] of headers.entries()) {
    if (FORWARDED_RESPONSE_HEADER_ALLOWLIST.has(key.toLowerCase())) {
      safeHeaders.set(key, value);
    }
  }

  return safeHeaders;
}
