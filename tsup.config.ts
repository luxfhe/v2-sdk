import { defineConfig } from "tsup";
import fs from "fs";
import path from "path";

export default defineConfig({
  entry: {
    web: "./src/web/index.ts",
    node: "./src/node/index.ts",
  },
  format: ["cjs", "esm"],
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: false,
  external: ["tfhe", "node-tfhe"],
  esbuildOptions(options) {
    options.assetNames = "assets/[name]";
    options.loader = {
      ...options.loader,
      ".wasm": "file",
    };
  },
  async onSuccess() {
    console.log("@@@ SUCCESS @@@");
  },
  outDir: "dist",
  treeshake: true,
  minify: false,
  outExtension({ format }) {
    return {
      js: format === "cjs" ? ".js" : ".mjs",
    };
  },
  legacyOutput: false,
  noExternal: [],
});
