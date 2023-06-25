import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globalSetup: "./__dev__/watch-grammar.ts",
    forceRerunTriggers: ["./src/**/__fixtures__/**/*.db"],
  },
});
