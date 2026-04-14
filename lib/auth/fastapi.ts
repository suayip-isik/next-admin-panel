import { cookies } from "next/headers";
import { getFastApiUrl } from "@/lib/env";
import { LOCALE_COOKIE_NAME, toAcceptLanguageHeader } from "@/i18n/config";
import { getAccessTokenFromCookies } from "@/lib/auth/cookies";
import {
  createForwardHeaders,
  filterUpstreamResponseHeaders,
  withNoStoreApiHeaders,
} from "@/lib/security";

type ForwardRequestOptions = Omit<RequestInit, "headers" | "body"> & {
  headers?: HeadersInit;
  body?: BodyInit | null;
  accessToken?: string | null;
};

async function parseResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { detail: text };
  }
}

async function getLocaleFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get(LOCALE_COOKIE_NAME)?.value ?? null;
}

async function buildForwardInit(
  init: ForwardRequestOptions,
): Promise<RequestInit> {
  const locale = await getLocaleFromCookies();
  const headers = createForwardHeaders(init.headers, {
    accessToken: init.accessToken,
    locale: toAcceptLanguageHeader(locale),
  });
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
  const accessToken = await getAccessTokenFromCookies();
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

  const response = new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: filterUpstreamResponseHeaders(upstreamResponse.headers),
  });

  return withNoStoreApiHeaders(response);
}

export async function createJsonProxyResponse(response: Response) {
  const body = await parseResponseBody(response);
  if ([204, 205, 304].includes(response.status)) {
    return withNoStoreApiHeaders(
      new Response(null, { status: response.status }),
    );
  }

  return withNoStoreApiHeaders(
    Response.json(body, { status: response.status }),
  );
}
