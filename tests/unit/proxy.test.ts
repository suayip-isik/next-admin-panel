import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

describe("proxy", () => {
  afterEach(() => {
    vi.resetModules();
    delete process.env.AUTH_ACCESS_COOKIE_NAME;
  });

  it("passes through static asset requests", () => {
    const response = proxy(
      new NextRequest("http://localhost/_next/static/chunk.js"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-security-policy")).toContain(
      "script-src 'self' 'nonce-",
    );
  });

  it("redirects unauthenticated admin routes to login with a from parameter", () => {
    const response = proxy(new NextRequest("http://localhost/users?page=2"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost/login?from=%2Fusers%3Fpage%3D2",
    );
    expect(response.headers.get("x-frame-options")).toBe("DENY");
  });

  it("allows authenticated admin routes", () => {
    const request = new NextRequest("http://localhost/users", {
      headers: {
        cookie: "access_token=token-123",
      },
    });

    const response = proxy(request);

    expect(response.status).toBe(200);
  });

  it("does not protect auth or api routes", () => {
    const authResponse = proxy(new NextRequest("http://localhost/login"));
    const apiResponse = proxy(
      new NextRequest("http://localhost/api/auth/login"),
    );

    expect(authResponse.status).toBe(200);
    expect(apiResponse.status).toBe(200);
  });

  it("uses the env-driven access cookie name", () => {
    process.env.AUTH_ACCESS_COOKIE_NAME = "admin_access";

    const response = proxy(
      new NextRequest("http://localhost/users", {
        headers: {
          cookie: "admin_access=token-123",
        },
      }),
    );

    expect(response.status).toBe(200);
  });

  it("drops invalid redirect targets", () => {
    const response = proxy(
      new NextRequest("http://localhost//evil.example.com/path"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/login");
  });
});
