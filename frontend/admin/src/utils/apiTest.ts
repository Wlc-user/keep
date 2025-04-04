import { get } from './api';
import axios from 'axios';
import config from '../config/env';

/**
 * 测试前后端通信
 * 这个函数用于测试前端是否能够成功连接到后端API
 */
export const testBackendConnection = async (): Promise<{
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}> => {
  try {
    // 尝试调用后端健康检查API
    const response = await get<{ status: string; timestamp: string }>('/health');
    
    console.log('后端连接测试成功:', response);
    
    return {
      success: true,
      message: '成功连接到后端API',
      data: response
    };
  } catch (error) {
    console.error('后端连接测试失败:', error);
    
    return {
      success: false,
      message: '无法连接到后端API',
      error
    };
  }
};

/**
 * 测试数据库连接
 * 这个函数用于测试后端是否能够成功连接到数据库
 */
export const testDatabaseConnection = async (): Promise<{
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}> => {
  try {
    // 尝试调用后端数据库健康检查API
    const response = await get<{ status: string; timestamp: string }>('/health/database');
    
    console.log('数据库连接测试成功:', response);
    
    return {
      success: true,
      message: '后端成功连接到数据库',
      data: response
    };
  } catch (error) {
    console.error('数据库连接测试失败:', error);
    
    return {
      success: false,
      message: '后端无法连接到数据库',
      error
    };
  }
};

/**
 * 获取系统信息
 * 这个函数用于获取后端系统信息
 */
export const getSystemInfo = async (): Promise<{
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}> => {
  try {
    // 尝试调用后端系统信息API
    const response = await get<{
      applicationName: string;
      version: string;
      environment: string;
      frameworkVersion: string;
      operatingSystem: string;
      serverTime: string;
    }>('/health/info');
    
    console.log('获取系统信息成功:', response);
    
    return {
      success: true,
      message: '成功获取系统信息',
      data: response
    };
  } catch (error) {
    console.error('获取系统信息失败:', error);
    
    return {
      success: false,
      message: '无法获取系统信息',
      error
    };
  }
};

/**
 * 运行所有测试
 * 这个函数会运行所有的API测试
 */
export const runAllTests = async (): Promise<{
  backendConnection: {
    success: boolean;
    message: string;
    data?: any;
    error?: any;
  };
  databaseConnection: {
    success: boolean;
    message: string;
    data?: any;
    error?: any;
  };
  systemInfo: {
    success: boolean;
    message: string;
    data?: any;
    error?: any;
  };
}> => {
  const backendConnection = await testBackendConnection();
  const databaseConnection = await testDatabaseConnection();
  const systemInfo = await getSystemInfo();
  
  return {
    backendConnection,
    databaseConnection,
    systemInfo
  };
};

/**
 * API测试工具
 * 用于检查后端API是否可用
 */
export const testApiConnection = async () => {
  try {
    console.log('正在测试API连接...');
    console.log('API基础URL:', config.API_BASE_URL);
    
    // 尝试连接健康检查接口
    const response = await axios.get(`${config.API_BASE_URL}/health`, {
      timeout: 5000
    });
    
    console.log('API连接测试响应:', response.data);
    
    return {
      success: true,
      message: '后端API连接成功',
      data: response.data
    };
  } catch (error: any) {
    console.error('API连接测试失败:', error);
    
    return {
      success: false,
      message: '后端API连接失败',
      error: error.message,
      details: error.response ? error.response.data : null
    };
  }
};

/**
 * 测试登录API
 * @param username 用户名
 * @param password 密码
 */
export const testLoginApi = async (username: string, password: string) => {
  try {
    console.log('正在测试登录API...');
    
    const response = await axios.post(`${config.API_BASE_URL}/user/login`, {
      Email: username,
      Password: password
    }, {
      timeout: 5000
    });
    
    console.log('登录API测试响应:', response.data);
    
    return {
      success: true,
      message: '登录API测试成功',
      data: response.data
    };
  } catch (error: any) {
    console.error('登录API测试失败:', error);
    
    return {
      success: false,
      message: '登录API测试失败',
      error: error.message,
      details: error.response ? error.response.data : null
    };
  }
};

export default {
  testBackendConnection,
  testDatabaseConnection,
  getSystemInfo,
  runAllTests,
  testApiConnection,
  testLoginApi
};
