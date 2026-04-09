import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    exclude: ["**/node_modules/**", "**/tests/e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
      },
      exclude: [
        "tests/",
        "app/api/",
        "app/**/page.tsx",
        "app/**/layout.tsx",
        "app/layout.tsx",
        "app/unauthorized.tsx",
        "**/*.config.*",
        "**/*.generated.ts",
        "**/components/ui/**",
        "**/components/**",
        "i18n/",
        "messages/",
        "public/",
        ".next/",
        "node_modules/",
      ],
    },
  },
});
