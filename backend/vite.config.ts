import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // 统一所有API请求到后端
      '/api': {
        target: 'http://localhost:5188',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      },
      
      // 健康检查请求
      '/health': {
        target: 'http://localhost:5188',
        changeOrigin: true,
        secure: false
      },
      
      // 确保直接访问通知的请求也能正确代理
      '/notifications': {
        target: 'http://localhost:5188',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => `/api${path}`
      },
      
      // 用户接口代理
      '/users': {
        target: 'http://localhost:5188',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => `/api${path}`
      },
      
      // 认证接口代理
      '/auth': {
        target: 'http://localhost:5188',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => `/api${path}`
      }
    }
  }
}); 