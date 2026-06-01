import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'https://api.getmycarro.com',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err) => console.error('[proxy error]', err.message));
          proxy.on('proxyReq', (_, req) => console.log('[proxy →]', req.method, req.url));
          proxy.on('proxyRes', (res, req) => console.log('[proxy ←]', res.statusCode, req.url));
        },
      },
    },
  },
});
