import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: true, // permite qualquer host
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        // changeOrigin não definido ou false
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})