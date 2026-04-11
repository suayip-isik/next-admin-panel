import { cookies } from "next/headers";
import { getAuthCookieConfig, getFastApiUrl } from "@/lib/env";
import { LOCALE_COOKIE_NAME, toAcceptLanguageHeader } from "@/i18n/config";

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
  const authEnv = getAuthCookieConfig();

  return {
    httpOnly: true,
    sameSite: authEnv.cookieSameSite,
    secure: authEnv.cookieSecure,
    path: authEnv.cookiePath,
    maxAge,
  };
}

export async function setAuthCookies(tokens: TokenResponse) {
  const authEnv = getAuthCookieConfig();
  const cookieStore = await cookies();
  cookieStore.set(
    authEnv.accessCookieName,
    tokens.access_token,
    getCookieOptions(authEnv.accessTokenMaxAgeSeconds),
  );
  cookieStore.set(
    authEnv.refreshCookieName,
    tokens.refresh_token,
    getCookieOptions(authEnv.refreshTokenMaxAgeSeconds),
  );
}

export async function clearAuthCookies() {
  const authEnv = getAuthCookieConfig();
  const cookieStore = await cookies();
  cookieStore.delete(authEnv.accessCookieName);
  cookieStore.delete(authEnv.refreshCookieName);
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
  return fetch(`${getFastApiUrl()}${path}`, await buildForwardInit(init));
}

export async function proxyApiRequestToFastApi(
  request: Request,
  path: string,
): Promise<Response> {
  const authEnv = getAuthCookieConfig();
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(authEnv.accessCookieName)?.value ?? null;
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
  const authEnv = getAuthCookieConfig();
  const cookieStore = await cookies();
  return cookieStore.get(authEnv.refreshCookieName)?.value ?? null;
}
