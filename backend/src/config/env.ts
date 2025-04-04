// 环境配置
interface EnvConfig {
  API_BASE_URL: string;
  API_TIMEOUT: number;
  USE_MOCK_DATA: boolean;
  USE_MSW: boolean; // 是否使用MSW进行API模拟
  USE_DB_FALLBACK: boolean; // 是否使用数据库降级服务
  FALLBACK_API_PATH: string; // 降级服务API路径
}

// 所有环境下使用的基础配置
const baseConfig: EnvConfig = {
  API_BASE_URL: 'http://localhost:5188/api', // 更新为正确的后端API地址
  API_TIMEOUT: 15000,
  USE_MOCK_DATA: false, // 禁用模拟数据
  USE_MSW: false, // 禁用MSW
  USE_DB_FALLBACK: false, // 禁用降级服务
  FALLBACK_API_PATH: '/fallback'
};

// 开发环境配置
const devConfig: EnvConfig = {
  ...baseConfig,
  API_TIMEOUT: 10000,
};

// 生产环境配置
const prodConfig: EnvConfig = {
  ...baseConfig
};

// 测试环境配置
const testConfig: EnvConfig = {
  ...baseConfig
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
  API地址: config.API_BASE_URL,
  使用模拟数据: '否', // 始终禁用模拟数据
  使用数据库降级: '否', // 始终禁用降级服务
  降级API路径: config.FALLBACK_API_PATH
});

export default config; 