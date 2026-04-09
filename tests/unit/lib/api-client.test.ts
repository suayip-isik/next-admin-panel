import { beforeEach, describe, expect, it, vi } from "vitest";

const createClientMock = vi.fn();
const waitForLocaleSwitchMock = vi.fn();

vi.mock("openapi-fetch", () => ({
  default: (...args: unknown[]) => createClientMock(...args),
}));

vi.mock("@/shared/lib/locale-switch", () => ({
  waitForLocaleSwitch: (...args: unknown[]) => waitForLocaleSwitchMock(...args),
}));

describe("apiClient middleware", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    waitForLocaleSwitchMock.mockResolvedValue(undefined);
  });

  async function loadModule() {
    const use = vi.fn();
    const client = { use };
    createClientMock.mockReturnValue(client);

    await import("@/lib/api-client");

    expect(createClientMock).toHaveBeenCalledWith({
      baseUrl: "",
      credentials: "include",
    });

    const middleware = use.mock.calls[0]?.[0];
    if (!middleware) {
      throw new Error("Expected middleware registration");
    }

    return {
      middleware: middleware as {
        onRequest: (args: { request: Request }) => Promise<Request>;
        onResponse: (args: {
          response: Response;
          request: Request;
        }) => Promise<Response>;
      },
    };
  }

  it("waits for locale switching before requests", async () => {
    const { middleware } = await loadModule();
    const request = new Request("http://localhost/api/v1/users");

    const result = await middleware.onRequest({ request });

    expect(waitForLocaleSwitchMock).toHaveBeenCalledTimes(1);
    expect(result).toBe(request);
  });

  it("returns non-401 responses unchanged", async () => {
    const { middleware } = await loadModule();
    const response = new Response(null, { status: 200 });

    const result = await middleware.onResponse({
      response,
      request: new Request("http://localhost/api/v1/users"),
    });

    expect(result).toBe(response);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("deduplicates refresh calls across concurrent 401 responses", async () => {
    const { middleware } = await loadModule();
    let resolveRefresh: ((value: Response) => void) | null = null;

    vi.mocked(fetch)
      .mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            resolveRefresh = resolve;
          }),
      )
      .mockResolvedValue(new Response(null, { status: 200 }));

    const first = middleware.onResponse({
      response: new Response(null, { status: 401 }),
      request: new Request("http://localhost/api/v1/users"),
    });
    const second = middleware.onResponse({
      response: new Response(null, { status: 401 }),
      request: new Request("http://localhost/api/v1/roles"),
    });

    await Promise.resolve();

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenNthCalledWith(1, "/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    resolveRefresh?.(new Response(null, { status: 200 }));

    const [firstRetry, secondRetry] = await Promise.all([first, second]);

    expect(waitForLocaleSwitchMock).toHaveBeenCalledTimes(3);
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      expect.any(Request),
      expect.objectContaining({ credentials: "include" }),
    );
    expect(fetch).toHaveBeenNthCalledWith(
      3,
      expect.any(Request),
      expect.objectContaining({ credentials: "include" }),
    );
    expect(firstRetry.status).toBe(200);
    expect(secondRetry.status).toBe(200);
  });

  it("retries POST requests with consumed bodies after refresh", async () => {
    const { middleware } = await loadModule();
    const request = new Request("http://localhost/api/v1/auth/reset-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        token: "reset-token",
        new_password: "NewPassword123!",
      }),
    });

    await middleware.onRequest({ request });
    await request.text();

    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }));

    const result = await middleware.onResponse({
      response: new Response(null, { status: 401 }),
      request,
    });

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenNthCalledWith(1, "/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      expect.any(Request),
      expect.objectContaining({ credentials: "include" }),
    );
    expect(result.status).toBe(200);
  });

  it("redirects to login when refresh fails outside the login page", async () => {
    const { middleware } = await loadModule();
    const originalLocation = window.location;

    Object.defineProperty(window, "location", {
      configurable: true,
      value: { href: "", pathname: "/dashboard" },
    });

    vi.mocked(fetch).mockRejectedValueOnce(new Error("refresh failed"));

    const response = new Response(null, { status: 401 });
    const result = await middleware.onResponse({
      response,
      request: new Request("http://localhost/api/v1/users"),
    });

    expect(result).toBe(response);
    expect(window.location.href).toBe("/login");

    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("does not redirect when refresh fails on the login page", async () => {
    const { middleware } = await loadModule();
    const originalLocation = window.location;

    Object.defineProperty(window, "location", {
      configurable: true,
      value: { href: "", pathname: "/login" },
    });

    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 401 }));

    const response = new Response(null, { status: 401 });
    await middleware.onResponse({
      response,
      request: new Request("http://localhost/api/v1/auth/me"),
    });

    expect(window.location.href).toBe("");

    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });
});
