/**
 * 数据库降级服务已禁用
 * 此文件存在仅为支持旧代码引用
 */

import axios from 'axios';
import config from '../config/env';
import ResourceController from '../utils/ResourceController';

// 创建专用的axios实例用于降级服务
const fallbackApi = axios.create({
  baseURL: config.FALLBACK_API_PATH,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'X-Request-Source': 'frontend-fallback'
  }
});

// 资源缓存，避免重复请求
const resourceCache = new Map<string, any>();

/**
 * 使用Fetch API获取数据的方法
 */
async function fetchDataWithFetch(resourceType: string, params?: Record<string, any>): Promise<any> {
  // 我们同时尝试两种路径：'/api/fallback'和'/fallback'
  const urls = [
    `${config.FALLBACK_API_PATH}/${resourceType}`,  // 使用配置的路径 - /api/fallback
    `/fallback/${resourceType}`                     // 直接使用/fallback路径
  ];
  
  console.log(`尝试使用Fetch API获取 ${resourceType} 数据，将尝试以下URL:`, urls);
  
  // 构建查询参数
  const queryParams = new URLSearchParams({
    ...(params || {}),
    _t: Date.now().toString()
  }).toString();
  
  // 尝试所有可能的URL
  let lastError = null;
  for (const baseUrl of urls) {
    try {
      const url = `${baseUrl}?${queryParams}`;
      console.log(`正在尝试获取: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Source': 'frontend-fallback-fetch'
        },
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`成功从 ${url} 获取数据`);
        return data;
      } else {
        console.warn(`请求 ${url} 返回非成功状态码: ${response.status}`);
      }
    } catch (error) {
      lastError = error;
      console.warn(`使用URL ${baseUrl} 获取 ${resourceType} 数据失败:`, error);
      // 继续尝试下一个URL
    }
  }
  
  // 所有URL都失败
  console.error(`所有URL尝试都失败，最后的错误:`, lastError);
  return null;
}

/**
 * 使用Axios获取数据的方法
 */
async function fetchDataWithAxios(resourceType: string, params?: Record<string, any>): Promise<any> {
  // 我们同时尝试两种路径：'/api/fallback'和'/fallback'
  const urls = [
    `${config.FALLBACK_API_PATH}/${resourceType}`,  // 使用配置的路径 - /api/fallback
    `/fallback/${resourceType}`                     // 直接使用/fallback路径
  ];
  
  console.log(`尝试使用Axios获取 ${resourceType} 数据，将尝试以下URL:`, urls);
  
  // 构建查询参数
  const queryParams = {
    ...(params || {}),
    _t: Date.now()
  };
  
  // 尝试所有可能的URL
  let lastError = null;
  for (const baseUrl of urls) {
    try {
      console.log(`正在使用Axios尝试获取: ${baseUrl}`);
      
      const response = await axios.get(baseUrl, {
        params: queryParams,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Source': 'frontend-fallback-axios'
        },
        timeout: 5000
      });
      
      if (response.status === 200 && response.data) {
        console.log(`成功从 ${baseUrl} 获取数据`);
        return response.data;
      } else {
        console.warn(`请求 ${baseUrl} 返回非成功状态码: ${response.status}`);
      }
    } catch (error) {
      lastError = error;
      console.warn(`使用URL ${baseUrl} 获取 ${resourceType} 数据失败:`, error);
      // 继续尝试下一个URL
    }
  }
  
  // 所有URL都失败
  console.error(`所有URL尝试都失败，最后的错误:`, lastError);
  return null;
}

/**
 * 检查降级服务的健康状态
 */
export async function checkFallbackHealth(): Promise<boolean> {
  if (!config.USE_DB_FALLBACK) {
    console.log('数据库降级功能未启用，跳过健康检查');
    return false;
  }

  // 首先尝试直接访问后端API的健康检查端点
  const directEndpoints = [
    `${config.API_BASE_URL.replace(/\/api$/, '')}/health`,
    `${config.API_BASE_URL}/health`
  ];

  // 然后尝试其他降级服务端点
  const fallbackEndpoints = [
    `${config.FALLBACK_API_PATH}/health`,
    `/fallback/health`,
    `/api/fallback/health`,
    `/api/health`
  ];
  
  // 合并所有要检查的端点
  const healthEndpoints = [...directEndpoints, ...fallbackEndpoints];

  console.log('正在检查后端服务健康状态，将尝试以下端点:', healthEndpoints);

  // 尝试所有可能的健康检查端点
  for (const endpoint of healthEndpoints) {
    try {
      // 使用fetch方法尝试
      console.log(`正在使用fetch检查健康状态: ${endpoint}`);
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Source': 'frontend-health-check'
        },
        cache: 'no-store'
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`健康检查成功! 服务正常运行 (${endpoint})`, data);
        return true;
      } else {
        console.warn(`健康检查请求 ${endpoint} 返回非成功状态码: ${response.status}`);
      }
    } catch (fetchError) {
      console.warn(`使用fetch检查健康状态失败 (${endpoint}):`, fetchError);

      // 如果fetch失败，尝试使用axios
      try {
        console.log(`正在使用axios检查健康状态: ${endpoint}`);
        const axiosResponse = await axios.get(endpoint, {
          headers: {
            'Content-Type': 'application/json',
            'X-Request-Source': 'frontend-health-check-axios'
          },
          timeout: 3000
        });

        if (axiosResponse.status === 200) {
          console.log(`使用axios健康检查成功! 服务正常运行 (${endpoint})`, axiosResponse.data);
          return true;
        } else {
          console.warn(`axios健康检查请求 ${endpoint} 返回非成功状态码: ${axiosResponse.status}`);
        }
      } catch (axiosError) {
        console.warn(`使用axios检查健康状态失败 (${endpoint}):`, axiosError);
      }
    }
  }

  console.error('所有健康检查端点都失败，后端服务可能不可用');
  return false;
}

/**
 * 获取降级数据
 * 首先尝试从缓存中获取，如果缓存中没有则从服务器获取
 */
export const getDbFallbackData = async (
  resourceType: string, 
  params?: Record<string, any>,
  useCache: boolean = true,
  retryCount: number = 2
): Promise<any> => {
  if (!config.USE_DB_FALLBACK) {
    console.log('数据库降级服务未启用');
    return null;
  }
  
  console.log(`尝试获取降级数据: ${resourceType}`);
  
  // 构建缓存键
  const cacheKey = `fallback_${resourceType}_${JSON.stringify(params || {})}`;
  
  // 如果启用缓存且缓存中有数据，则返回缓存数据
  if (useCache && resourceCache.has(cacheKey)) {
    console.log(`使用缓存的降级数据: ${resourceType}`);
    return resourceCache.get(cacheKey);
  }
  
  try {
    // 首先尝试使用fetch
    let data = await fetchDataWithFetch(resourceType, params);
    
    // 如果fetch失败，尝试使用axios
    if (!data && retryCount > 0) {
      console.log(`使用fetch获取数据失败，尝试使用axios`);
      data = await fetchDataWithAxios(resourceType, params);
    }
    
    // 如果获取到数据，缓存并返回
    if (data) {
      console.log(`成功获取降级数据: ${resourceType}`);
      if (useCache) {
        resourceCache.set(cacheKey, data);
      }
      return data;
    }
    
    console.log(`获取降级数据失败: ${resourceType}`);
    return null;
  } catch (error) {
    console.error(`获取降级数据出错: ${resourceType}`, error);
    return null;
  }
};

/**
 * 重置降级数据缓存
 */
export const resetFallbackCache = (resourceType?: string): void => {
  if (resourceType) {
    // 删除指定资源类型的缓存
    const prefix = `fallback_${resourceType}`;
    [...resourceCache.keys()]
      .filter(key => key.startsWith(prefix))
      .forEach(key => resourceCache.delete(key));
    
    console.log(`已重置 ${resourceType} 的降级数据缓存`);
  } else {
    // 删除所有缓存
    resourceCache.clear();
    console.log('已重置所有降级数据缓存');
  }
};

/**
 * 预加载常用降级数据
 */
export const preloadCommonFallbackData = async (): Promise<void> => {
  if (!config.USE_DB_FALLBACK) {
    console.log('数据库降级服务未启用，跳过预加载');
    return;
  }
  
  console.log('开始预加载常用降级数据...');
  
  // 检查降级服务健康状态
  const isHealthy = await checkFallbackHealth();
  if (!isHealthy) {
    console.warn('降级服务不可用，跳过预加载');
    return;
  }
  
  // 要预加载的常用资源类型
  const resourceTypes = [
    'notifications',
    'courses',
    'exams',
    'users',
    'materials'
  ];
  
  // 并行预加载所有资源
  const loadPromises = resourceTypes.map(async (type) => {
    try {
      const data = await getDbFallbackData(type, {}, true, 1);
      const success = !!data;
      console.log(`预加载 ${type} ${success ? '成功' : '失败'}`);
      return { type, success };
    } catch (error) {
      console.error(`预加载 ${type} 出错:`, error);
      return { type, success: false };
    }
  });
  
  // 等待所有预加载完成
  const results = await Promise.all(loadPromises);
  
  // 统计成功率
  const successCount = results.filter(r => r.success).length;
  console.log(`降级数据预加载完成: ${successCount}/${resourceTypes.length} 成功`);
};

export default {
  checkFallbackHealth,
  getDbFallbackData,
  preloadCommonFallbackData,
  resetFallbackCache
}; 