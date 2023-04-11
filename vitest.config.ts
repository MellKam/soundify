import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      reporter: [
        "html",
        ["lcov", { projectRoot: "./src", file: "coverage.lcov" }]
      ],
      all: true,
      provider: "c8"
    }
  }
});
