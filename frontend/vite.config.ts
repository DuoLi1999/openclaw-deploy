import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api/workflows': {
          target: env.DIFY_BASE_URL || 'http://localhost',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/v1'),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader(
                'Authorization',
                `Bearer ${env.DIFY_API_KEY}`
              )
              // Prevent upstream compression so SSE events arrive unbuffered
              proxyReq.setHeader('Accept-Encoding', 'identity')
            })
          },
        },
      },
    },
  }
})
