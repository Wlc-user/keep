/**
 * 模拟数据加载功能已完全禁用
 * 此文件仅保留以兼容旧代码引用
 */

// 导入类型和空配置
import config from '../config/env';
import ResourceController from './ResourceController';
import { getDbFallbackData } from '../services/dbFallbackService';

/**
 * 所有函数返回空值或默认值
 */

// 构建模拟数据路径
export const buildMockPaths = (resourceType: string, method: string = 'get'): string[] => {
  if (!resourceType) return [];
  
  // 规格化资源类型和方法
  const normalizedType = resourceType.toLowerCase();
  const normalizedMethod = method.toLowerCase();
  
  // 构建一系列可能的路径，按优先级顺序排列
  return [
    // 精确匹配方法
    `/mock/${normalizedType}/${normalizedMethod}.json`,
    `/public/mock/${normalizedType}/${normalizedMethod}.json`,
    `mock/${normalizedType}/${normalizedMethod}.json`,
    `public/mock/${normalizedType}/${normalizedMethod}.json`,
    `/admin/public/mock/${normalizedType}/${normalizedMethod}.json`,
    `admin/public/mock/${normalizedType}/${normalizedMethod}.json`,
    
    // 通用GET方法（当没有精确匹配时使用）
    `/mock/${normalizedType}/get.json`,
    `/public/mock/${normalizedType}/get.json`,
    `mock/${normalizedType}/get.json`,
    `public/mock/${normalizedType}/get.json`,
    `/admin/public/mock/${normalizedType}/get.json`,
    `admin/public/mock/${normalizedType}/get.json`,
    
    // 资源目录下的索引文件
    `/mock/${normalizedType}/index.json`,
    `/public/mock/${normalizedType}/index.json`,
    `mock/${normalizedType}/index.json`,
    `public/mock/${normalizedType}/index.json`,
    `/admin/public/mock/${normalizedType}/index.json`,
    `admin/public/mock/${normalizedType}/index.json`
  ];
};

// 内存中的数据缓存
const mockDataCache: Record<string, any> = {};

/**
 * 模拟数据加载器
 * - 首先尝试从内存缓存加载
 * - 然后尝试从本地JSON文件加载
 */
const mockDataLoader = {
  /**
   * 从指定数据源加载数据
   * @param dataType 数据类型，如'users', 'courses', 'exams'等
   * @returns 异步返回数据对象
   */
  async loadMockData(dataType: string): Promise<any> {
    console.log(`尝试加载模拟数据: ${dataType}`);
    
    try {
      // 1. 首先尝试从内存缓存加载
      if (mockDataCache[dataType]) {
        console.log(`从内存缓存加载 ${dataType} 数据`);
        return mockDataCache[dataType];
      }
      
      // 2. 从本地JSON文件加载
      console.log(`尝试从本地JSON文件加载 ${dataType} 数据`);
      try {
        // 动态导入JSON文件
        const module = await import(`../mock/${dataType}.json`);
        const data = module.default || module;
        
        // 缓存数据到内存
        mockDataCache[dataType] = data;
        console.log(`成功加载并缓存 ${dataType} 数据到内存`);
        
        return data;
      } catch (err) {
        console.error(`加载本地JSON文件 ${dataType} 失败:`, err);
        throw new Error(`无法加载模拟数据: ${dataType}`);
      }
    } catch (error) {
      console.error(`加载模拟数据失败: ${dataType}`, error);
      throw error;
    }
  },
  
  /**
   * 预加载常用模拟数据到内存
   */
  async preloadMockData(): Promise<void> {
    if (!config.USE_MOCK_DATA) {
      console.log('模拟数据未启用，跳过预加载');
      return;
    }
    
    console.log('开始预加载常用模拟数据到内存...');
    const dataTypes = ['users', 'notifications', 'courses', 'exams', 'materials'];
    
    for (const dataType of dataTypes) {
      try {
        await this.loadMockData(dataType);
        console.log(`预加载 ${dataType} 数据成功`);
      } catch (error) {
        console.error(`预加载 ${dataType} 数据失败:`, error);
        // 继续尝试加载其他类型
      }
    }
    
    console.log('模拟数据预加载完成');
  },
  
  /**
   * 清除模拟数据缓存
   */
  clearCache(): void {
    console.log('清除模拟数据缓存');
    Object.keys(mockDataCache).forEach(key => {
      delete mockDataCache[key];
    });
  }
};

// 从URL中提取资源类型
export const extractResourceType = (url: string): string | null => {
  if (!url) return null;
  
  try {
    // 移除查询参数
    const urlPath = url.split('?')[0];
    
    // 尝试匹配常见的资源模式
    const resourcePatterns = [
      // 匹配/api/resourceType格式
      /\/api\/([a-zA-Z0-9-_]+)(?:\/|$)/,
      // 匹配/resourceType格式
      /\/([a-zA-Z0-9-_]+)(?:\/|$)/,
      // 匹配/fallback/resourceType格式
      /\/fallback\/([a-zA-Z0-9-_]+)(?:\/|$)/,
      // 匹配/api/fallback/resourceType格式
      /\/api\/fallback\/([a-zA-Z0-9-_]+)(?:\/|$)/
    ];
    
    for (const pattern of resourcePatterns) {
      const match = urlPath.match(pattern);
      if (match && match[1]) {
        const resourceType = match[1].toLowerCase();
        
        // 忽略常见的非资源路径
        const nonResourcePaths = ['api', 'health', 'auth', 'login', 'logout'];
        if (!nonResourcePaths.includes(resourceType)) {
          return resourceType;
        }
      }
    }
  } catch (error) {
    console.error('从URL提取资源类型时出错:', error);
  }
  
  return null;
};

// 获取默认模拟数据
export const getDefaultMockData = (resourceType: string, method: string = 'get'): any => {
  // 对GET请求返回空数组，对其他请求返回成功状态
  if (method.toLowerCase() === 'get') {
    return [];
  } else {
    return {
      success: true,
      message: '操作成功（默认模拟数据）',
      timestamp: new Date().toISOString()
    };
  }
};

// 初始化降级服务
export const initializeFallbackService = async (): Promise<boolean> => {
  // 这个函数只是一个兼容性函数，实际逻辑已移至dbFallbackService.ts中
  console.log('降级服务初始化已移动到dbFallbackService.ts');
  
  if (config.USE_DB_FALLBACK) {
    try {
      const { preloadCommonFallbackData } = await import('../services/dbFallbackService');
      return preloadCommonFallbackData().then(() => true).catch(() => false);
    } catch (error) {
      console.error('降级服务初始化失败:', error);
      return false;
    }
  }
  
  return false;
};

export default mockDataLoader; 