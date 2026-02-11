import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

function createDifyProxy(envKey: string, env: Record<string, string>) {
  return {
    target: env.DIFY_BASE_URL || 'http://localhost',
    changeOrigin: true,
    rewrite: (p: string) => p.replace(/^\/api\/[^/]+/, '/v1/workflows'),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    configure: (proxy: any) => {
      proxy.on('proxyReq', (proxyReq: any) => {
        proxyReq.setHeader('Authorization', `Bearer ${env[envKey]}`)
        proxyReq.setHeader('Accept-Encoding', 'identity')
      })
    },
  }
}

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
        // 文案生成（已有）
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
              proxyReq.setHeader('Accept-Encoding', 'identity')
            })
          },
        },
        // 海报方案
        '/api/poster': createDifyProxy('DIFY_API_KEY_POSTER', env),
        // 视频脚本
        '/api/script': createDifyProxy('DIFY_API_KEY_SCRIPT', env),
        // 三级审核
        '/api/reviewer': createDifyProxy('DIFY_API_KEY_REVIEWER', env),
        // 素材搜索
        '/api/media': createDifyProxy('DIFY_API_KEY_MEDIA', env),
        // 宣传计划
        '/api/planner': createDifyProxy('DIFY_API_KEY_PLANNER', env),
        // 效果分析
        '/api/analytics': createDifyProxy('DIFY_API_KEY_ANALYTICS', env),
        // 智能主题推荐
        '/api/recommender': createDifyProxy('DIFY_API_KEY_RECOMMENDER', env),
        // 精准靶向
        '/api/precision': createDifyProxy('DIFY_API_KEY_PRECISION', env),
        // 课件生成
        '/api/courseware': createDifyProxy('DIFY_API_KEY_COURSEWARE', env),
        // 智能客服 Chatflow
        '/api/chat': {
          target: env.DIFY_BASE_URL || 'http://localhost',
          changeOrigin: true,
          rewrite: (p: string) => p.replace(/^\/api\/chat/, '/v1'),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          configure: (proxy: any) => {
            proxy.on('proxyReq', (proxyReq: any) => {
              proxyReq.setHeader('Authorization', `Bearer ${env['DIFY_API_KEY_CHAT']}`)
              proxyReq.setHeader('Accept-Encoding', 'identity')
            })
          },
        },
        // 舆情处置
        '/api/opinion': createDifyProxy('DIFY_API_KEY_OPINION', env),
        // AI 配图
        '/api/imagegen': createDifyProxy('DIFY_API_KEY_IMAGEGEN', env),
      },
    },
  }
})
