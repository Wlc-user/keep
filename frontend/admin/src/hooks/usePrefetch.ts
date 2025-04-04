import { useEffect, useRef, useState } from 'react';
import { setMemoryCache, getMemoryCache } from '../utils/cacheUtils';
import { performanceMonitor } from '../utils/performanceMonitor';

/**
 * 预加载选项
 */
export interface PrefetchOptions {
  enabled?: boolean;
  cacheKey?: string;
  cacheTTL?: number;
  retry?: number;
  retryDelay?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  dependencies?: any[];
}

/**
 * 预加载状态
 */
export type PrefetchStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * 预加载结果
 */
export interface PrefetchResult<T> {
  data: T | null;
  status: PrefetchStatus;
  error: Error | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  refetch: () => Promise<T | null>;
}

/**
 * 预加载数据Hook
 * @param fetcher 获取数据的函数
 * @param options 预加载选项
 * @returns 预加载结果
 */
export function usePrefetch<T>(
  fetcher: () => Promise<T>,
  options: PrefetchOptions = {}
): PrefetchResult<T> {
  const {
    enabled = true,
    cacheKey,
    cacheTTL = 5 * 60 * 1000, // 默认缓存5分钟
    retry = 0,
    retryDelay = 1000,
    onSuccess,
    onError,
    dependencies = [],
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<PrefetchStatus>('idle');
  const [error, setError] = useState<Error | null>(null);
  
  // 使用 ref 跟踪重试次数和是否已卸载
  const retryCount = useRef(0);
  const isMounted = useRef(true);
  
  // 跟踪组件是否已卸载
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // 执行预加载
  const fetchData = async (): Promise<T | null> => {
    // 如果禁用了预加载，直接返回
    if (!enabled) {
      return null;
    }
    
    // 如果有缓存键，先尝试从缓存获取
    if (cacheKey) {
      const cachedData = getMemoryCache<T>(cacheKey);
      if (cachedData) {
        if (isMounted.current) {
          setData(cachedData);
          setStatus('success');
          setError(null);
        }
        onSuccess?.(cachedData);
        return cachedData;
      }
    }
    
    // 开始加载
    if (isMounted.current) {
      setStatus('loading');
    }
    
    // 记录开始时间
    const startTime = performance.now();
    
    try {
      // 获取数据
      const result = await fetcher();
      
      // 记录加载时间
      const loadTime = performance.now() - startTime;
      performanceMonitor.trackCustom('prefetch', loadTime, {
        cacheKey,
        success: true,
      });
      
      // 如果组件已卸载，不更新状态
      if (!isMounted.current) {
        return result;
      }
      
      // 更新状态
      setData(result);
      setStatus('success');
      setError(null);
      
      // 如果有缓存键，缓存结果
      if (cacheKey) {
        setMemoryCache(cacheKey, result, cacheTTL);
      }
      
      // 调用成功回调
      onSuccess?.(result);
      
      // 重置重试计数
      retryCount.current = 0;
      
      return result;
    } catch (err) {
      // 记录加载时间
      const loadTime = performance.now() - startTime;
      performanceMonitor.trackCustom('prefetch', loadTime, {
        cacheKey,
        success: false,
        error: err,
      });
      
      // 如果组件已卸载，不更新状态
      if (!isMounted.current) {
        return null;
      }
      
      const fetchError = err instanceof Error ? err : new Error(String(err));
      
      // 如果还有重试次数，进行重试
      if (retryCount.current < retry) {
        retryCount.current += 1;
        
        // 延迟重试
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        
        // 如果组件已卸载，不进行重试
        if (!isMounted.current) {
          return null;
        }
        
        // 重试
        return fetchData();
      }
      
      // 更新状态
      setStatus('error');
      setError(fetchError);
      
      // 调用错误回调
      onError?.(fetchError);
      
      // 重置重试计数
      retryCount.current = 0;
      
      return null;
    }
  };
  
  // 当依赖项变化时重新获取数据
  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled, ...dependencies]);
  
  return {
    data,
    status,
    error,
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error',
    refetch: fetchData,
  };
}

/**
 * 预加载多个数据Hook
 * @param fetchers 获取数据的函数对象
 * @param options 预加载选项
 * @returns 预加载结果对象
 */
export function useMultiPrefetch<T extends Record<string, () => Promise<any>>>(
  fetchers: T,
  options: PrefetchOptions = {}
): Record<keyof T, PrefetchResult<any>> {
  const results: Record<string, PrefetchResult<any>> = {};
  
  // 为每个 fetcher 创建一个 usePrefetch hook
  for (const key in fetchers) {
    if (Object.prototype.hasOwnProperty.call(fetchers, key)) {
      const fetcher = fetchers[key];
      const cacheKey = options.cacheKey ? `${options.cacheKey}:${key}` : undefined;
      
      // 使用 usePrefetch hook
      // @ts-ignore - 动态创建 hook 调用
      results[key] = usePrefetch(fetcher, {
        ...options,
        cacheKey,
      });
    }
  }
  
  return results as Record<keyof T, PrefetchResult<any>>;
}

