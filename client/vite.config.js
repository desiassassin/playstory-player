import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
     plugins: [svgr(), react()],
     server: {
          port: 8080,
          open: "/643e843e858352949b2b24e7"
     }
});
