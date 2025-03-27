import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://30b97ed1-0469-4e85-a108-6631e67b6ec3-dev.e1-eu-north-azure.choreoapis.dev/cart-app-on-vultr-cloud/bff-api/v1.0',
        changeOrigin: true,
        secure: true
      }
    }
  }
});
