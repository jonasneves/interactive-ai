import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: '/convolutional-neural-network/',
  server: {
    port: 3000,
    open: true,
  },
});
