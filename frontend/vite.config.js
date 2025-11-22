import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/dashboard': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/transactions': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/analytics': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      },
      '/reports': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      },
      '/cockpit': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      },
      '/event-analysis': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      },
      '/monitoring': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      },
      '/investigation': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/web-traffic': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/currency': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/ml': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/auth': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/notifications': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/export': { target: 'http://127.0.0.1:8000', changeOrigin: true },
    }
  }
})
