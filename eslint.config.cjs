const eslintConfigPrettierFlat = require("eslint-config-prettier/flat");
const { importX } = require("eslint-plugin-import-x");

module.exports = [
    eslintConfigPrettierFlat,
    importX.flatConfigs.recommended,
    importX.flatConfigs.typescript,
    {
        files: ["src/**/*.ts", "tests/**/*.ts"],
        languageOptions: {
            parser: require("@typescript-eslint/parser"),
            parserOptions: {
                project: ["./tsconfig.json"]
            }
        },
        plugins: {
            "@typescript-eslint": require("@typescript-eslint/eslint-plugin")
        },
        rules: {
            "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" }],
            "@typescript-eslint/only-throw-error": "error",
            "no-console": ["error", { allow: ["warn", "error"] }],
            "no-debugger": "error",
            "no-var": "error",
            "prefer-const": "error",
            "eqeqeq": ["error", "always"],
            "curly": "error",
            "import-x/no-unresolved": "error",
            "import-x/named": "error",
            "import-x/default": "error",
            "import-x/namespace": "error",
            "import-x/no-absolute-path": "error"
        }
    }
];
