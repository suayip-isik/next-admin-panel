import { expect, test } from "@playwright/test";

test.describe("users management", () => {
  test("creates an admin user from the users page", async ({ page }) => {
    let createdPayload: Record<string, unknown> | null = null;

    await page.route("**/api/v1/shared/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "me-1",
          email: "admin@example.com",
          username: "admin",
          full_name: "Admin User",
          avatar_url: null,
          surface: "admin",
          role: {
            id: "role-admin",
            name: "admin",
            is_system: true,
          },
          is_active: true,
          is_verified: true,
          has_pending_email: false,
          verification_required: false,
        }),
      });
    });

    await page.route(
      "**/api/v1/shared/notifications/unread-count",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ count: 0 }),
        });
      },
    );

    await page.route("**/api/v1/admin/users/stats", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          total: 12,
          active: 10,
          inactive: 2,
        }),
      });
    });

    await page.route("**/api/v1/admin/roles", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "role-admin",
            name: "admin",
            description: "Administrators",
            is_system: true,
            permissions: ["users:create_admin", "users:view", "users:update"],
          },
          {
            id: "role-support",
            name: "support",
            description: "Support agents",
            is_system: false,
            permissions: ["users:view"],
          },
        ]),
      });
    });

    await page.route("**/api/v1/admin/users**", async (route) => {
      if (route.request().method() === "POST") {
        createdPayload = route.request().postDataJSON() as Record<
          string,
          unknown
        >;
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            id: "user-new",
            email: "new-admin@example.com",
            username: "new_admin",
            full_name: "New Admin",
            avatar_url: null,
            surface: "admin",
            role: {
              id: "role-admin",
              name: "admin",
              is_system: true,
            },
            is_active: true,
            is_verified: false,
            has_pending_email: false,
            verification_required: true,
          }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
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
                name: "admin",
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
        }),
      });
    });

    await page.goto("/login");
    await page.evaluate(() => {
      document.cookie = "access_token=test-access-token; path=/";
    });
    await page.goto("/users");

    await expect(page.getByText("Alice Admin")).toBeVisible();

    await page.getByRole("button", { name: /Create/i }).click();
    await expect(page.getByRole("dialog", { name: /Create/i })).toBeVisible();

    await page.getByLabel("Email").fill("new-admin@example.com");
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "admin" }).click();
    await page.getByLabel("Full Name").fill("New Admin");
    await page.getByLabel("Username").fill("new_admin");
    await page.getByRole("button", { name: "Create User" }).click();

    await expect.poll(() => createdPayload).not.toBeNull();
    expect(createdPayload).toEqual({
      email: "new-admin@example.com",
      role_name: "admin",
      full_name: "New Admin",
      username: "new_admin",
    });
  });
});
