import { cookies } from "next/headers";
import { LOCALE_COOKIE_NAME, toAcceptLanguageHeader } from "@/i18n/config";

const FASTAPI_URL =
  process.env.NEXT_PUBLIC_FASTAPI_URL ?? "http://localhost:8000";

const ACCESS_TOKEN_MAX_AGE = 30 * 60;
const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60;

interface ApiErrorBody {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
  detail?: string | Array<{ msg: string; loc: unknown[] }>;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type?: string;
}

type ForwardRequestOptions = Omit<RequestInit, "headers" | "body"> & {
  headers?: HeadersInit;
  body?: BodyInit | null;
  accessToken?: string | null;
};

export interface PartialAuthResponse {
  requires_totp: true;
  partial_token: string;
}

function isTokenResponse(value: unknown): value is TokenResponse {
  if (!value || typeof value !== "object") return false;
  const body = value as Record<string, unknown>;
  return (
    typeof body.access_token === "string" &&
    typeof body.refresh_token === "string"
  );
}

export function isPartialAuthResponse(
  value: unknown,
): value is PartialAuthResponse {
  if (!value || typeof value !== "object") return false;
  const body = value as Record<string, unknown>;
  return body.requires_totp === true && typeof body.partial_token === "string";
}

function getCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export async function setAuthCookies(tokens: TokenResponse) {
  const cookieStore = await cookies();
  cookieStore.set(
    "access_token",
    tokens.access_token,
    getCookieOptions(ACCESS_TOKEN_MAX_AGE),
  );
  cookieStore.set(
    "refresh_token",
    tokens.refresh_token,
    getCookieOptions(REFRESH_TOKEN_MAX_AGE),
  );
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { detail: text };
  }
}

function createForwardHeaders(
  headersInit?: HeadersInit,
  accessToken?: string | null,
  locale?: string | null,
) {
  const headers = new Headers(headersInit);

  if (accessToken) {
    headers.set("authorization", `Bearer ${accessToken}`);
  } else {
    headers.delete("authorization");
  }

  headers.delete("cookie");
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");
  headers.delete("accept-language");

  const acceptLanguage = toAcceptLanguageHeader(locale);
  if (acceptLanguage) {
    headers.set("accept-language", acceptLanguage);
  }

  return headers;
}

async function getLocaleFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get(LOCALE_COOKIE_NAME)?.value ?? null;
}

async function buildForwardInit(
  init: ForwardRequestOptions,
): Promise<RequestInit> {
  const locale = await getLocaleFromCookies();
  const headers = createForwardHeaders(init.headers, init.accessToken, locale);
  const requestInit: RequestInit & { duplex?: "half" } = {
    ...init,
    headers,
    cache: "no-store",
  };

  if (!headers.has("content-type") && typeof init.body === "string") {
    headers.set("content-type", "application/json");
  }

  if (init.body !== undefined) {
    requestInit.body = init.body;
  }

  if (init.body instanceof ReadableStream) {
    requestInit.duplex = "half";
  }

  return requestInit;
}

export async function forwardToFastApi(
  path: string,
  init: ForwardRequestOptions,
): Promise<Response> {
  return fetch(`${FASTAPI_URL}${path}`, await buildForwardInit(init));
}

export async function proxyApiRequestToFastApi(
  request: Request,
  path: string,
): Promise<Response> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value ?? null;
  const url = new URL(request.url);
  const upstreamPath = `${path}${url.search}`;
  const method = request.method;
  const body =
    method === "GET" || method === "HEAD" ? undefined : (request.body ?? null);

  const upstreamResponse = await forwardToFastApi(upstreamPath, {
    method,
    headers: request.headers,
    body,
    accessToken,
    redirect: "manual",
  });

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: new Headers(upstreamResponse.headers),
  });
}

export async function createJsonProxyResponse(response: Response) {
  const body = await parseResponseBody(response);
  return Response.json(body, { status: response.status });
}

export function createInternalAuthErrorResponse(
  status: number,
  code: string,
  details?: unknown,
) {
  return Response.json(
    {
      error: {
        code,
        ...(details === undefined ? {} : { details }),
      },
    },
    { status },
  );
}

export async function exchangeTokens(
  path: string,
  payload: unknown,
): Promise<Response> {
  const response = await forwardToFastApi(path, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const body = await parseResponseBody(response);

  if (!response.ok) {
    return Response.json((body ?? {}) as ApiErrorBody, {
      status: response.status,
    });
  }

  return finalizeAuthResponse(body);
}

export async function finalizeAuthResponse(body: unknown): Promise<Response> {
  if (!isTokenResponse(body)) {
    return createInternalAuthErrorResponse(502, "INVALID_AUTH_RESPONSE", body);
  }

  await setAuthCookies(body);

  return Response.json({ success: true });
}

export async function getRefreshTokenFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get("refresh_token")?.value ?? null;
}
