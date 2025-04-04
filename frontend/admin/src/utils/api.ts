import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { message } from 'antd';
import ResourceController from './ResourceController';
import InitializationGuard from './InitializationGuard';
import config from '../config/env'; // 导入环境配置

// 缓存过期时间（毫秒）
const CACHE_EXPIRY = 5 * 60 * 1000; // 5分钟

// 创建axios实例
const api = axios.create({
  baseURL: config.API_BASE_URL || '/api',
  timeout: config.API_TIMEOUT || 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求缓存和去重
const requestCache = new Map<string, any>();
const pendingRequests = new Map<string, AbortController>();

/**
 * 生成请求唯一ID
 * @param method HTTP方法
 * @param url 请求URL
 * @param params 查询参数
 * @param data 请求体数据
 * @returns 请求唯一ID
 */
const getRequestId = (method: string, url: string, params?: any, data?: any): string => {
  return `${method}:${url}:${JSON.stringify(params || {})}:${JSON.stringify(data || {})}`;
};

/**
 * 防止重复请求
 * @param config 请求配置
 */
const preventDuplicateRequests = (config: AxiosRequestConfig): void => {
  const { method = 'GET', url = '' } = config;
  const requestId = getRequestId(method, url, config.params, config.data);
  
  // 取消重复的请求（只对GET请求处理）
  if (pendingRequests.has(requestId) && method.toUpperCase() === 'GET') {
    const controller = pendingRequests.get(requestId);
    if (controller) {
      console.log(`取消重复请求: ${requestId}`);
      controller.abort();
    }
  }
  
  // 创建AbortController用于以后取消
  const controller = new AbortController();
  config.signal = controller.signal;
  pendingRequests.set(requestId, controller);
  
  // 设置请求ID到headers中
  config.headers = config.headers || {};
  config.headers['X-Request-ID'] = requestId;
};

// 请求拦截器
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // 防止重复请求
    preventDuplicateRequests(config);
    
    // 从localStorage获取token
    const token = localStorage.getItem('token');
    
    // 如果存在token，则添加到请求头
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 为GET请求添加时间戳，避免缓存
    if (config.method?.toUpperCase() === 'GET' && config.params) {
      config.params._t = Date.now();
    }
    
    // 设置请求开始时间
    if (config.headers) {
      config.headers['x-request-time'] = Date.now().toString();
    }
    
    return config;
  },
  (error: AxiosError) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // 清理请求跟踪
    const requestId = response.config.headers?.['X-Request-ID'] as string;
    if (requestId) {
      pendingRequests.delete(requestId);
    }
    
    // 重置降级状态
    const url = response.config.url;
    if (url) {
      ResourceController.resetDegradationStatus(url);
    }
    
    // 计算请求耗时
    const requestTime = Number(response.config.headers?.['x-request-time'] || 0);
    if (requestTime) {
      const responseTime = Date.now() - requestTime;
      console.log(`请求耗时: ${responseTime}ms - ${response.config.method} ${response.config.url}`);
    }
    
    // 如果响应成功，直接返回数据
    return response.data;
  },
  async (error: AxiosError) => {
    // 如果请求被取消，静默处理
    if (axios.isCancel(error)) {
      console.log('请求已取消:', error.config?.url);
      return Promise.reject(error);
    }
    
    // 清理请求跟踪
    if (error.config?.headers) {
      const requestId = error.config.headers['X-Request-ID'] as string;
      if (requestId) {
        pendingRequests.delete(requestId);
      }
    }
    
    // 降级处理
    const url = error.config?.url || '';
    const degradationCount = ResourceController.getDegradationStatus(url);
    const MAX_RETRIES = 2;
    
    // 重试逻辑（网络错误或504）
    const shouldRetry = 
      (!error.response || error.response.status === 504) && 
      degradationCount < MAX_RETRIES && 
      error.config;
    
    if (shouldRetry && error.config) {
      ResourceController.setDegradationStatus(url, degradationCount + 1);
      console.log(`重试请求 (${degradationCount + 1}/${MAX_RETRIES}): ${url}`);
      
      // 指数退避
      const delayMs = Math.pow(2, degradationCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, delayMs));
      
      // 重新发送请求
      return api(error.config);
    }
    
    // 处理错误响应
    if (error.response) {
      const { status, data } = error.response;
      
      // 处理不同的HTTP状态码
      switch (status) {
        case 400:
          message.error('请求参数错误');
          break;
        case 401:
          message.error('未授权，请重新登录');
          // 清除token和用户信息
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // 重定向到登录页
          window.location.href = '/login';
          break;
        case 403:
          message.error('没有权限访问该资源');
          break;
        case 404:
          message.error('请求的资源不存在');
          break;
        case 500:
          message.error('服务器错误，请稍后再试');
          break;
        default:
          message.error(`请求失败: ${(data as any)?.message || '未知错误'}`);
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      message.error('网络错误，请检查您的网络连接');
      
      // 如果设置了使用模拟数据，尝试获取模拟数据
      if (config.USE_MOCK_DATA && error.config?.url) {
        console.log('尝试使用模拟数据...');
        try {
          // 这里可以实现获取模拟数据的逻辑
          // 此处简单返回一个空数组或空对象
          const mockData = error.config.method?.toUpperCase() === 'GET' ? [] : { success: true };
          return mockData;
        } catch (mockError) {
          console.error('获取模拟数据失败:', mockError);
        }
      }
    } else {
      // 请求配置出错
      message.error(`请求错误: ${error.message}`);
    }
    
    // 清理降级状态，避免内存泄漏
    if (degradationCount >= MAX_RETRIES) {
      ResourceController.resetDegradationStatus(url);
    }
    
    // 返回错误信息
    return Promise.reject(error);
  }
);