/**
 * 预加载路由数据Hook
 * @param routeData 路由数据映射
 * @param options 预加载选项
 * @returns 预加载结果
 */
export function usePrefetchRouteData<T>(
  routeData: Record<string, () => Promise<T>>,
  options: PrefetchOptions & { currentRoute: string } = { currentRoute: '' }
): PrefetchResult<T> {
  const { currentRoute, ...restOptions } = options;
  
  // 获取当前路由的数据加载函数
  const currentFetcher = routeData[currentRoute];
  
  // 如果没有当前路由的数据加载函数，返回空结果
  if (!currentFetcher) {
    return {
      data: null,
      status: 'idle',
      error: null,
      isLoading: false,
      isSuccess: false,
      isError: false,
      refetch: async () => null,
    };
  }
  
  // 使用 usePrefetch hook 加载当前路由数据
  return usePrefetch(currentFetcher, {
    ...restOptions,
    cacheKey: `route:${currentRoute}`,
  });
}

/**
 * 预加载图片Hook
 * @param urls 图片URL数组
 * @param options 预加载选项
 * @returns 预加载结果
 */
export function usePrefetchImages(
  urls: string[],
  options: PrefetchOptions = {}
): PrefetchResult<Record<string, boolean>> {
  // 创建图片预加载函数
  const prefetchImages = async (): Promise<Record<string, boolean>> => {
    const results: Record<string, boolean> = {};
    
    // 并行加载所有图片
    await Promise.all(
      urls.map(async (url) => {
        try {
          // 创建图片对象
          const img = new Image();
          
          // 等待图片加载完成
          await new Promise<void>((resolve, reject) => {
            img.onload = () => {
              results[url] = true;
              resolve();
            };
            img.onerror = () => {
              results[url] = false;
              reject(new Error(`Failed to load image: ${url}`));
            };
            img.src = url;
          });
        } catch (error) {
          results[url] = false;
        }
      })
    );
    
    return results;
  };
  
  // 使用 usePrefetch hook 预加载图片
  return usePrefetch(prefetchImages, {
    ...options,
    cacheKey: options.cacheKey || `images:${urls.join(',')}`,
  });
}

/**
 * 预加载脚本Hook
 * @param urls 脚本URL数组
 * @param options 预加载选项
 * @returns 预加载结果
 */
export function usePrefetchScripts(
  urls: string[],
  options: PrefetchOptions = {}
): PrefetchResult<Record<string, boolean>> {
  // 创建脚本预加载函数
  const prefetchScripts = async (): Promise<Record<string, boolean>> => {
    const results: Record<string, boolean> = {};
    
    // 并行加载所有脚本
    await Promise.all(
      urls.map(async (url) => {
        try {
          // 检查脚本是否已加载
          if (document.querySelector(`script[src="${url}"]`)) {
            results[url] = true;
            return;
          }
          
          // 创建脚本元素
          const script = document.createElement('script');
          script.type = 'text/javascript';
          script.async = true;
          
          // 等待脚本加载完成
          await new Promise<void>((resolve, reject) => {
            script.onload = () => {
              results[url] = true;
              resolve();
            };
            script.onerror = () => {
              results[url] = false;
              reject(new Error(`Failed to load script: ${url}`));
            };
            script.src = url;
            document.head.appendChild(script);
          });
        } catch (error) {
          results[url] = false;
        }
      })
    );
    
    return results;
  };
  
  // 使用 usePrefetch hook 预加载脚本
  return usePrefetch(prefetchScripts, {
    ...options,
    cacheKey: options.cacheKey || `scripts:${urls.join(',')}`,
  });
}

/**
 * 预加载样式表Hook
 * @param urls 样式表URL数组
 * @param options 预加载选项
 * @returns 预加载结果
 */
export function usePrefetchStylesheets(
  urls: string[],
  options: PrefetchOptions = {}
): PrefetchResult<Record<string, boolean>> {
  // 创建样式表预加载函数
  const prefetchStylesheets = async (): Promise<Record<string, boolean>> => {
    const results: Record<string, boolean> = {};
    
    // 并行加载所有样式表
    await Promise.all(
      urls.map(async (url) => {
        try {
          // 检查样式表是否已加载
          if (document.querySelector(`link[href="${url}"]`)) {
            results[url] = true;
            return;
          }
          
          // 创建链接元素
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          
          // 等待样式表加载完成
          await new Promise<void>((resolve, reject) => {
            link.onload = () => {
              results[url] = true;
              resolve();
            };
            link.onerror = () => {
              results[url] = false;
              reject(new Error(`Failed to load stylesheet: ${url}`));
            };
            link.href = url;
            document.head.appendChild(link);
          });
        } catch (error) {
          results[url] = false;
        }
      })
    );
    
    return results;
  };
  
  // 使用 usePrefetch hook 预加载样式表
  return usePrefetch(prefetchStylesheets, {
    ...options,
    cacheKey: options.cacheKey || `stylesheets:${urls.join(',')}`,
  });
} 