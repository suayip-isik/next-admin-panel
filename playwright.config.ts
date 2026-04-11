import { defineConfig, devices } from "@playwright/test";
import { getPlaywrightConfig } from "./lib/env";

const playwrightConfig = getPlaywrightConfig();

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "test-results/playwright",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { outputFolder: "playwright-report" }]],
  use: {
    baseURL: playwrightConfig.baseUrl,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: playwrightConfig.webServerUrl,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
