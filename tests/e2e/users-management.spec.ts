import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { expect, test } from "@playwright/test";

const MOCK_FASTAPI_HOST = "127.0.0.1";
const MOCK_FASTAPI_PORT = 8000;

let createdPayload: Record<string, unknown> | null = null;
let server: Awaited<ReturnType<typeof startMockFastApiServer>> | null = null;

function sendJson(response: ServerResponse, status: number, body: unknown) {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

function readJsonBody(request: IncomingMessage) {
  return new Promise<Record<string, unknown>>((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk.toString();
    });
    request.on("end", () => {
      try {
        resolve(body ? (JSON.parse(body) as Record<string, unknown>) : {});
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

async function startMockFastApiServer() {
  const httpServer = createServer(
    async (request: IncomingMessage, response: ServerResponse) => {
      const url = new URL(
        request.url ?? "/",
        `http://${MOCK_FASTAPI_HOST}:${MOCK_FASTAPI_PORT}`,
      );

      if (request.method === "GET" && url.pathname === "/api/v1/shared/me") {
        sendJson(response, 200, {
          id: "me-1",
          email: "admin@example.com",
          username: "admin",
          full_name: "Admin User",
          avatar_url: null,
          surface: "admin",
          permissions: [
            "users.list",
            "users.read.stats",
            "users.create.admin",
            "users.update.role",
            "notifications.read.unread_count",
          ],
          role: {
            id: "role-admin",
            name: "panel_admin",
            is_system: true,
            permissions: [
              "users.list",
              "users.read.stats",
              "users.create.admin",
              "users.update.role",
              "notifications.read.unread_count",
            ],
          },
          is_active: true,
          is_verified: true,
          has_pending_email: false,
          verification_required: false,
        });
        return;
      }

      if (
        request.method === "POST" &&
        url.pathname === "/api/v1/admin/auth/login"
      ) {
        sendJson(response, 200, {
          access_token: "test-access-token",
          refresh_token: "test-refresh-token",
          token_type: "bearer",
        });
        return;
      }

      if (
        request.method === "GET" &&
        url.pathname === "/api/v1/shared/notifications/unread-count"
      ) {
        sendJson(response, 200, { count: 0 });
        return;
      }

      if (
        request.method === "GET" &&
        url.pathname === "/api/v1/admin/users/stats"
      ) {
        sendJson(response, 200, {
          total: 12,
          active: 10,
          inactive: 2,
        });
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/v1/admin/roles") {
        sendJson(response, 200, [
          {
            id: "role-admin",
            name: "panel_admin",
            description: "Administrators",
            is_system: true,
            permissions: [
              "users.create.admin",
              "users.read.basic",
              "users.update.profile",
              "users.update.role",
            ],
          },
          {
            id: "role-support",
            name: "support",
            description: "Support agents",
            is_system: false,
            permissions: ["users.read.basic"],
          },
        ]);
        return;
      }

      if (url.pathname === "/api/v1/admin/users" && request.method === "POST") {
        createdPayload = await readJsonBody(request);
        sendJson(response, 201, {
          id: "user-new",
          email: "new-admin@example.com",
          username: "new_admin",
          full_name: "New Admin",
          avatar_url: null,
          surface: "admin",
          role: {
            id: "role-admin",
            name: "panel_admin",
            is_system: true,
          },
          is_active: true,
          is_verified: false,
          has_pending_email: false,
          verification_required: true,
        });
        return;
      }

      if (url.pathname === "/api/v1/admin/users" && request.method === "GET") {
        sendJson(response, 200, {
          items: [
            {
              id: "user-1",
              email: "alice@example.com",
              username: "alice",
              full_name: "Alice Admin",
              avatar_url: null,
              surface: "admin",
              role: {
                id: "role-admin",
                name: "panel_admin",
                is_system: true,
              },
              is_active: true,
              is_verified: true,
              has_pending_email: false,
              verification_required: false,
            },
          ],
          total: 1,
          page: 1,
          size: 20,
          pages: 1,
        });
        return;
      }

      sendJson(response, 404, {
        detail: `${request.method} ${url.pathname} is not mocked`,
      });
    },
  );

  await new Promise<void>((resolve, reject) => {
    httpServer.once("error", reject);
    httpServer.listen(MOCK_FASTAPI_PORT, MOCK_FASTAPI_HOST, () => {
      httpServer.off("error", reject);
      resolve();
    });
  });

  return {
    close: () =>
      new Promise<void>((resolve, reject) => {
        httpServer.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      }),
  };
}

test.describe("users management", () => {
  test.beforeAll(async () => {
    server = await startMockFastApiServer();
  });

  test.afterAll(async () => {
    await server?.close();
  });

  test.beforeEach(async () => {
    createdPayload = null;
  });

  test("creates an admin user from the users page", async ({ page }) => {
    await page.goto("/login");
    await page.evaluate(() => {
      document.cookie = "access_token=test-access-token; path=/";
    });
    await expect
      .poll(() => page.evaluate(() => document.cookie))
      .toContain("access_token=test-access-token");
    await page.goto("/users");

    await expect(page.getByText("Alice Admin")).toBeVisible();

    await page.getByRole("button", { name: /Create/i }).click();
    await expect(page.getByRole("dialog", { name: /Create/i })).toBeVisible();

    await page.getByLabel("Email").fill("new-admin@example.com");
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "panel_admin" }).click();
    await page.getByLabel("Full Name").fill("New Admin");
    await page.getByLabel("Username").fill("new_admin");
    await page.getByRole("button", { name: "Create User" }).click();

    await expect.poll(() => createdPayload).not.toBeNull();
    expect(createdPayload).toEqual({
      email: "new-admin@example.com",
      role_name: "panel_admin",
      full_name: "New Admin",
      username: "new_admin",
    });
  });
});
