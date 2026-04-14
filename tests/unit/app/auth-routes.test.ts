import { beforeEach, describe, expect, it, vi } from "vitest";
import { cookies } from "next/headers";
import { POST as loginPost } from "@/app/api/auth/login/route";
import { POST as refreshPost } from "@/app/api/auth/refresh/route";
import { POST as logoutPost } from "@/app/api/auth/logout/route";
import { POST as totpPost } from "@/app/api/auth/totp/route";

type CookieStore = {
  get: ReturnType<typeof vi.fn>;
  getAll: ReturnType<typeof vi.fn>;
  has: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  size: number;
  [Symbol.iterator]: () => IterableIterator<never>;
};

function createCookieStore(): CookieStore {
  return {
    get: vi.fn(),
    getAll: vi.fn(() => []),
    has: vi.fn(() => false),
    set: vi.fn(),
    delete: vi.fn(),
    size: 0,
    [Symbol.iterator]: function* () {
      return;
    },
  };
}

describe("auth route handlers", () => {
  let cookieStore: CookieStore;

  beforeEach(() => {
    vi.clearAllMocks();
    cookieStore = createCookieStore();
    vi.mocked(cookies).mockResolvedValue(cookieStore as never);
    delete process.env.AUTH_ACCESS_COOKIE_NAME;
    delete process.env.AUTH_REFRESH_COOKIE_NAME;
    delete process.env.AUTH_COOKIE_PATH;
    delete process.env.AUTH_COOKIE_SAME_SITE;
    delete process.env.AUTH_COOKIE_SECURE;
    delete process.env.AUTH_ACCESS_TOKEN_MAX_AGE_SECONDS;
    delete process.env.AUTH_REFRESH_TOKEN_MAX_AGE_SECONDS;
  });

  it("stores auth cookies when login returns tokens", async () => {
    cookieStore.get.mockImplementation((name: string) => {
      if (name === "NEXT_LOCALE") return { value: "tr" };
      return undefined;
    });

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          access_token: "access-1",
          refresh_token: "refresh-1",
          token_type: "bearer",
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );

    const response = await loginPost(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: "user@example.com",
          password: "Secret123!",
        }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
    expect(response.headers.get("cache-control")).toBe("no-store, max-age=0");
    const [, init] = vi.mocked(fetch).mock.calls[0]!;
    expect(new Headers(init?.headers).get("accept-language")).toBe("tr");
    expect(cookieStore.set).toHaveBeenCalledTimes(2);
    expect(cookieStore.set).toHaveBeenCalledWith(
      "access_token",
      "access-1",
      expect.objectContaining({
        httpOnly: true,
        path: "/",
      }),
    );
    expect(cookieStore.set).toHaveBeenCalledWith(
      "refresh_token",
      "refresh-1",
      expect.objectContaining({
        httpOnly: true,
        path: "/",
      }),
    );
  });

  it("returns partial auth response without setting cookies", async () => {
    cookieStore.get.mockImplementation((name: string) => {
      if (name === "NEXT_LOCALE") return { value: "en" };
      return undefined;
    });

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          requires_totp: true,
          partial_token: "partial-1",
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );

    const response = await loginPost(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: "user@example.com",
          password: "Secret123!",
        }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      requires_totp: true,
      partial_token: "partial-1",
    });
    expect(response.headers.get("cache-control")).toBe("no-store, max-age=0");
    const [, init] = vi.mocked(fetch).mock.calls[0]!;
    expect(new Headers(init?.headers).get("accept-language")).toBeNull();
    expect(cookieStore.set).not.toHaveBeenCalled();
  });

  it("clears cookies and returns 401 when refresh token is missing", async () => {
    cookieStore.get.mockReturnValue(undefined);

    const response = await refreshPost();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "UNAUTHENTICATED",
      },
    });
    expect(response.headers.get("pragma")).toBe("no-cache");
    expect(fetch).not.toHaveBeenCalled();
    expect(cookieStore.delete).toHaveBeenCalledWith("access_token");
    expect(cookieStore.delete).toHaveBeenCalledWith("refresh_token");
  });

  it("updates cookies when refresh succeeds", async () => {
    cookieStore.get.mockImplementation((name: string) => {
      if (name === "NEXT_LOCALE") return { value: "tr" };
      if (name === "refresh_token") return { value: "refresh-1" };
      return undefined;
    });

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          access_token: "access-2",
          refresh_token: "refresh-2",
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );

    const response = await refreshPost();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
    expect(response.headers.get("cache-control")).toBe("no-store, max-age=0");
    const [, init] = vi.mocked(fetch).mock.calls[0]!;
    expect(new Headers(init?.headers).get("accept-language")).toBe("tr");
    expect(cookieStore.set).toHaveBeenCalledTimes(2);
  });

  it("clears cookies after logout even if backend call succeeds", async () => {
    cookieStore.get.mockImplementation((name: string) => {
      if (name === "NEXT_LOCALE") return { value: "tr" };
      if (name === "refresh_token") return { value: "refresh-1" };
      return undefined;
    });

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "ok" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const response = await logoutPost();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
    expect(response.headers.get("cache-control")).toBe("no-store, max-age=0");
    const [, init] = vi.mocked(fetch).mock.calls[0]!;
    expect(new Headers(init?.headers).get("accept-language")).toBe("tr");
    expect(cookieStore.delete).toHaveBeenCalledWith("access_token");
    expect(cookieStore.delete).toHaveBeenCalledWith("refresh_token");
  });

  it("returns success after logout when refresh token is missing", async () => {
    cookieStore.get.mockReturnValue(undefined);

    const response = await logoutPost();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
    expect(response.headers.get("cache-control")).toBe("no-store, max-age=0");
    expect(fetch).not.toHaveBeenCalled();
    expect(cookieStore.delete).toHaveBeenCalledWith("access_token");
    expect(cookieStore.delete).toHaveBeenCalledWith("refresh_token");
  });

  it("returns success after logout when backend rejects the token", async () => {
    cookieStore.get.mockImplementation((name: string) => {
      if (name === "NEXT_LOCALE") return { value: "en" };
      if (name === "refresh_token") return { value: "refresh-1" };
      return undefined;
    });

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          error: {
            code: "INVALID_TOKEN",
            message: "Refresh token is invalid.",
          },
        }),
        {
          status: 401,
          headers: { "content-type": "application/json" },
        },
      ),
    );

    const response = await logoutPost();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
    expect(response.headers.get("cache-control")).toBe("no-store, max-age=0");
    const [, init] = vi.mocked(fetch).mock.calls[0]!;
    expect(new Headers(init?.headers).get("accept-language")).toBeNull();
    expect(cookieStore.delete).toHaveBeenCalledWith("access_token");
    expect(cookieStore.delete).toHaveBeenCalledWith("refresh_token");
  });

  it("returns success after logout when backend call throws", async () => {
    cookieStore.get.mockImplementation((name: string) => {
      if (name === "NEXT_LOCALE") return { value: "tr" };
      if (name === "refresh_token") return { value: "refresh-1" };
      return undefined;
    });

    vi.mocked(fetch).mockRejectedValueOnce(new Error("Network error"));

    const response = await logoutPost();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
    expect(response.headers.get("cache-control")).toBe("no-store, max-age=0");
    expect(cookieStore.delete).toHaveBeenCalledWith("access_token");
    expect(cookieStore.delete).toHaveBeenCalledWith("refresh_token");
  });

  it("forwards locale for totp exchange requests", async () => {
    cookieStore.get.mockImplementation((name: string) => {
      if (name === "NEXT_LOCALE") return { value: "tr" };
      return undefined;
    });

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          access_token: "access-3",
          refresh_token: "refresh-3",
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );

    const response = await totpPost(
      new Request("http://localhost/api/auth/totp", {
        method: "POST",
        body: JSON.stringify({
          partial_token: "partial-1",
          code: "123456",
        }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
    expect(response.headers.get("cache-control")).toBe("no-store, max-age=0");
    const [, init] = vi.mocked(fetch).mock.calls[0]!;
    expect(new Headers(init?.headers).get("accept-language")).toBe("tr");
    expect(cookieStore.set).toHaveBeenCalledTimes(2);
  });

  it("uses env-driven cookie names and options", async () => {
    process.env.AUTH_ACCESS_COOKIE_NAME = "admin_access";
    process.env.AUTH_REFRESH_COOKIE_NAME = "admin_refresh";
    process.env.AUTH_COOKIE_PATH = "/console";
    process.env.AUTH_COOKIE_SAME_SITE = "strict";
    process.env.AUTH_COOKIE_SECURE = "true";
    process.env.AUTH_ACCESS_TOKEN_MAX_AGE_SECONDS = "1200";
    process.env.AUTH_REFRESH_TOKEN_MAX_AGE_SECONDS = "7200";

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          access_token: "access-9",
          refresh_token: "refresh-9",
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );

    await loginPost(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: "user@example.com",
          password: "Secret123!",
        }),
      }),
    );

    expect(cookieStore.set).toHaveBeenCalledWith(
      "admin_access",
      "access-9",
      expect.objectContaining({
        path: "/console",
        sameSite: "strict",
        secure: true,
        maxAge: 1200,
      }),
    );
    expect(cookieStore.set).toHaveBeenCalledWith(
      "admin_refresh",
      "refresh-9",
      expect.objectContaining({
        path: "/console",
        sameSite: "strict",
        secure: true,
        maxAge: 7200,
      }),
    );
  });
});
