/**
 * 缓存工具类
 * 提供内存缓存和本地存储缓存功能，用于优化应用性能
 */

// 内存缓存对象
const memoryCache: Record<string, {
  value: any;
  expiry: number | null;
}> = {};

/**
 * 设置内存缓存
 * @param key 缓存键
 * @param value 缓存值
 * @param ttl 过期时间（毫秒），不设置则永不过期
 */
export const setMemoryCache = (key: string, value: any, ttl?: number): void => {
  memoryCache[key] = {
    value,
    expiry: ttl ? Date.now() + ttl : null
  };
};

/**
 * 获取内存缓存
 * @param key 缓存键
 * @returns 缓存值，如果不存在或已过期则返回null
 */
export const getMemoryCache = <T>(key: string): T | null => {
  const item = memoryCache[key];
  
  // 如果缓存不存在
  if (!item) return null;
  
  // 如果缓存已过期
  if (item.expiry && item.expiry < Date.now()) {
    delete memoryCache[key];
    return null;
  }
  
  return item.value as T;
};

/**
 * 删除内存缓存
 * @param key 缓存键
 */
export const removeMemoryCache = (key: string): void => {
  delete memoryCache[key];
};

/**
 * 清空所有内存缓存
 */
export const clearMemoryCache = (): void => {
  Object.keys(memoryCache).forEach(key => {
    delete memoryCache[key];
  });
};

/**
 * 设置本地存储缓存
 * @param key 缓存键
 * @param value 缓存值
 * @param ttl 过期时间（毫秒），不设置则永不过期
 */
export const setLocalCache = (key: string, value: any, ttl?: number): void => {
  const item = {
    value,
    expiry: ttl ? Date.now() + ttl : null
  };
  
  localStorage.setItem(key, JSON.stringify(item));
};

/**
 * 获取本地存储缓存
 * @param key 缓存键
 * @returns 缓存值，如果不存在或已过期则返回null
 */
export const getLocalCache = <T>(key: string): T | null => {
  const itemStr = localStorage.getItem(key);
  
  // 如果缓存不存在
  if (!itemStr) return null;
  
  try {
    const item = JSON.parse(itemStr);
    
    // 如果缓存已过期
    if (item.expiry && item.expiry < Date.now()) {
      localStorage.removeItem(key);
      return null;
    }
    
    return item.value as T;
  } catch (error) {
    console.error('解析缓存数据失败:', error);
    return null;
  }
};

/**
 * 删除本地存储缓存
 * @param key 缓存键
 */
export const removeLocalCache = (key: string): void => {
  localStorage.removeItem(key);
};

/**
 * 清空所有本地存储缓存（仅清除由此工具创建的缓存）
 * @param prefix 缓存键前缀，用于筛选要清除的缓存
 */
export const clearLocalCache = (prefix?: string): void => {
  if (prefix) {
    // 清除指定前缀的缓存
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    });
  } else {
    // 清除所有缓存
    localStorage.clear();
  }
};

/**
 * 缓存装饰器（用于类方法）
 * @param ttl 过期时间（毫秒）
 * @param keyPrefix 缓存键前缀
 */
export function memoize(ttl: number = 60000, keyPrefix: string = 'memo') {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(...args: any[]) {
      // 生成缓存键
      const key = `${keyPrefix}:${propertyKey}:${JSON.stringify(args)}`;
      
      // 尝试从缓存获取
      let result = getMemoryCache(key);
      
      if (result === null) {
        // 如果缓存不存在，执行原方法
        result = originalMethod.apply(this, args);
        
        // 如果结果是Promise，等待解析后缓存
        if (result instanceof Promise) {
          return result.then((value: any) => {
            setMemoryCache(key, value, ttl);
            return value;
          });
        }
        
        // 缓存结果
        setMemoryCache(key, result, ttl);
      }
      
      return result;
    };
    
    return descriptor;
  };
}

/**
 * 创建一个带有缓存功能的函数
 * @param fn 原函数
 * @param ttl 过期时间（毫秒）
 * @param keyPrefix 缓存键前缀
 */
export function createCachedFunction<T extends (...args: any[]) => any>(
  fn: T,
  ttl: number = 60000,
  keyPrefix: string = 'fn'
): T {
  return ((...args: Parameters<T>): ReturnType<T> => {
    // 生成缓存键
    const key = `${keyPrefix}:${fn.name}:${JSON.stringify(args)}`;
    
    // 尝试从缓存获取
    let result = getMemoryCache<ReturnType<T>>(key);
    
    if (result === null) {
      // 如果缓存不存在，执行原函数
      result = fn(...args);
      
      // 如果结果是Promise，等待解析后缓存
      if (result instanceof Promise) {
        return result.then((value: any) => {
          setMemoryCache(key, value, ttl);
          return value;
        }) as ReturnType<T>;
      }
      
      // 缓存结果
      setMemoryCache(key, result, ttl);
    }
    
    return result;
  }) as T;
} 