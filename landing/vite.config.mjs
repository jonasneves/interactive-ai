import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 3000,
    host: true,
    open: false,
  },
  esbuild: {
    target: 'es2022',
  },
  optimizeDeps: {
    exclude: ['@mediapipe/tasks-vision'],
    esbuildOptions: {
      target: 'es2022',
    },
  },
  build: {
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@mediapipe')) {
              return 'mediapipe';
            }
          }
        },
      },
    },
  },
});
