/**
 * 性能监控工具
 * 用于跟踪和分析应用性能指标
 */

/**
 * 性能指标类型
 */
export enum MetricType {
  // Web Vitals
  FCP = 'first-contentful-paint',
  LCP = 'largest-contentful-paint',
  FID = 'first-input-delay',
  CLS = 'cumulative-layout-shift',
  TTFB = 'time-to-first-byte',
  // 自定义指标
  COMPONENT_RENDER = 'component-render',
  API_REQUEST = 'api-request',
  RESOURCE_LOAD = 'resource-load',
  INTERACTION = 'interaction',
  NAVIGATION = 'navigation',
  CUSTOM = 'custom'
}

/**
 * 性能指标接口
 */
export interface PerformanceMetric {
  type: MetricType;
  name: string;
  value: number;
  timestamp: number;
  details?: Record<string, any>;
}

/**
 * 性能监控选项
 */
export interface PerformanceMonitorOptions {
  sampleRate?: number; // 采样率 (0-1)
  maxEntries?: number; // 最大记录条数
  reportingEndpoint?: string; // 上报端点
  reportingInterval?: number; // 上报间隔 (ms)
  includeWebVitals?: boolean; // 是否包含 Web Vitals
  debug?: boolean; // 是否开启调试模式
}

/**
 * 默认选项
 */
const defaultOptions: PerformanceMonitorOptions = {
  sampleRate: 0.1, // 默认采样 10% 的用户
  maxEntries: 100,
  reportingEndpoint: '/api/v1/performance',
  reportingInterval: 60000, // 1分钟
  includeWebVitals: true,
  debug: false
};

/**
 * 性能监控类
 */
