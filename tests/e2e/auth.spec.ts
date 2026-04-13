import { expect, test } from "@playwright/test";

test.describe("auth flows", () => {
  test("redirects unauthenticated admin routes to login", async ({ page }) => {
    await page.goto("/users?tab=active");

    await expect(page).toHaveURL(/\/login\?from=%2Fusers%3Ftab%3Dactive$/);
    await expect(page.getByText("Sign in to your account")).toBeVisible();
  });

  test("continues to the totp step when login requires two-factor authentication", async ({
    page,
  }) => {
    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          requires_totp: true,
          partial_token: "partial-token-123",
        }),
      });
    });

    await page.goto("/login");
    await page.getByLabel("Email").fill("admin@example.com");
    await page.getByLabel("Password").fill("Secret123!");
    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(page).toHaveURL(/\/totp$/);
    await expect(page.getByLabel("Authentication Code")).toBeVisible();
    await expect(page.getByRole("button", { name: "Verify" })).toBeVisible();

    const storedToken = await page.evaluate(() =>
      window.sessionStorage.getItem("partial_token"),
    );
    expect(storedToken).toBe("partial-token-123");
  });
});
