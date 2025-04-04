import { message } from 'antd';
import axios, { AxiosError } from 'axios';

/**
 * 错误类型枚举
 */
export enum ErrorType {
  NETWORK = 'network',
  API = 'api',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  TIMEOUT = 'timeout',
  SERVER = 'server',
  CLIENT = 'client',
  UNKNOWN = 'unknown'
}

/**
 * 错误严重程度枚举
 */
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
  FATAL = 'fatal'
}

/**
 * 错误信息接口
 */
export interface ErrorInfo {
  type: ErrorType;
  message: string;
  severity: ErrorSeverity;
  timestamp: number;
  code?: string | number;
  data?: any;
  stack?: string;
  context?: Record<string, any>;
}

/**
 * 错误处理选项
 */
export interface ErrorHandlerOptions {
  showNotification?: boolean;
  logToConsole?: boolean;
  logToServer?: boolean;
  rethrow?: boolean;
}

/**
 * 默认错误处理选项
 */
const defaultOptions: ErrorHandlerOptions = {
  showNotification: true,
  logToConsole: true,
  logToServer: true,
  rethrow: false
};

/**
 * 错误处理工具
 * 负责集中处理认证错误和服务降级状态管理
 */
class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: Array<{time: Date, type: string, message: string, details?: any}> = [];
  private maxLogSize = 100; // 最大保存错误日志数
  private authErrorHandled = false; // 跟踪认证错误是否已处理，避免重复显示消息
  private lastAuthErrorTime = 0; // 上次认证错误时间
  private authErrorCount = 0;
  private readonly MAX_AUTH_ERRORS = 3;
  private resourceDegradation: Record<string, number> = {};
  private authErrorListeners: Array<(error: any) => void> = [];
  private loginSuccessListeners: Array<() => void> = [];
  
  private constructor() {
    // 添加全局错误处理
    window.addEventListener('error', this.handleGlobalError.bind(this));
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
    
    console.log('全局错误处理器已初始化');
  }
  
  /**
   * 获取错误处理实例（单例模式）
   */
  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }
  
  /**
   * 处理全局错误事件
   */
  private handleGlobalError(event: ErrorEvent): void {
    this.logError('global', event.message, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack
    });
  }
  
  /**
   * 处理未捕获的Promise拒绝
   */
  private handleUnhandledRejection(event: PromiseRejectionEvent): void {
    const error = event.reason;
    const message = error instanceof Error ? error.message : String(error);
    
    this.logError('promise', message, {
      stack: error instanceof Error ? error.stack : undefined,
      reason: error
    });
  }
  
  /**
   * 处理认证错误
   * @param error Axios错误
   * @param silent 是否静默处理
   * @returns 是否已处理
   */
  public handleAuthError(error: any, silent: boolean = false): boolean {
    if (!axios.isAxiosError(error)) return false;
    
    const axiosError = error as AxiosError;
    if (axiosError.response?.status !== 401) return false;
    
    // 记录错误
    this.logError('auth', '认证失败', {
      url: axiosError.config?.url,
      method: axiosError.config?.method,
      status: 401
    });
    
    // 如果距离上次认证错误不足3秒，不重复处理
    const now = Date.now();
    if (now - this.lastAuthErrorTime < 3000) {
      return true;
    }
    
    this.lastAuthErrorTime = now;
    
    // 显示消息（除非设置为静默处理）
    if (!silent && !this.authErrorHandled) {
      message.error('登录已过期，请重新登录');
      this.authErrorHandled = true;
      
      // 5分钟后重置状态，允许再次显示认证错误
      setTimeout(() => {
        this.authErrorHandled = false;
      }, 5 * 60 * 1000);
    }
    
    // 检查是否需要清除凭据并重新登录
    const shouldHandleAuth = axiosError.config?.headers?.['handle-auth-error'] !== false;
    if (shouldHandleAuth) {
      // 清除登录信息
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // 触发认证错误事件，让AuthHandler组件处理跳转
      this.triggerAuthErrorEvent(axiosError);
    }
    
    // 增加认证错误计数
    this.authErrorCount++;
    console.warn(`认证错误 #${this.authErrorCount}: `, error?.message || '未知错误');
    
    // 通知所有监听器
    this.notifyAuthErrorListeners(error);
    
    // 超过阈值，需要进行处理
    return this.authErrorCount > this.MAX_AUTH_ERRORS;
  }
  
  /**
   * 触发认证错误事件
   * 用于通知AuthHandler组件处理登录跳转
   * @param error 认证错误
   */
  private triggerAuthErrorEvent(error: AxiosError): void {
    try {
      // 创建并分发自定义事件
      const authErrorEvent = new CustomEvent('auth:error', {
        detail: {
          url: error.config?.url,
          time: new Date(),
          status: error.response?.status
        }
      });
      
      window.dispatchEvent(authErrorEvent);
    } catch (e) {
      console.error('触发认证错误事件失败', e);
    }
  }
  
  /**
   * 触发登录成功事件
   * 用于通知AuthHandler组件更新状态
   */
  public triggerLoginSuccessEvent(): void {
    try {
      // 重置认证错误状态
      this.resetAuthErrorState();
      
      // 创建并分发自定义事件
      const loginSuccessEvent = new CustomEvent('auth:login-success', {
        detail: {
          time: new Date()
        }
      });
      
      window.dispatchEvent(loginSuccessEvent);
      
      // 通知所有登录成功监听器
      this.notifyLoginSuccessListeners();
    } catch (e) {
      console.error('触发登录成功事件失败', e);
    }
  }
  
  /**
   * 处理API错误
   * @param error Axios错误对象
   * @param isSilent 是否静默处理（不显示用户界面提示）
   */
  public handleApiError(error: AxiosError, isSilent = false) {
    // 从错误中提取信息
    const { response, request, message: errorMessage, config } = error;
    
    // 获取API路径用于日志
    const apiPath = config?.url || 'unknown';
    
    // 获取HTTP状态码
    const status = response?.status;
    
    // 设置错误类型标识，用于日志
    let errorType = 'api-generic';
    if (status) {
      errorType = `api-${status}`;
    } else if (!response && request) {
      errorType = 'api-network';
    } else if (!request) {
      errorType = 'api-config';
    }
    
    // 获取错误消息
    const responseData = response?.data as any;
    const errorMsg = responseData?.message || responseData?.error || errorMessage || '未知错误';
    
    // 根据状态码显示不同消息
    let userMessage = '请求失败，请稍后再试';
    let shouldRedirect = false;
    let redirectPath = '';
    
    switch (status) {
      case 400:
        userMessage = '请求参数错误';
        break;
      case 401:
        userMessage = '会话已过期，请重新登录';
        // 检查是否需要处理授权错误
        if (config?.headers?.['handle-auth-error'] !== false) {
          shouldRedirect = true;
          redirectPath = '/login';
          // 清除登录信息
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        break;
      case 403:
        userMessage = '没有权限访问该资源';
        break;
      case 404:
        // 如果启用了模拟数据模式，可以更友好地处理404
        if (config.USE_MOCK_DATA) {
          console.warn(`资源不存在(${apiPath})，但模拟数据模式已启用，将使用模拟数据`);
          userMessage = '';  // 不显示错误消息给用户
          isSilent = true;   // 强制静默
        } else {
          userMessage = '请求的资源不存在';
        }
        break;
      case 500:
        userMessage = '服务器错误，请稍后再试';
        break;
      case 502:
      case 503:
      case 504:
        userMessage = '服务暂时不可用，请稍后再试';
        break;
      default:
        if (!response) {
          userMessage = '网络连接失败，请检查网络设置';
        }
    }

    // 记录错误日志
    this.logError(errorType, error, {
      apiPath,
      status,
      errorMsg,
      config: config ? {
        method: config.method,
        baseURL: config.baseURL,
        timeout: config.timeout
      } : undefined
    });
    
    // 如果不是静默模式，显示提示给用户
    if (!isSilent && userMessage) {
      message.error(userMessage);
    }
    
    // 如果需要重定向
    if (shouldRedirect && redirectPath) {
      setTimeout(() => {
        window.location.href = redirectPath;
      }, 1500);
    }
    
    return {
      error,
      errorType,
      userMessage,
      shouldRedirect
    };
  }
  
  /**
   * 记录错误到内部日志
   * @param type 错误类型
   * @param message 错误消息
   * @param details 错误详情
   */
  public logError(type: string, message: string, details?: any): void {
    // 添加到日志
    this.errorLog.unshift({
      time: new Date(),
      type,
      message,
      details
    });
    
    // 限制日志大小
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }
    
    // 开发环境下在控制台打印
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${type}] ${message}`, details);
    }
  }
  
  /**
   * 获取错误日志
   * @returns 错误日志数组
   */
  public getErrorLog(): Array<{time: Date, type: string, message: string, details?: any}> {
    return [...this.errorLog];
  }
  
  /**
   * 清除错误日志
   */
  public clearErrorLog(): void {
    this.errorLog = [];
    console.log('错误日志已清除');
  }
  
  /**
   * 重置认证错误状态
   * 用于手动重置认证错误处理状态，例如在用户尝试登录后
   */
  public resetAuthErrorState(): void {
    this.authErrorHandled = false;
    this.lastAuthErrorTime = 0;
    this.authErrorCount = 0;
    console.log('认证错误状态已重置');
  }

  /**
   * 验证是否真的是404错误
   */
  public handle404Error(error: AxiosError, resourceKey: string = '资源', isSilent: boolean = false) {
    // 验证是否真的是404错误
    if (!error.response || error.response.status !== 404) {
      return this.handleApiError(error, isSilent);
    }
    
    const { config } = error;
    const apiPath = config?.url || 'unknown';
    
    // 是否需要显示错误信息
    const shouldShowError = !isSilent;
    
    if (shouldShowError) {
      message.error(`请求的${resourceKey}不存在`);
    } else if (config?.USE_MOCK_DATA) {
      console.log(`404错误已静默处理 ${apiPath} (启用了模拟数据)`);
    }
    
    // 提取资源类型
    const resourceType = this.getResourceTypeFromUrl(apiPath);
    
    // 如果识别出了资源类型，触发模拟数据事件
    if (resourceType) {
      this.triggerMockDataEvent(resourceType, apiPath);
    }
    
    return {
      error,
      errorType: 'api-404',
      userMessage: `请求的${resourceKey}不存在`,
      shouldRedirect: false
    };
  }

  /**
   * 触发模拟数据加载事件
   * 用于通知组件尝试加载备用模拟数据
   * @param resourceType 资源类型
   * @param url 原始请求URL
   */
  public triggerMockDataEvent(resourceType: string, url: string): void {
    try {
      // 创建并分发自定义事件
      const mockDataEvent = new CustomEvent('mock:data-needed', {
        detail: {
          resourceType,
          url,
          time: new Date()
        }
      });
      
      window.dispatchEvent(mockDataEvent);
      console.log(`已触发模拟数据加载事件 ${resourceType}`);
    } catch (e) {
      console.error('触发模拟数据事件失败', e);
    }
  }

  /**
   * 添加认证错误监听
   * @param listener 监听器函数
   */
  addAuthErrorListener(listener: (error: any) => void): void {
    this.authErrorListeners.push(listener);
  }
  
  /**
   * 移除认证错误监听
   */
  removeAuthErrorListener(): void {
    this.authErrorListeners = [];
  }
  
  /**
   * 通知所有认证错误监听器
   * @param error 错误对象
   */
  private notifyAuthErrorListeners(error: any): void {
    this.authErrorListeners.forEach(listener => {
      try {
        listener(error);
      } catch (e) {
        console.error('认证错误监听器执行失败', e);
      }
    });
  }
  
  /**
   * 添加登录成功监听
   * @param listener 监听器函数
   */
  addLoginSuccessListener(listener: () => void): void {
    this.loginSuccessListeners.push(listener);
  }
  
  /**
   * 移除登录成功监听
   */
  removeLoginSuccessListener(): void {
    this.loginSuccessListeners = [];
  }
  
  /**
   * 通知所有登录成功监听器
   */
  private notifyLoginSuccessListeners(): void {
    this.loginSuccessListeners.forEach(listener => {
      try {
        listener();
      } catch (e) {
        console.error('登录成功监听器执行失败', e);
      }
    });
  }
  
  /**
   * 从URL获取资源类型
   * @param url API请求URL
   * @returns 资源类型
   */
  getResourceTypeFromUrl(url: string): string {
    if (!url) return 'unknown';
    
    // 常见资源类型匹配
    if (url.includes('/api/notifications')) return 'notifications';
    if (url.includes('/api/courses')) return 'courses';
    if (url.includes('/api/users')) return 'users';
    if (url.includes('/api/auth')) return 'auth';
    
    // 尝试从URL路径中提取
    const urlParts = url.split('/');
    const apiIndex = urlParts.findIndex(part => part === 'api');
    
    if (apiIndex !== -1 && urlParts.length > apiIndex + 1) {
      return urlParts[apiIndex + 1];
    }
    
    return 'unknown';
  }
  
  /**
   * 增加资源降级计数
   * @param resourceType 资源类型
   * @returns 当前降级计数
   */
  incrementDegradationCount(resourceType: string): number {
    if (!this.resourceDegradation[resourceType]) {
      this.resourceDegradation[resourceType] = 0;
    }
    
    this.resourceDegradation[resourceType]++;
    console.warn(`服务 ${resourceType} 降级次数: ${this.resourceDegradation[resourceType]}`);
    
    return this.resourceDegradation[resourceType];
  }
  
  /**
   * 重置资源降级状态
   * @param resourceType 资源类型，不传则重置所有
   */
  resetDegradationStatus(resourceType?: string): void {
    if (resourceType) {
      this.resourceDegradation[resourceType] = 0;
      console.log(`服务 ${resourceType} 降级状态已重置`);
    } else {
      this.resourceDegradation = {};
      console.log('所有服务降级状态已重置');
    }
  }
  
  /**
   * 获取资源降级状态
   * @param resourceType 资源类型
   * @returns 是否已降级
   */
  isResourceDegraded(resourceType: string): boolean {
    return !!this.resourceDegradation[resourceType] && 
           this.resourceDegradation[resourceType] >= 3;
  }
}

// 获取错误处理器实例
const errorHandler = ErrorHandler.getInstance();

// 导出默认实例和命名导出
export default errorHandler;
export { errorHandler };

/**
 * 全局错误处理函数
 * @param error 错误对象
 * @param options 处理选项
 */
export function handleError(error: Error | any, options?: Partial<ErrorHandlerOptions>): void {
  const errorHandler = ErrorHandler.getInstance();
  
  if (axios.isAxiosError(error)) {
    // 处理API错误
    errorHandler.handleApiError(error, options?.showNotification === false);
  } else {
    // 记录一般错误
    errorHandler.logError('global', error instanceof Error ? error.message : String(error), {
      stack: error instanceof Error ? error.stack : undefined,
      options
    });
    
    // 如果需要显示通知
    if (options?.showNotification !== false) {
      message.error(error instanceof Error ? error.message : String(error));
    }
  }
}

// 添加全局声明处理器的变量以便打包时不会出错
if (typeof window !== 'undefined' && !window.errorHandler) {
  (window as any).errorHandler = errorHandler;
}

/**
 * 创建错误处理包装函数
 * @param fn 需要包装的函数
 * @param options 处理选项
 * @returns 包装后的函数
 */
export function withErrorHandling<T extends (...args: any[]) => any>(
  fn: T,
  options?: Partial<ErrorHandlerOptions>
): (...args: Parameters<T>) => ReturnType<T> {
  return (...args: Parameters<T>): ReturnType<T> => {
    try {
      const result = fn(...args);
      
      // 处理 Promise 返回
      if (result instanceof Promise) {
        return result.catch(error => {
          handleError(error, options);
          throw error; // 重新抛出以便调用者处理
        }) as ReturnType<T>;
      }
      
      return result;
    } catch (error) {
      handleError(error, options);
      throw error; // 重新抛出以便调用者处理
    }
  };
}

/**
 * 设置全局错误处理
 * 初始化错误处理器，并注册全局错误捕获
 */
export function setupGlobalErrorHandling(): void {
  try {
    console.log('初始化全局错误处理...');
    
    // 获取错误处理器实例
    const errorHandler = ErrorHandler.getInstance();
    
    // 设置全局未捕获异常处理
    window.addEventListener('error', (event: ErrorEvent) => {
      console.error('全局错误:', event.message);
      const errorInfo: ErrorInfo = {
        type: ErrorType.CLIENT,
        message: event.message || '未知客户端错误',
        severity: ErrorSeverity.ERROR,
        timestamp: Date.now(),
        stack: event.error?.stack,
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      };
      
      handleError(event.error || new Error(event.message), {
        showNotification: true,
        logToConsole: true,
        logToServer: true
      });
      
      return true;
    });
    
    // 设置全局未处理的Promise拒绝处理
    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      const error = event.reason;
      const message = error instanceof Error ? error.message : String(error);
      
      console.error('未处理的Promise拒绝:', message);
      
      const errorInfo: ErrorInfo = {
        type: ErrorType.CLIENT,
        message: message || '未处理的Promise拒绝',
        severity: ErrorSeverity.ERROR,
        timestamp: Date.now(),
        stack: error instanceof Error ? error.stack : undefined,
        context: {
          source: 'unhandledrejection'
        }
      };
      
      handleError(error, {
        showNotification: true,
        logToConsole: true,
        logToServer: true
      });
      
      return true;
    });
    
    console.log('全局错误处理器初始化完成');
  } catch (error) {
    console.error('初始化全局错误处理器失败', error);
  }
} 
