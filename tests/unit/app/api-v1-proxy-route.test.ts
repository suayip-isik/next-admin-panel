import { beforeEach, describe, expect, it, vi } from "vitest";
import { cookies } from "next/headers";
import {
  GET as proxyGet,
  POST as proxyPost,
} from "@/app/api/v1/[...path]/route";

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

describe("/api/v1 catch-all proxy route", () => {
  let cookieStore: CookieStore;

  beforeEach(() => {
    vi.clearAllMocks();
    cookieStore = createCookieStore();
    vi.mocked(cookies).mockResolvedValue(cookieStore as never);
  });

  it("injects bearer auth from the access token cookie", async () => {
    cookieStore.get.mockImplementation((name: string) => {
      if (name === "access_token") return { value: "access-1" };
      return undefined;
    });

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const response = await proxyGet(
      new Request("http://localhost/api/v1/users?role=admin"),
      { params: Promise.resolve({ path: ["users"] }) },
    );

    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, init] = vi.mocked(fetch).mock.calls[0]!;
    expect(url).toBe("http://localhost:8000/api/v1/users?role=admin");
    expect(new Headers(init?.headers).get("authorization")).toBe(
      "Bearer access-1",
    );
    expect(new Headers(init?.headers).get("cookie")).toBeNull();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it("forwards unauthenticated requests without an authorization header", async () => {
    cookieStore.get.mockReturnValue(undefined);

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ detail: "Unauthorized" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      }),
    );

    const response = await proxyGet(
      new Request("http://localhost/api/v1/users/me"),
      { params: Promise.resolve({ path: ["users", "me"] }) },
    );

    const [, init] = vi.mocked(fetch).mock.calls[0]!;
    expect(new Headers(init?.headers).get("authorization")).toBeNull();
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ detail: "Unauthorized" });
  });

  it("forwards json request bodies unchanged", async () => {
    cookieStore.get.mockImplementation((name: string) => {
      if (name === "access_token") return { value: "access-2" };
      return undefined;
    });

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ updated: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const request = new Request("http://localhost/api/v1/users/me", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ full_name: "Ada" }),
    });

    const response = await proxyPost(request, {
      params: Promise.resolve({ path: ["users", "me"] }),
    });

    const [, init] = vi.mocked(fetch).mock.calls[0]!;
    expect(init?.method).toBe("POST");
    expect(new Headers(init?.headers).get("content-type")).toBe(
      "application/json",
    );
    expect(init?.body).toBeInstanceOf(ReadableStream);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ updated: true });
  });

  it("preserves multipart content types for upload requests", async () => {
    cookieStore.get.mockImplementation((name: string) => {
      if (name === "access_token") return { value: "access-3" };
      return undefined;
    });

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "uploaded" }), {
        status: 201,
        headers: { "content-type": "application/json" },
      }),
    );

    const request = new Request("http://localhost/api/v1/uploads", {
      method: "POST",
      headers: {
        "content-type": "multipart/form-data; boundary=test-boundary",
      },
      body: "--test-boundary\r\ncontent\r\n--test-boundary--",
    });

    await proxyPost(request, {
      params: Promise.resolve({ path: ["uploads"] }),
    });

    const [, init] = vi.mocked(fetch).mock.calls[0]!;
    expect(new Headers(init?.headers).get("content-type")).toContain(
      "multipart/form-data",
    );
    expect(new Headers(init?.headers).get("authorization")).toBe(
      "Bearer access-3",
    );
  });

  it("passes through non-json upstream responses", async () => {
    cookieStore.get.mockImplementation((name: string) => {
      if (name === "access_token") return { value: "access-4" };
      return undefined;
    });

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response("plain-text-error", {
        status: 502,
        headers: { "content-type": "text/plain" },
      }),
    );

    const response = await proxyGet(
      new Request("http://localhost/api/v1/audit-logs/stream"),
      { params: Promise.resolve({ path: ["audit-logs", "stream"] }) },
    );

    expect(response.status).toBe(502);
    expect(response.headers.get("content-type")).toBe("text/plain");
    await expect(response.text()).resolves.toBe("plain-text-error");
  });
});
