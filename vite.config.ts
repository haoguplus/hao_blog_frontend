import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, ''),
        // 如果后端使用 SSE，可以按需开启 ws 代理
        // ws: true,
        // 开发环境禁用 SSL 证书校验；如果后端本身就是 http，保持 false 即可
        secure: false,
      },
    },
  },
})
