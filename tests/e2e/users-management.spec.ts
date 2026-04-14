import { expect, test } from "@playwright/test";
import {
  createCurrentUser,
  startMockFastApiServer,
} from "./helpers/mock-fastapi";

let server: Awaited<ReturnType<typeof startMockFastApiServer>> | null = null;

const ACCESS_COOKIE = "access_token=test-access-token";
const REFRESH_COOKIE = "refresh_token=test-refresh-token";

test.describe("admin flows with mocked FastAPI", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(async () => {
    server = await startMockFastApiServer();
  });

  test.afterAll(async () => {
    await server?.close();
  });

  test.beforeEach(async () => {
    server?.reset();
  });

  test("serves the dashboard for an authenticated request", async ({
    request,
  }) => {
    const response = await request.get("/dashboard", {
      headers: {
        cookie: ACCESS_COOKIE,
      },
    });

    expect(response.status()).toBe(200);
    expect(await response.text()).toContain("Dashboard");
  });

  test("logs out through the auth route", async ({ request }) => {
    const response = await request.post("/api/auth/logout", {
      headers: {
        cookie: REFRESH_COOKIE,
      },
    });

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ success: true });
  });

  test("renders the forbidden page when the user lacks page access", async ({
    request,
  }) => {
    server?.setCurrentUser(
      createCurrentUser({
        permissions: ["profile.read.self"],
        role: {
          id: "role-limited",
          name: "limited_admin",
          is_system: false,
          permissions: ["profile.read.self"],
        },
      }),
    );

    const response = await request.get("/users", {
      headers: {
        cookie: ACCESS_COOKIE,
      },
    });

    expect([200, 403]).toContain(response.status());
    expect(await response.text()).toContain("Access denied");
  });

  test("returns 401 from refresh when the backend rejects the refresh token", async ({
    request,
  }) => {
    server?.setForceRefreshFailure(true);

    const response = await request.post("/api/auth/refresh", {
      headers: {
        cookie: REFRESH_COOKIE,
      },
    });

    expect(response.status()).toBe(401);
    expect(await response.json()).toMatchObject({
      error: {
        code: "INVALID_TOKEN",
      },
    });
  });
});
