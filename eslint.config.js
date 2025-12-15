const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

const ignores = [
  "dist/*",
  "node_modules/**",
  ".expo/**",
  "**/.expo/**",
  "**/*.d.ts",
  ".expo/types/router.d.ts",
  "**/.expo/types/router.d.ts",
  ".expo/types/**",
  "**/.expo/types/**",
];

module.exports = defineConfig([
  ...expoConfig.map((c) => ({
    ...c,
    ignores: [...(c.ignores ?? []), ...ignores],
    linterOptions: {
      ...(c.linterOptions ?? {}),
      reportUnusedDisableDirectives: "off",
    },
  })),
]);
