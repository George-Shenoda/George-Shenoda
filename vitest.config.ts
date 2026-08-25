import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "apps/web"),
      "@mobile": path.resolve(__dirname, "apps/mobile/src"),
    },
  },
  test: {
    coverage: {
      provider: "v8",
      include: [
        "packages/shared/src/**",
        "apps/web/lib/**",
        "apps/web/utils/**",
        "apps/web/app/api/**",
        "apps/mobile/src/config.ts",
        "apps/mobile/src/outbox-storage.ts",
      ],
    },
    projects: [
      {
        extends: true,
        test: {
          name: "node",
          environment: "node",
          include: ["tests/**/*.test.ts"],
          exclude: ["**/node_modules/**", "tests/**/*.dom.test.ts"],
          setupFiles: ["tests/setup/msw.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "jsdom",
          environment: "jsdom",
          include: ["tests/**/*.dom.test.ts"],
          exclude: ["**/node_modules/**"],
        },
      },
    ],
  },
});
