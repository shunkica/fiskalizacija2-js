module.exports = [
    {
        files: ["src/**/*.ts", "tests/**/*.ts"],
        languageOptions: {
            parser: require("@typescript-eslint/parser"),
            parserOptions: {
                project: ["./tsconfig.json"],
            },
        },
        plugins: {
            "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
        },
        rules: {
            "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_", "caughtErrorsIgnorePattern": "^_" }],
            "quotes": ["error", "double"],
            "eol-last": ["error", "always"],
            "comma-spacing": ["error", { "before": false, "after": true }],
            "object-curly-spacing": ["error", "never"],
            "no-trailing-spaces": "error",
            "no-multiple-empty-lines": ["error", { "max": 1 }],
        },
    },
];
