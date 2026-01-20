import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: './',  // Relative paths work for subdirectory deployment
  server: {
    port: 3002,
    host: true,
    open: false,
  },
});
