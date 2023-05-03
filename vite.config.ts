import { defineConfig, Plugin } from "vite";

const __IS_NODE__ = process.env.__IS_NODE__ === "true" ?? true;

export default defineConfig({
  define: {
    __IS_NODE__
  },
  build: {
    lib: {
      entry: "./src/index.ts",
      formats: ["es", "cjs"],
      fileName: __IS_NODE__ ? "server" : "browser"
    },
    emptyOutDir: false,
    rollupOptions: {
      external: ["node:crypto"]
    }
  },
  optimizeDeps: {
    exclude: ["node:crypto"]
  }
});
