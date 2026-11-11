import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // Fail loudly if a route chunk ever grows past the budget.
    chunkSizeWarningLimit: 500,
    // The server bundle (entry-server.jsx) is only run at build time by
    // scripts/prerender.mjs, so it needs no chunking.
    rollupOptions: isSsrBuild
      ? {}
      : {
          output: {
            // Keep the React/router runtime in one long-lived chunk so page
            // navigations only download page code.
            // Vite 8 runs Rolldown, which requires the function form here — the
            // object form is rejected at config validation.
            manualChunks(id) {
              if (
                /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(
                  id,
                )
              ) {
                return 'react-vendor';
              }
              // Animation and smooth-scroll libraries change far less often than
              // app code, so they get their own long-lived chunk.
              if (/node_modules[\\/](framer-motion|motion-dom|motion-utils|lenis)[\\/]/.test(id)) {
                return 'motion-vendor';
              }
              return undefined;
            },
          },
        },
  },
}));
