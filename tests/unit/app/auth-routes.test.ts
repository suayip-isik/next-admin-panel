import { beforeEach, describe, expect, it, vi } from "vitest";
import { cookies } from "next/headers";
import { POST as loginPost } from "@/app/api/auth/login/route";
import { POST as refreshPost } from "@/app/api/auth/refresh/route";
import { POST as logoutPost } from "@/app/api/auth/logout/route";

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
  });

  it("stores auth cookies when login returns tokens", async () => {
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
    expect(cookieStore.set).not.toHaveBeenCalled();
  });

  it("clears cookies and returns 401 when refresh token is missing", async () => {
    cookieStore.get.mockReturnValue(undefined);

    const response = await refreshPost();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "UNAUTHENTICATED",
        message: "Refresh token is missing.",
      },
    });
    expect(fetch).not.toHaveBeenCalled();
    expect(cookieStore.delete).toHaveBeenCalledWith("access_token");
    expect(cookieStore.delete).toHaveBeenCalledWith("refresh_token");
  });

  it("updates cookies when refresh succeeds", async () => {
    cookieStore.get.mockImplementation((name: string) => {
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
    expect(cookieStore.set).toHaveBeenCalledTimes(2);
  });

  it("clears cookies after logout even if backend call succeeds", async () => {
    cookieStore.get.mockImplementation((name: string) => {
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
    expect(cookieStore.delete).toHaveBeenCalledWith("access_token");
    expect(cookieStore.delete).toHaveBeenCalledWith("refresh_token");
  });
});
