import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    proxy: {
      '/api/auth': {
        target: 'http://host.docker.internal:8001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/auth/, '/auth')
      },
      '/api/products': {
        target: 'http://host.docker.internal:80',
        changeOrigin: true
      },
      '/api/categories': {
        target: 'http://host.docker.internal:80',
        changeOrigin: true
      },
      '/api/inventory': {
        target: 'http://localhost:8003',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/inventory/, '')
      },
      '/api/notify': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/notify/, '/api/v1/notify')
      }
    }
  }
})