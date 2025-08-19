import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "node",
        globals: true,
        watch: false,
        coverage: {
            provider: "v8",
            reporter: ["text", "lcov", "html"],
            include: ["src/**/*"],
            exclude: ["node_modules/", "dist/", "src/index.ts", "**/*.d.ts"]
        }
    }
});
