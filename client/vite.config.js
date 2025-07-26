import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  base: './', // Important: makes asset URLs relative so vite.svg works
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: mode === 'development' ? {
      '/api': {
        target: process.env.VITE_API_URL || 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.error('Proxy error:', err);
          });
        }
      }
    } : undefined, // Disable proxy in production
  }
}));
