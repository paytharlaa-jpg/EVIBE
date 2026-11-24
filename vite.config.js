import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (/node_modules[\/](react|react-dom|scheduler)[\/]/.test(id)) return 'react';
          if (/node_modules[\/](gsap|lenis)[\/]/.test(id)) return 'motion';
        },
      },
    },
  },
});
