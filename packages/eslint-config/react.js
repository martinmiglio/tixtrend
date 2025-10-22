import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import baseConfig from "./base.js";

/**
 * ESLint configuration for React packages, extending the base config.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export default [
  ...baseConfig,
  pluginReact.configs.flat.recommended,
  {
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    plugins: {
      "react-hooks": pluginReactHooks,
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      // React scope no longer necessary with new JSX transform
      "react/react-in-jsx-scope": "off",
    },
  },
  {
    ignores: [
      "**/.tanstack/**",
      ".vinxi/**",
      "src/routeTree.gen.ts",
    ],
  },
];
