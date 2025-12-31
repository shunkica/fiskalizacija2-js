import { defineConfig } from "tsup";
import * as path from "node:path";
import * as fs from "node:fs";

export default defineConfig({
    entry: ["src/index.ts"],
    format: ["esm"],
    experimentalDts: true,
    clean: true,
    sourcemap: true,
    minify: true
});
