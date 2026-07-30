import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  root: "netlify",
  plugins: [react()],
  publicDir: "../public",
  build: {
    emptyOutDir: true,
    outDir: "../netlify-dist",
  },
});