/**
 * 从缓存获取数据
 * @param cacheKey 缓存键
 * @returns 缓存数据或undefined
 */
const getFromCache = (cacheKey: string): any | undefined => {
  if (!requestCache.has(cacheKey)) {
    return undefined;
  }
  
  const { data, timestamp, expiry } = requestCache.get(cacheKey);
  // 检查是否过期
  if (Date.now() > timestamp + expiry) {
    requestCache.delete(cacheKey);
    return undefined;
  }
  
  return data;
};

// 封装GET请求
export const get = <T>(url: string, params?: any, useCache: boolean = false, config?: AxiosRequestConfig): Promise<T> => {
  // 如果使用缓存，先尝试从缓存获取
  if (useCache) {
    const cacheKey = getRequestId('GET', url, params);
    const cachedData = getFromCache(cacheKey);
    if (cachedData) {
      console.log(`使用缓存数据: ${url}`);
      return Promise.resolve(cachedData);
    }
  }
  
  return api.get(url, { params, ...config }).then(response => {
    // 如果使用缓存，保存到缓存
    if (useCache) {
      const cacheKey = getRequestId('GET', url, params);
      requestCache.set(cacheKey, {
        data: response,
        timestamp: Date.now(),
        expiry: CACHE_EXPIRY
      });
    }
    return response;
  });
};

// 封装POST请求
export const post = <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  return api.post(url, data, config);
};

// 封装PUT请求
export const put = <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  return api.put(url, data, config);
};

// 封装DELETE请求
export const del = <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  return api.delete(url, config);
};

// 封装PATCH请求
export const patch = <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  return api.patch(url, data, config);
};

// 封装上传文件请求
export const upload = <T>(url: string, file: File, onProgress?: (percent: number) => void): Promise<T> => {
  const formData = new FormData();
  formData.append('file', file);
  
  return api.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    },
  });
};

/**
 * 批量发送请求
 * @param requests 请求配置数组
 * @returns 响应数组
 */
export const batch = async <T>(requests: Array<{
  method: 'get' | 'post' | 'put' | 'delete' | 'patch',
  url: string,
  params?: any,
  data?: any,
  useCache?: boolean
}>): Promise<T[]> => {
  return Promise.all(requests.map(req => {
    switch(req.method) {
      case 'get':
        return get(req.url, req.params, req.useCache);
      case 'post':
        return post(req.url, req.data);
      case 'put':
        return put(req.url, req.data);
      case 'delete':
        return del(req.url);
      case 'patch':
        return patch(req.url, req.data);
      default:
        return Promise.reject(new Error(`不支持的方法: ${req.method}`));
    }
  }));
};

/**
 * 清除缓存
 * @param url 可选的URL，如果提供则只清除该URL的缓存
 */
export const clearCache = (url?: string): void => {
  if (url) {
    // 清除特定URL的缓存
    for (const [key, _] of requestCache) {
      if (key.includes(`:${url}:`)) {
        requestCache.delete(key);
      }
    }
  } else {
    // 清除所有缓存
    requestCache.clear();
  }
};

// 初始化API
InitializationGuard.ensureInitialized('api-service', () => {
  console.log('API服务已初始化');
  return true;
});

export default api; 