/**
 * Shared Prettier configuration for the monorepo.
 *
 * @type {import("prettier").Config}
 */
export default {
  plugins: [
    "prettier-plugin-tailwindcss",
    "@trivago/prettier-plugin-sort-imports",
  ],
};
