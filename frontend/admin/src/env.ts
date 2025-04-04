// 环境配置
export const ENV_CONFIG = {
  // 开发环境
  development: {
    // API基础URL
    apiBaseUrl: 'http://localhost:5188/api',
    // 禁用模拟数据
    useMockData: false,
    // 模拟数据延迟(毫秒)
    mockDelay: 0,
  },
  // 生产环境
  production: {
    apiBaseUrl: 'http://localhost:5188/api',
    useMockData: false,
    mockDelay: 0,
  },
  // 测试环境
  test: {
    apiBaseUrl: 'http://localhost:5188/api',
    useMockData: false,
    mockDelay: 0,
  },
}; 