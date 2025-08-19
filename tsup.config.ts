import { defineConfig } from "tsup";
import * as path from "node:path";
import * as fs from "node:fs";

export default defineConfig({
    entry: ["src/index.ts"],
    format: ["esm"],
    experimentalDts: true,
    clean: true,
    sourcemap: true,
    minify: true,
    onSuccess: async () => {
        const file = path.resolve(__dirname, "dist/_tsup-dts-rollup.d.ts");
        if (fs.existsSync(file)) {
            fs.unlinkSync(file);
            console.log("Removed _tsup-dts-rollup.d.ts");
        }
    }
});
