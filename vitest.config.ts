import { defineConfig } from "vitest/config";

export default defineConfig({
  define: {
    __IS_NODE__: true
  },
  test: {
    coverage: {
      provider: "c8",
      all: true,
      src: ["./src"],
      reporter: ["html", ["lcov", { file: "coverage.lcov" }]]
    }
  }
});
