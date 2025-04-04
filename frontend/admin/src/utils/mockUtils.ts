/**
 * mock数据处理工具
 */

import { learningCenterMock } from '../mock/learningCenterMock';

// 判断是否为开发环境的辅助函数
export const isDevelopment = () => {
  return import.meta.env.DEV || (typeof process !== 'undefined' && process.env.NODE_ENV === 'development');
};

// 导出所有mock数据模块
export const mockData = {
  learningCenterMock
};

// 初始化mock数据
export const initMockData = () => {
  // 注册到全局window对象以方便访问
  if (typeof window !== 'undefined') {
    (window as any).__mockData = mockData;
    console.log('已初始化mock数据');
  }
};

// 获取特定类型的mock数据
export const getMockData = async (module: string, dataType: string) => {
  try {
    // 先尝试从全局对象获取
    if (typeof window !== 'undefined' && (window as any).__mockData?.[module]?.[dataType]) {
      return (window as any).__mockData[module][dataType];
    }
    
    // 然后尝试从导出的对象获取
    if (mockData[module as keyof typeof mockData]?.[dataType]) {
      return mockData[module as keyof typeof mockData][dataType];
    }
    
    console.warn(`无法找到模块 ${module} 的 ${dataType} 数据`);
    return null;
  } catch (error) {
    console.error(`获取mock数据失败: ${module}.${dataType}`, error);
    return null;
  }
};

// 初始化
initMockData(); 