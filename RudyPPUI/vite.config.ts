import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Fail if 5173 is taken instead of silently moving to 5174, which the VS Code launch wouldn't find
    strictPort: true,
    proxy: {
      // Forward API calls to Spring Boot. The path is passed through unchanged:
      // the backend's servlet context-path is /api, so the prefix must stay.
      '/api': {
        target: 'http://localhost:9333',
        changeOrigin: true,
      },
    },
  },
});
