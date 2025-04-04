// 环境配置
interface EnvConfig {
  API_BASE_URL: string;
  API_TIMEOUT: number;
  USE_MOCK_DATA: boolean;
  USE_MSW: boolean; // 是否使用MSW进行API模拟
  USE_DB_FALLBACK: boolean; // 是否使用数据库降级服务
  FALLBACK_API_PATH: string; // 降级服务API路径
  MOCK_DELAY: number;
  ENABLE_API_LOGGING: boolean;
  ENABLE_API_RETRY: boolean;
  MAX_API_RETRIES: number;
  API_RETRY_DELAY: number;
  AUTH: {
    TOKEN_KEY: string;
    REFRESH_TOKEN_KEY: string;
    TOKEN_EXPIRY_KEY: string;
    USER_KEY: string;
    ENABLE_AUTO_REFRESH: boolean;
    REFRESH_BEFORE_EXPIRY: number;
  };
  STORAGE_PREFIX: string;
  DEFAULT_LOCALE: string;
  DEFAULT_PAGE_SIZE: number;
  MAX_UPLOAD_SIZE: number;
  DEFAULT_AVATAR: string;
  UPLOAD_URL: string;
  WEBSOCKET_URL: string;
  CHART_COLORS: string[];
}

// 所有环境下使用的基础配置
const baseConfig: EnvConfig = {
  API_BASE_URL: '',  // 移除API基础URL，使用相对路径
  API_TIMEOUT: 30000, // 30秒超时
  USE_MOCK_DATA: true, // 启用模拟数据
  USE_MSW: true, // 启用MSW
  USE_DB_FALLBACK: true, // 启用降级服务
  FALLBACK_API_PATH: '/api/fallback',
  MOCK_DELAY: 500,
  ENABLE_API_LOGGING: true,
  ENABLE_API_RETRY: true,
  MAX_API_RETRIES: 5,
  API_RETRY_DELAY: 2000,
  AUTH: {
    TOKEN_KEY: 'token',
    REFRESH_TOKEN_KEY: 'refreshToken',
    TOKEN_EXPIRY_KEY: 'tokenExpiry',
    USER_KEY: 'currentUser',
    ENABLE_AUTO_REFRESH: true,
    REFRESH_BEFORE_EXPIRY: 5 * 60 * 1000, // 过期前5分钟刷新
  },
  STORAGE_PREFIX: 'ols_',
  DEFAULT_LOCALE: 'zh-CN',
  DEFAULT_PAGE_SIZE: 10,
  MAX_UPLOAD_SIZE: 50 * 1024 * 1024, // 50MB
  DEFAULT_AVATAR: '/assets/default-avatar.png',
  UPLOAD_URL: '/upload',  // 修改上传URL，移除API基础URL
  WEBSOCKET_URL: 'ws://localhost:5188/api/ws',
  CHART_COLORS: ['#1890ff', '#2fc25b', '#facc14', '#223273', '#8543e0', '#13c2c2', '#3436c7', '#f04864']
};

// 开发环境配置
const devConfig: EnvConfig = {
  ...baseConfig,
  API_TIMEOUT: 60000, // 60秒超时
  // 完全启用模拟数据模式
  USE_MOCK_DATA: true,
  USE_MSW: true,
  USE_DB_FALLBACK: true,
  // 清空API基础URL，确保不会尝试连接任何后端API
  API_BASE_URL: '',
  // 添加延迟以模拟网络请求延迟
  MOCK_DELAY: 300
};

// 生产环境配置
const prodConfig: EnvConfig = {
  ...baseConfig,
  USE_MOCK_DATA: false,
  USE_MSW: false,
  USE_DB_FALLBACK: false
};

// 测试环境配置
const testConfig: EnvConfig = {
  ...baseConfig,
  USE_MOCK_DATA: false,
  USE_MSW: false,
  USE_DB_FALLBACK: false
};

// 根据环境选择配置
let config: EnvConfig;
switch (process.env.NODE_ENV) {
  case 'production':
    config = prodConfig;
    break;
  case 'test':
    config = testConfig;
    break;
  default:
    config = devConfig;
}

// 添加窗口变量，方便调试
if (typeof window !== 'undefined') {
  (window as any).__ENV_CONFIG = config;
}

// 导出前执行初始检查
console.log('环境配置加载完成:', {
  环境: process.env.NODE_ENV || 'development',
  API地址: config.API_BASE_URL || '(使用相对路径)',
  使用模拟数据: config.USE_MOCK_DATA ? '是' : '否',
  使用数据库降级: config.USE_DB_FALLBACK ? '是' : '否',
  降级API路径: config.FALLBACK_API_PATH
});

export default config; 