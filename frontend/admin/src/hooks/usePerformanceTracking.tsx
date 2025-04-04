import { useEffect, useRef } from 'react';
import { performanceMonitor } from '../utils/performanceMonitor';

/**
 * 组件性能跟踪选项
 */
export interface ComponentTrackingOptions {
  componentName?: string;
  trackRender?: boolean;
  trackMount?: boolean;
  trackUpdate?: boolean;
  trackUnmount?: boolean;
  trackInteractions?: boolean;
  trackProps?: boolean;
  trackChildren?: boolean;
  trackState?: boolean;
  trackContext?: boolean;
  trackEffects?: boolean;
  trackMemo?: boolean;
  trackCallback?: boolean;
  trackReducer?: boolean;
  trackRef?: boolean;
  trackImperativeHandle?: boolean;
  trackLayoutEffect?: boolean;
  trackDebugValue?: boolean;
  trackId?: boolean;
  trackDeps?: boolean;
  trackDepsChange?: boolean;
  trackDepsChangeCount?: boolean;
  trackDepsChangeTime?: boolean;
  trackDepsChangeTimeAvg?: boolean;
  trackDepsChangeTimeMax?: boolean;
  trackDepsChangeTimeMin?: boolean;
  trackDepsChangeTimeTotal?: boolean;
  trackDepsChangeTimeCount?: boolean;
  trackDepsChangeTimeLast?: boolean;
  trackDepsChangeTimeFirst?: boolean;
  trackDepsChangeTimeMedian?: boolean;
  trackDepsChangeTimePercentile?: boolean;
  trackDepsChangeTimeStdDev?: boolean;
  trackDepsChangeTimeVariance?: boolean;
  trackDepsChangeTimeHistogram?: boolean;
  trackDepsChangeTimeDistribution?: boolean;
  trackDepsChangeTimeDistributionBuckets?: number;
  trackDepsChangeTimeDistributionMin?: number;
  trackDepsChangeTimeDistributionMax?: number;
  trackDepsChangeTimeDistributionStep?: number;
  trackDepsChangeTimeDistributionScale?: 'linear' | 'log' | 'log10' | 'log2' | 'ln';
  trackDepsChangeTimeDistributionNormalize?: boolean;
  trackDepsChangeTimeDistributionNormalizeBy?: 'max' | 'sum' | 'count';
  trackDepsChangeTimeDistributionNormalizeByValue?: number;
}

/**
 * 默认组件性能跟踪选项
 */
const defaultOptions: ComponentTrackingOptions = {
  componentName: undefined,
  trackRender: true,
  trackMount: true,
  trackUpdate: true,
  trackUnmount: true,
  trackInteractions: false,
  trackProps: false,
  trackChildren: false,
  trackState: false,
  trackContext: false,
  trackEffects: false,
  trackMemo: false,
  trackCallback: false,
  trackReducer: false,
  trackRef: false,
  trackImperativeHandle: false,
  trackLayoutEffect: false,
  trackDebugValue: false,
  trackId: false,
  trackDeps: false,
  trackDepsChange: false,
  trackDepsChangeCount: false,
  trackDepsChangeTime: false,
  trackDepsChangeTimeAvg: false,
  trackDepsChangeTimeMax: false,
  trackDepsChangeTimeMin: false,
  trackDepsChangeTimeTotal: false,
  trackDepsChangeTimeCount: false,
  trackDepsChangeTimeLast: false,
  trackDepsChangeTimeFirst: false,
  trackDepsChangeTimeMedian: false,
  trackDepsChangeTimePercentile: false,
  trackDepsChangeTimeStdDev: false,
  trackDepsChangeTimeVariance: false,
  trackDepsChangeTimeHistogram: false,
  trackDepsChangeTimeDistribution: false,
  trackDepsChangeTimeDistributionBuckets: 10,
  trackDepsChangeTimeDistributionMin: 0,
  trackDepsChangeTimeDistributionMax: 1000,
  trackDepsChangeTimeDistributionStep: 100,
  trackDepsChangeTimeDistributionScale: 'linear',
  trackDepsChangeTimeDistributionNormalize: false,
  trackDepsChangeTimeDistributionNormalizeBy: 'max',
  trackDepsChangeTimeDistributionNormalizeByValue: 1,
};

/**
 * 组件性能跟踪Hook
 * @param options 性能跟踪选项
 * @returns 性能跟踪对象
 */
