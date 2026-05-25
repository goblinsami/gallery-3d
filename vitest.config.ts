import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/gallery/tests/**/*.test.ts"],
    coverage: {
      reporter: ["text", "html"],
      include: ["src/gallery/**/*.ts"],
    },
  },
});

