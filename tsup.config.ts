import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ["react", "react-dom"],
  // Next.js server pages may import this bundle: mark it as client code, or its hooks and contexts crash there.
  banner: { js: '"use client";' },
  esbuildOptions(options) {
    options.alias = { "@": "./src" }
  },
})
