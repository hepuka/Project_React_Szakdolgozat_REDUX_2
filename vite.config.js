import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/* =========================================================
   VITE
   =========================================================

   A projekt korábban Create React App (react-scripts) alatt
   futott. A forráskód változtatás nélkül működik: a Vite az
   index.html-ből indul, amely a /src/index.jsx modulra
   hivatkozik.
   ========================================================= */

export default defineConfig({
  plugins: [react()],

  server: {
    /*
     * A megszokott cím marad; a Vite alapértelmezése 5173.
     */
    port: 3000,

    open: false,
  },

  build: {
    outDir: "dist",

    sourcemap: false,
  },
});
