import { beforeEach, describe, expect, it, vi } from "vitest";
import { cookies } from "next/headers";
import {
  createJsonProxyResponse,
  forwardToFastApi,
  proxyApiRequestToFastApi,
} from "@/lib/auth/fastapi";

vi.mock("@/lib/env", () => ({
  getFastApiUrl: vi.fn(() => "https://api.example.com"),
}));

vi.mock("@/i18n/config", () => ({
  LOCALE_COOKIE_NAME: "NEXT_LOCALE",
  toAcceptLanguageHeader: vi.fn((locale: string | null) => locale),
}));

vi.mock("@/lib/auth/cookies", () => ({
  getAccessTokenFromCookies: vi.fn(),
}));

type CookieStore = {
  get: ReturnType<typeof vi.fn>;
};

describe("fastapi helpers", () => {
  let cookieStore: CookieStore;

  beforeEach(() => {
    vi.clearAllMocks();
    cookieStore = {
      get: vi.fn(),
    };
    vi.mocked(cookies).mockResolvedValue(cookieStore as never);
  });

  it("forwards requests with auth and locale headers", async () => {
    cookieStore.get.mockReturnValue({ value: "tr" });
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 204 }));

    await forwardToFastApi("/api/v1/test", {
      method: "POST",
      body: JSON.stringify({ ok: true }),
      accessToken: "access-1",
    });

    expect(fetch).toHaveBeenCalledWith(
      "https://api.example.com/api/v1/test",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ ok: true }),
        cache: "no-store",
        headers: expect.any(Headers),
      }),
    );

    const [, init] = vi.mocked(fetch).mock.calls[0]!;
    const headers = init?.headers as Headers;
    expect(headers.get("authorization")).toBe("Bearer access-1");
    expect(headers.get("accept-language")).toBe("tr");
    expect(headers.get("content-type")).toBe("application/json");
  });

  it("proxies upstream requests and applies no-store response headers", async () => {
    cookieStore.get.mockReturnValue({ value: "en" });

    const { getAccessTokenFromCookies } = await import("@/lib/auth/cookies");
    vi.mocked(getAccessTokenFromCookies).mockResolvedValue("access-1");

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response("created", {
        status: 201,
        statusText: "Created",
        headers: {
          "content-type": "text/plain",
          "x-internal": "blocked",
        },
      }),
    );

    const response = await proxyApiRequestToFastApi(
      new Request("http://localhost/api/v1/users?page=2", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-custom": "blocked",
        },
        body: JSON.stringify({ name: "Ada" }),
      }),
      "/api/v1/users",
    );

    expect(response.status).toBe(201);
    expect(response.headers.get("content-type")).toBe("text/plain");
    expect(response.headers.get("x-internal")).toBeNull();
    expect(response.headers.get("cache-control")).toBe("no-store, max-age=0");
    await expect(response.text()).resolves.toBe("created");

    const [, init] = vi.mocked(fetch).mock.calls[0]!;
    const headers = init?.headers as Headers;
    expect(headers.get("authorization")).toBe("Bearer access-1");
    expect(headers.get("content-type")).toBe("application/json");
    expect(headers.get("x-custom")).toBeNull();
  });

  it("creates json proxy responses for empty and text upstream bodies", async () => {
    const emptyBodyResponse = await createJsonProxyResponse(
      new Response(null, { status: 204 }),
    );
    expect(emptyBodyResponse.status).toBe(204);
    await expect(emptyBodyResponse.text()).resolves.toBe("");

    const textResponse = await createJsonProxyResponse(
      new Response("upstream failed", { status: 502 }),
    );
    expect(textResponse.status).toBe(502);
    expect(textResponse.headers.get("cache-control")).toBe(
      "no-store, max-age=0",
    );
    await expect(textResponse.json()).resolves.toEqual({
      detail: "upstream failed",
    });
  });
});
