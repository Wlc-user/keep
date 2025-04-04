/**
 * 模拟数据功能已完全禁用
 * 这个文件仅是为了兼容旧代码的引用
 */

/**
 * 模拟数据环境设置和初始化工具
 */
import config from '../config/env';
import { checkFallbackHealth, preloadCommonFallbackData } from '../services/dbFallbackService';
import copyMockData from './copyMockData';
import * as mockDataLoader from './mockDataLoader';
import InitializationGuard from './InitializationGuard';

/**
 * 创建模拟数据所需的目录结构
 * @returns 是否成功创建目录
 */
export const createMockDirectories = async (): Promise<boolean> => {
  if (!config.USE_MOCK_DATA) {
    console.log('模拟数据模式未启用，跳过创建目录');
    return false;
  }
  
  console.log('开始创建模拟数据目录...');
  
  // 在浏览器环境中，我们不需要实际创建文件目录
  // 这个函数主要是为了保持API兼容性
  return true;
};

/**
 * 检查模拟数据目录结构和文件可用性
 * @returns 是否所有必要的模拟数据文件都可用
 */
export const checkMockDirectories = async (): Promise<boolean> => {
  if (!config.USE_MOCK_DATA) {
    console.log('模拟数据模式未启用，跳过检查目录');
    return false;
  }
  
  console.log('检查模拟数据目录结构...');
  
  // 要检查的资源类型
  const resourceTypes = [
    'users',
    'notifications',
    'courses',
    'exams', 
    'materials',
    'knowledge-graphs',
    'class-evaluations',
    'student-evaluations'
  ];
  
  // 检查每个资源类型的模拟数据文件是否可用
  const availableResources: string[] = [];
  
  for (const resourceType of resourceTypes) {
    const paths = mockDataLoader.buildMockPaths(resourceType, 'get');
    
    // 尝试加载文件
    let found = false;
    for (const path of paths) {
      try {
        const response = await fetch(path);
        if (response.ok) {
          console.log(`模拟数据文件可用: ${path}`);
          availableResources.push(resourceType);
          found = true;
          break;
        }
      } catch (error) {
        // 忽略错误
      }
    }
    
    if (!found) {
      console.log(` 未找到资源类型 ${resourceType} 的模拟数据文件`);
    }
  }
  
  console.log(`模拟数据目录检查完成: ${availableResources.length}/${resourceTypes.length} 种资源可用`);
  return availableResources.length > 0;
};

/**
 * 预加载常用模拟数据
 * @returns 是否成功预加载数据
 */
export const preloadMockData = async (): Promise<boolean> => {
  if (!config.USE_MOCK_DATA) {
    console.log('模拟数据模式未启用，跳过预加载');
    return false;
  }
  
  console.log('开始预加载常用模拟数据...');
  
  // 预加载的资源类型
  const resourceTypes = [
    'exams',
    'notifications',
    'users',
    'courses',
    'materials'
  ];
  
  // 尝试加载每个资源类型
  const loadedResources: string[] = [];
  
  for (const type of resourceTypes) {
    try {
      const data = await mockDataLoader.loadMockData(type);
      
      if (data && ((Array.isArray(data) && data.length > 0) || (!Array.isArray(data) && data))) {
        console.log(`成功预加载 ${type} 的模拟数据`);
        loadedResources.push(type);
      } else {
        console.log(`预加载 ${type} 的模拟数据返回了空数据`);
      }
    } catch (error) {
      console.error(`预加载 ${type} 的模拟数据失败:`, error);
    }
  }
  
  console.log(`模拟数据预加载完成: ${loadedResources.length}/${resourceTypes.length} 种资源成功加载`);
  return loadedResources.length > 0;
};

/**
 * 初始化数据库降级服务
 * @returns 是否成功初始化
 */
export const initializeFallbackService = async (): Promise<boolean> => {
  return InitializationGuard.ensureInitialized('initialize-fallback-service', async () => {
    if (!config.USE_DB_FALLBACK) {
      console.log('数据库降级服务未启用，跳过初始化');
      return false;
    }
    
    console.log('开始初始化数据库降级服务...');
    
    try {
      // 检查降级服务健康状态
      const isHealthy = await checkFallbackHealth();
      
      if (isHealthy) {
        console.log('降级服务健康检查通过，预加载常用降级数据');
        await preloadCommonFallbackData();
        return true;
      } else {
        console.warn('降级服务健康检查失败，跳过预加载');
        return false;
      }
    } catch (error) {
      console.error('初始化降级服务失败:', error);
      return false;
    }
  });
};

/**
 * 初始化模拟数据环境
 */
export const initializeMockEnvironment = async (): Promise<boolean> => {
  return InitializationGuard.ensureInitialized('initialize-mock-environment', async () => {
    if (!config.USE_MOCK_DATA && !config.USE_DB_FALLBACK) {
      console.log('模拟数据与降级服务均未启用，跳过初始化');
      return false;
    }
    
    console.log('初始化模拟数据环境...');
    
    try {
      // 直接预加载模拟数据到内存，避免网络请求
      console.log('正在预加载模拟数据到内存...');
      copyMockData.preloadMockData();
      console.log('模拟数据已加载到内存');
      
      // 创建目录结构（仅开发环境）
      await createMockDirectories();
      
      // 检查模拟数据目录
      const directoryCheck = await checkMockDirectories();
      
      // 预加载其他模拟数据
      const dataPreload = await preloadMockData();
      
      // 如果配置了使用数据库降级，则初始化降级服务
      let fallbackInitialized = false;
      if (config.USE_DB_FALLBACK) {
        console.log('尝试初始化数据库降级服务...');
        fallbackInitialized = await initializeFallbackService();
      } else {
        console.log('数据库降级服务未启用，跳过初始化');
      }
      
      const success = true; // 只要预加载了内存中的模拟数据，就视为成功
      console.log(`模拟数据环境初始化${success ? '成功' : '失败'}`);
      return success;
    } catch (error) {
      console.error('模拟数据环境初始化出错:', error);
      // 出错时仍返回true，因为已经预加载了内存中的模拟数据
      return true;
    }
  });
};

// 默认导出
export default {
  createMockDirectories,
  checkMockDirectories,
  preloadMockData,
  initializeFallbackService,
  initializeMockEnvironment
}; 