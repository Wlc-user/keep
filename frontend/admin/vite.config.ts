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
      // API请求
      '/api': {
        target: 'http://localhost:5188',
        changeOrigin: true,
        secure: false
      },
      
      // 健康检查请求
      '/health': {
        target: 'http://localhost:5188',
        changeOrigin: true,
        secure: false
      },
      
      // 调试端点请求
      '/debug': {
        target: 'http://localhost:5188',
        changeOrigin: true,
        secure: false
      },
      
      // ping端点
      '/ping': {
        target: 'http://localhost:5188',
        changeOrigin: true,
        secure: false
      }
    }
  }
}); 