class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private options: PerformanceMonitorOptions;
  private metrics: PerformanceMetric[] = [];
  private isMonitoring: boolean = false;
  private reportingTimer: number | null = null;
  private sessionId: string;
  private marks: Record<string, number> = {};
  private measures: Record<string, { start: number; end: number }> = {};
  
  /**
   * 获取单例实例
   */
  public static getInstance(options?: Partial<PerformanceMonitorOptions>): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor(options);
    } else if (options) {
      PerformanceMonitor.instance.updateOptions(options);
    }
    return PerformanceMonitor.instance;
  }
  
  /**
   * 构造函数
   */
  private constructor(options?: Partial<PerformanceMonitorOptions>) {
    this.options = { ...defaultOptions, ...options };
    this.sessionId = this.generateSessionId();
    
    // 检查是否应该根据采样率启用监控
    if (Math.random() <= this.options.sampleRate!) {
      this.isMonitoring = true;
    }
  }
  
  /**
   * 更新选项
   */
  public updateOptions(options: Partial<PerformanceMonitorOptions>): void {
    this.options = { ...this.options, ...options };
  }
  
  /**
   * 生成会话ID
   */
  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
  
  /**
   * 启动监控
   */
  public start(): void {
    if (!this.isMonitoring) {
      this.isMonitoring = true;
    }
    
    // 如果启用了 Web Vitals 监控，初始化它
    if (this.options.includeWebVitals) {
      this.initWebVitals();
    }
    
    // 设置定期上报
    if (this.options.reportingInterval && this.options.reportingInterval > 0) {
      this.reportingTimer = window.setInterval(() => {
        this.reportMetrics();
      }, this.options.reportingInterval);
    }
    
    // 在页面卸载前上报
    window.addEventListener('beforeunload', () => {
      this.reportMetrics();
    });
    
    this.log('性能监控已启动');
  }
  
  /**
   * 停止监控
   */
  public stop(): void {
    this.isMonitoring = false;
    
    if (this.reportingTimer) {
      clearInterval(this.reportingTimer);
      this.reportingTimer = null;
    }
    
    this.log('性能监控已停止');
  }
  
  /**
   * 初始化 Web Vitals 监控
   */
  private async initWebVitals(): Promise<void> {
    try {
      const { onFCP, onLCP, onFID, onCLS, onTTFB } = await import('web-vitals');
      
      onFCP(metric => {
        this.addMetric({
          type: MetricType.FCP,
          name: 'First Contentful Paint',
          value: metric.value,
          timestamp: Date.now(),
          details: {
            ...metric
          }
        });
      });
      
      onLCP(metric => {
        this.addMetric({
          type: MetricType.LCP,
          name: 'Largest Contentful Paint',
          value: metric.value,
          timestamp: Date.now(),
          details: {
            ...metric
          }
        });
      });
      
      onFID(metric => {
        this.addMetric({
          type: MetricType.FID,
          name: 'First Input Delay',
          value: metric.value,
          timestamp: Date.now(),
          details: {
            ...metric
          }
        });
      });
      
      onCLS(metric => {
        this.addMetric({
          type: MetricType.CLS,
          name: 'Cumulative Layout Shift',
          value: metric.value,
          timestamp: Date.now(),
          details: {
            ...metric
          }
        });
      });
      
      onTTFB(metric => {
        this.addMetric({
          type: MetricType.TTFB,
          name: 'Time To First Byte',
          value: metric.value,
          timestamp: Date.now(),
          details: {
            ...metric
          }
        });
      });
      
      this.log('Web Vitals 监控已初始化');
    } catch (error) {
      console.error('初始化 Web Vitals 失败:', error);
    }
  }
  
  /**
   * 添加性能指标
   */
  public addMetric(metric: PerformanceMetric): void {
    if (!this.isMonitoring) return;
    
    this.metrics.push(metric);
    
    // 限制指标数量
    if (this.options.maxEntries && this.metrics.length > this.options.maxEntries) {
      this.metrics = this.metrics.slice(-this.options.maxEntries);
    }
    
    this.log(`添加性能指标: ${metric.name} = ${metric.value}`);
  }
  
  /**
   * 记录组件渲染时间
   */
  public trackComponentRender(componentName: string, renderTime: number, details?: Record<string, any>): void {
    this.addMetric({
      type: MetricType.COMPONENT_RENDER,
      name: `${componentName} 渲染`,
      value: renderTime,
      timestamp: Date.now(),
      details
    });
  }
  
  /**
   * 记录 API 请求时间
   */
  public trackApiRequest(endpoint: string, duration: number, status: number, details?: Record<string, any>): void {
    this.addMetric({
      type: MetricType.API_REQUEST,
      name: `API 请求 ${endpoint}`,
      value: duration,
      timestamp: Date.now(),
      details: {
        endpoint,
        status,
        ...details
      }
    });
  }
  
  /**
   * 记录资源加载时间
   */
  public trackResourceLoad(resourceUrl: string, duration: number, resourceType: string, details?: Record<string, any>): void {
    this.addMetric({
      type: MetricType.RESOURCE_LOAD,
      name: `资源加载 ${resourceType}`,
      value: duration,
      timestamp: Date.now(),
      details: {
        url: resourceUrl,
        type: resourceType,
        ...details
      }
    });
  }
  
  /**
   * 记录用户交互时间
   */
  public trackInteraction(interactionName: string, duration: number, details?: Record<string, any>): void {
    this.addMetric({
      type: MetricType.INTERACTION,
      name: `交互 ${interactionName}`,
      value: duration,
      timestamp: Date.now(),
      details
    });
  }
  
  /**
   * 记录页面导航时间
   */
  public trackNavigation(from: string, to: string, duration: number, details?: Record<string, any>): void {
    this.addMetric({
      type: MetricType.NAVIGATION,
      name: `导航 ${from} -> ${to}`,
      value: duration,
      timestamp: Date.now(),
      details: {
        from,
        to,
        ...details
      }
    });
  }
  
  /**
   * 记录自定义指标
   */
  public trackCustom(name: string, value: number, details?: Record<string, any>): void {
    this.addMetric({
      type: MetricType.CUSTOM,
      name,
      value,
      timestamp: Date.now(),
      details
    });
  }
  
  /**
   * 设置性能标记
   */
  public mark(name: string): void {
    if (!this.isMonitoring) return;
    
    this.marks[name] = performance.now();
    this.log(`设置标记: ${name}`);
  }
  
  /**
   * 测量两个标记之间的时间
   */
  public measure(name: string, startMark: string, endMark?: string): number {
    if (!this.isMonitoring) return 0;
    
    const start = this.marks[startMark];
    if (!start) {
      console.warn(`标记 "${startMark}" 不存在`);
      return 0;
    }
    
    const end = endMark ? this.marks[endMark] : performance.now();
    if (endMark && !end) {
      console.warn(`标记 "${endMark}" 不存在`);
      return 0;
    }
    
    const duration = end - start;
    this.measures[name] = { start, end };
    
    this.addMetric({
      type: MetricType.CUSTOM,
      name,
      value: duration,
      timestamp: Date.now(),
      details: {
        startMark,
        endMark: endMark || 'now',
        start,
        end
      }
    });
    
    this.log(`测量 "${name}": ${duration.toFixed(2)}ms`);
    return duration;
  }
  
  /**
   * 上报性能指标
   */
  public reportMetrics(): void {
    if (!this.isMonitoring || this.metrics.length === 0) return;
    
    const metricsToReport = [...this.metrics];
    this.metrics = [];
    
    const payload = {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      metrics: metricsToReport
    };
    
    // 在开发环境中，只打印日志而不进行实际上报
    if (import.meta.env.DEV || (typeof process !== 'undefined' && process.env.NODE_ENV === 'development')) {
      this.log(`已收集 ${metricsToReport.length} 条性能指标(开发环境不上报)`);
      // 在开发环境中提供控制台日志以便调试
      if (this.options.debug) {
        console.log('[性能监控] 性能数据:', payload);
      }
      return;
    }
    
    // 生产环境中进行实际上报
    // 使用 Beacon API 上报，不阻塞页面卸载
    if (navigator.sendBeacon && this.options.reportingEndpoint) {
      navigator.sendBeacon(
        this.options.reportingEndpoint,
        JSON.stringify(payload)
      );
      this.log(`已上报 ${metricsToReport.length} 条性能指标`);
      return;
    }
    
    // 回退到 fetch API
    if (this.options.reportingEndpoint) {
      fetch(this.options.reportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        // 使用 keepalive 确保请求在页面卸载后仍能完成
        keepalive: true
      })
        .then(() => {
          this.log(`已上报 ${metricsToReport.length} 条性能指标`);
        })
        .catch(error => {
          console.error('上报性能指标失败:', error);
          // 失败时将指标放回队列
          this.metrics = [...metricsToReport, ...this.metrics];
        });
    }
  }
  
  /**
   * 获取所有性能指标
   */
  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }
  
  /**
   * 清除所有性能指标
   */
  public clearMetrics(): void {
    this.metrics = [];
    this.log('已清除所有性能指标');
  }
  
  /**
   * 记录日志
   */
  private log(message: string): void {
    if (this.options.debug) {
      console.log(`[性能监控] ${message}`);
    }
  }
}

// 导出单例实例
export const performanceMonitor = PerformanceMonitor.getInstance({
  debug: import.meta.env.DEV || (typeof process !== 'undefined' && process.env.NODE_ENV === 'development'),
  reportingInterval: import.meta.env.DEV ? 0 : 60000 // 开发环境禁用自动上报
});

/**
 * 高阶组件，用于跟踪组件渲染性能
 */
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
): React.FC<P> {
  const displayName = componentName || Component.displayName || Component.name || 'UnknownComponent';
  
  const WrappedComponent: React.FC<P> = (props) => {
    const startTime = performance.now();
    
    // 使用 React.useEffect 在组件渲染后记录性能
    React.useEffect(() => {
      const renderTime = performance.now() - startTime;
      performanceMonitor.trackComponentRender(displayName, renderTime);
    });
    
    return React.createElement(Component, props);
  };
  
  WrappedComponent.displayName = `WithPerformanceTracking(${displayName})`;
  return WrappedComponent;
}

/**
 * 初始化性能监控
 */
export function initPerformanceMonitoring(options?: Partial<PerformanceMonitorOptions>): void {
  const monitor = PerformanceMonitor.getInstance(options);
  monitor.start();
} 