export function usePerformanceTracking(options?: Partial<ComponentTrackingOptions>) {
  const mergedOptions = { ...defaultOptions, ...options };
  const componentName = mergedOptions.componentName || 'UnknownComponent';
  
  // 使用 ref 存储时间戳和计数器
  const renderCount = useRef(0);
  const mountTime = useRef(0);
  const renderStartTime = useRef(performance.now());
  const lastRenderTime = useRef(0);
  const totalRenderTime = useRef(0);
  const maxRenderTime = useRef(0);
  const minRenderTime = useRef(Number.MAX_SAFE_INTEGER);
  
  // 跟踪组件挂载
  useEffect(() => {
    if (mergedOptions.trackMount) {
      mountTime.current = performance.now();
      const mountDuration = mountTime.current - renderStartTime.current;
      
      performanceMonitor.trackComponentRender(componentName, mountDuration, {
        type: 'mount',
        renderCount: renderCount.current,
      });
      
      // 记录初始渲染时间
      lastRenderTime.current = mountDuration;
      totalRenderTime.current = mountDuration;
      maxRenderTime.current = Math.max(maxRenderTime.current, mountDuration);
      minRenderTime.current = Math.min(minRenderTime.current, mountDuration);
    }
    
    // 跟踪组件卸载
    return () => {
      if (mergedOptions.trackUnmount) {
        const unmountStartTime = performance.now();
        
        // 使用 setTimeout 确保在组件完全卸载后记录时间
        setTimeout(() => {
          const unmountDuration = performance.now() - unmountStartTime;
          
          performanceMonitor.trackComponentRender(componentName, unmountDuration, {
            type: 'unmount',
            renderCount: renderCount.current,
            totalRenderTime: totalRenderTime.current,
            avgRenderTime: totalRenderTime.current / renderCount.current,
            maxRenderTime: maxRenderTime.current,
            minRenderTime: minRenderTime.current,
          });
        }, 0);
      }
    };
  }, [componentName, mergedOptions.trackMount, mergedOptions.trackUnmount]);
  
  // 跟踪组件更新
  useEffect(() => {
    // 跳过首次渲染（挂载）
    if (renderCount.current > 0 && mergedOptions.trackUpdate) {
      const updateEndTime = performance.now();
      const updateDuration = updateEndTime - renderStartTime.current;
      
      performanceMonitor.trackComponentRender(componentName, updateDuration, {
        type: 'update',
        renderCount: renderCount.current,
      });
      
      // 更新渲染时间统计
      lastRenderTime.current = updateDuration;
      totalRenderTime.current += updateDuration;
      maxRenderTime.current = Math.max(maxRenderTime.current, updateDuration);
      minRenderTime.current = Math.min(minRenderTime.current, updateDuration);
    }
    
    // 增加渲染计数并重置开始时间（为下一次渲染做准备）
    renderCount.current += 1;
    renderStartTime.current = performance.now();
  });
  
  /**
   * 跟踪用户交互
   * @param interactionName 交互名称
   * @param fn 要执行的函数
   * @returns 包装后的函数
   */
  const trackInteraction = <T extends (...args: any[]) => any>(
    interactionName: string,
    fn: T
  ): ((...args: Parameters<T>) => ReturnType<T>) => {
    if (!mergedOptions.trackInteractions) {
      return fn;
    }
    
    return (...args: Parameters<T>): ReturnType<T> => {
      const startTime = performance.now();
      const result = fn(...args);
      
      // 如果结果是 Promise，跟踪异步完成时间
      if (result instanceof Promise) {
        result.finally(() => {
          const duration = performance.now() - startTime;
          performanceMonitor.trackInteraction(`${componentName}:${interactionName}`, duration, {
            async: true,
          });
        });
      } else {
        // 同步函数，直接跟踪
        const duration = performance.now() - startTime;
        performanceMonitor.trackInteraction(`${componentName}:${interactionName}`, duration, {
          async: false,
        });
      }
      
      return result;
    };
  };
  
  /**
   * 手动标记性能点
   * @param markName 标记名称
   */
  const mark = (markName: string) => {
    performanceMonitor.mark(`${componentName}:${markName}`);
  };
  
  /**
   * 测量两个标记之间的时间
   * @param measureName 测量名称
   * @param startMarkName 开始标记名称
   * @param endMarkName 结束标记名称（可选，默认为当前时间）
   * @returns 测量的持续时间（毫秒）
   */
  const measure = (measureName: string, startMarkName: string, endMarkName?: string): number => {
    return performanceMonitor.measure(
      `${componentName}:${measureName}`,
      `${componentName}:${startMarkName}`,
      endMarkName ? `${componentName}:${endMarkName}` : undefined
    );
  };
  
  /**
   * 获取性能统计信息
   * @returns 性能统计对象
   */
  const getStats = () => {
    return {
      componentName,
      renderCount: renderCount.current,
      lastRenderTime: lastRenderTime.current,
      totalRenderTime: totalRenderTime.current,
      avgRenderTime: renderCount.current > 0 ? totalRenderTime.current / renderCount.current : 0,
      maxRenderTime: maxRenderTime.current,
      minRenderTime: minRenderTime.current === Number.MAX_SAFE_INTEGER ? 0 : minRenderTime.current,
    };
  };
  
  return {
    trackInteraction,
    mark,
    measure,
    getStats,
  };
}

/**
 * 创建一个性能跟踪的高阶组件
 * @param options 性能跟踪选项
 * @returns 高阶组件
 */
export function withPerformanceTracking<P extends object>(
  options?: Partial<ComponentTrackingOptions>
) {
  return (Component: React.ComponentType<P>): React.FC<P> => {
    const displayName = Component.displayName || Component.name || 'UnknownComponent';
    const componentOptions = {
      componentName: displayName,
      ...options,
    };
    
    const WrappedComponent: React.FC<P> = (props) => {
      usePerformanceTracking(componentOptions);
      return <Component {...props} />;
    };
    
    WrappedComponent.displayName = `WithPerformanceTracking(${displayName})`;
    return WrappedComponent;
  };
} 