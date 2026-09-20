import { defineConfig} from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Plugin customizado: injeta a CSP como primeira meta tag do <head> em produção
function cspPlugin(): Plugin {
  const csp = [
    "default-src 'self'",
    "img-src 'self' https: data: blob:",
    "script-src 'self' 'unsafe-inline' https://www.google-analytics.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "connect-src 'self' https://api.agendyapp.com.br",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')

  return {
    name: 'inject-csp',
    apply: 'build', // só roda no build de produção
    transformIndexHtml(html) {
      return html.replace(
        '<head>',
        `<head>\n    <meta http-equiv="Content-Security-Policy" content="${csp}">`,
      )
    },
  }
}

export default defineConfig({
  plugins: [react(), cspPlugin()],
  build: {
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        pure_funcs: ['console.log', 'console.debug', 'console.info'],
        drop_debugger: true,
      },
    },
  },
  server: {
    host: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})