import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    open: true,
    cors: true,
    host: true,
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5188',
        changeOrigin: true,
        secure: false,
        ws: true,
        rewrite: (path) => path // 不重写路径，保持一致
      },
      // 确保直接访问反馈API的请求也能正确代理
      '/feedback': {
        target: 'http://localhost:5188',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => `/api${path}`
      },
      '/fallback': {
        target: 'http://localhost:5188',
        changeOrigin: true,
        secure: false,
        ws: true
      },
      // 添加对其他常用API端点的代理
      '/auth': {
        target: 'http://localhost:5188',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => `/api${path}`
      },
      '/notifications': {
        target: 'http://localhost:5188',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => `/api${path}`
      },
      '/users': {
        target: 'http://localhost:5188',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => `/api${path}`
      },
      // 添加学生评估API的代理
      '/studentevaluations': {
        target: 'http://localhost:5188',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => `/api${path}`
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
    base: '/',
  },
  publicDir: 'public',
  assetsInclude: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.ico'],
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'antd'],
  },
  css: {
    devSourcemap: true,
  },
}) 