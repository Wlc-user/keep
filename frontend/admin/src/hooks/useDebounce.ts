import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * 防抖Hook，用于延迟执行频繁触发的操作
 * @param value 需要防抖的值
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的值
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    // 设置定时器
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    // 清除定时器
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

/**
 * 防抖函数Hook，用于延迟执行频繁触发的函数
 * @param fn 需要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @param deps 依赖项数组
 * @returns 防抖后的函数
 */
export function useDebounceFn<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300,
  deps: any[] = []
): [(...args: Parameters<T>) => void, () => void] {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 清除定时器
  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);
  
  // 组件卸载时清除定时器
  useEffect(() => {
    return () => cancel();
  }, [cancel]);
  
  // 防抖函数
  const debouncedFn = useCallback((...args: Parameters<T>) => {
    // 清除之前的定时器
    cancel();
    
    // 设置新的定时器
    timerRef.current = setTimeout(() => {
      fn(...args);
    }, delay);
  }, [fn, delay, cancel, ...deps]);
  
  return [debouncedFn, cancel];
}

/**
 * 节流Hook，用于限制函数执行频率
 * @param value 需要节流的值
 * @param delay 延迟时间（毫秒）
 * @returns 节流后的值
 */
export function useThrottle<T>(value: T, delay: number = 300): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExecutedRef = useRef<number>(0);
  
  useEffect(() => {
    const now = Date.now();
    const remaining = delay - (now - lastExecutedRef.current);
    
    if (remaining <= 0) {
      // 如果已经过了延迟时间，立即更新值
      setThrottledValue(value);
      lastExecutedRef.current = now;
    } else {
      // 否则设置定时器
      const timer = setTimeout(() => {
        setThrottledValue(value);
        lastExecutedRef.current = Date.now();
      }, remaining);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [value, delay]);
  
  return throttledValue;
}

/**
 * 节流函数Hook，用于限制函数执行频率
 * @param fn 需要节流的函数
 * @param delay 延迟时间（毫秒）
 * @param deps 依赖项数组
 * @returns 节流后的函数
 */
export function useThrottleFn<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300,
  deps: any[] = []
): [(...args: Parameters<T>) => void, () => void] {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastExecutedRef = useRef<number>(0);
  const argsRef = useRef<Parameters<T> | null>(null);
  
  // 清除定时器
  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);
  
  // 组件卸载时清除定时器
  useEffect(() => {
    return () => cancel();
  }, [cancel]);
  
  // 节流函数
  const throttledFn = useCallback((...args: Parameters<T>) => {
    argsRef.current = args;
    const now = Date.now();
    const remaining = delay - (now - lastExecutedRef.current);
    
    if (remaining <= 0) {
      // 如果已经过了延迟时间，立即执行函数
      lastExecutedRef.current = now;
      fn(...args);
    } else if (!timerRef.current) {
      // 否则设置定时器
      timerRef.current = setTimeout(() => {
        lastExecutedRef.current = Date.now();
        timerRef.current = null;
        
        if (argsRef.current) {
          fn(...argsRef.current);
        }
      }, remaining);
    }
  }, [fn, delay, cancel, ...deps]);
  
  return [throttledFn, cancel];
} 