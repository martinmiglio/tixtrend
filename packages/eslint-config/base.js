import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import onlyWarn from "eslint-plugin-only-warn";
import globals from "globals";
import tseslint from "typescript-eslint";

/**
 * Base ESLint configuration for TypeScript/Node packages.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export default [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    rules: {
      // TypeScript overrides
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
        },
      ],
      // General ESLint overrides
      "no-undef": "off",
      "no-case-declarations": "off",
      "no-useless-catch": "off",
      "no-unused-vars": "off",
    },
  },
  {
    plugins: {
      onlyWarn,
    },
  },
  {
    ignores: [
      "dist/**",
      "build/**",
      "coverage/**",
      ".output/**",
      ".nitro/**",
      ".sst/**",
      "sst-env.d.ts",
      "sst.config.ts",
    ],
  },
];
