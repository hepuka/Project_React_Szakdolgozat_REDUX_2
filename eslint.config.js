import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

/* =========================================================
   ESLINT
   =========================================================

   A CRA a package.json eslintConfig mezőjéből dolgozott; a
   Vite nem hoz magával lintert, ezért itt áll össze a
   konfiguráció. Futtatás: npm run lint
   ========================================================= */

export default [
  {
    ignores: ["dist", "build", "node_modules"],
  },

  js.configs.recommended,

  {
    files: ["**/*.{js,jsx}"],

    languageOptions: {
      ecmaVersion: "latest",

      globals: {
        ...globals.browser,
      },

      parserOptions: {
        sourceType: "module",

        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    settings: {
      react: {
        version: "detect",
      },
    },

    plugins: {
      react,
      "react-hooks": reactHooks,
    },

    rules: {
      ...react.configs.flat.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      /*
       * A React 17 óta nem kell importálni a Reactot a JSX-hez.
       */
      "react/react-in-jsx-scope": "off",

      /*
       * A projekt nem használ PropTypes-t.
       */
      "react/prop-types": "off",
    },
  },
];
