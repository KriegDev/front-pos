import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  {
    rules: {
      "@next/next/no-img-element": "off",
      // Estas páginas leen localStorage después del montaje para evitar
      // diferencias entre el HTML del servidor y el cliente.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "node_modules/**",
    "para revisar/**",
    "docs/**/*.html",
    "karma.conf.js",
    "scripts/**",
    "tests/**",
    "db.json",
  ]),
]);

export default eslintConfig;
