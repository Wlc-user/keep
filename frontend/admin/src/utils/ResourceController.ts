/**
 * 资源控制器 - 单例类
 * 管理资源加载，防止重复加载和初始化
 */
export class ResourceController {
  private static instance: ResourceController | null = null;
  private loadedResources: Set<string> = new Set();
  private loadingResources: Map<string, Promise<boolean>> = new Map();
  private initializationStatus: Map<string, boolean> = new Map();
  private degradationStatus: Map<string, number> = new Map();
  private cachedResources: Map<string, any> = new Map(); // 缓存资源数据
  
  private constructor() {
    console.log('资源控制器已初始化');
  }
  
  /**
   * 获取单例实例
   */
  public static getInstance(): ResourceController {
    if (!ResourceController.instance) {
      ResourceController.instance = new ResourceController();
    }
    return ResourceController.instance;
  }
  
  /**
   * 初始化资源
   * @param resourceId 资源ID
   * @returns 是否成功初始化
   */
  public initialize(resourceId: string): boolean {
    if (this.initializationStatus.get(resourceId)) {
      console.log(`资源 ${resourceId} 已经初始化，跳过`);
      return true;
    }
    
    console.log(`初始化资源: ${resourceId}`);
    this.initializationStatus.set(resourceId, true);
    return true;
  }
  
  /**
   * 加载CSS资源
   * @param url CSS文件URL
   * @returns 加载Promise
   */
  public loadCSS(url: string): Promise<boolean> {
    if (this.isResourceLoaded(url)) {
      console.log(`CSS已加载: ${url}`);
      return Promise.resolve(true);
    }
    
    if (this.loadingResources.has(url)) {
      console.log(`CSS正在加载中: ${url}`);
      return this.loadingResources.get(url)!;
    }
    
    console.log(`开始加载CSS: ${url}`);
    const loadPromise = new Promise<boolean>((resolve) => {
      try {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        
        link.onload = () => {
          console.log(`CSS加载成功: ${url}`);
          this.markResourceLoaded(url);
          resolve(true);
        };
        
        link.onerror = () => {
          console.error(`CSS加载失败: ${url}`);
          this.loadingResources.delete(url);
          resolve(false);
        };
        
        document.head.appendChild(link);
      } catch (error) {
        console.error(`CSS加载出错: ${url}`, error);
        this.loadingResources.delete(url);
        resolve(false);
      }
    });
    
    this.loadingResources.set(url, loadPromise);
    return loadPromise;
  }
  
  /**
   * 加载JS资源
   * @param url JS文件URL
   * @param async 是否异步加载
   * @param defer 是否延迟执行
   * @returns 加载Promise
   */
  public loadScript(url: string, async = true, defer = false): Promise<boolean> {
    if (this.isResourceLoaded(url)) {
      console.log(`脚本已加载: ${url}`);
      return Promise.resolve(true);
    }
    
    if (this.loadingResources.has(url)) {
      console.log(`脚本正在加载中: ${url}`);
      return this.loadingResources.get(url)!;
    }
    
    console.log(`开始加载脚本: ${url}`);
    const loadPromise = new Promise<boolean>((resolve) => {
      try {
        const script = document.createElement('script');
        script.src = url;
        script.async = async;
        script.defer = defer;
        
        script.onload = () => {
          console.log(`脚本加载成功: ${url}`);
          this.markResourceLoaded(url);
          resolve(true);
        };
        
        script.onerror = () => {
          console.error(`脚本加载失败: ${url}`);
          this.loadingResources.delete(url);
          resolve(false);
        };
        
        document.body.appendChild(script);
      } catch (error) {
        console.error(`脚本加载出错: ${url}`, error);
        this.loadingResources.delete(url);
        resolve(false);
      }
    });
    
    this.loadingResources.set(url, loadPromise);
    return loadPromise;
  }
  
  /**
   * 检查资源是否已加载
   * @param url 资源URL
   * @returns 是否已加载
   */
  public isResourceLoaded(url: string): boolean {
    return this.loadedResources.has(url);
  }
  
  /**
   * 标记资源为已加载
   * @param url 资源URL
   */
  public markResourceLoaded(url: string): void {
    this.loadedResources.add(url);
    this.loadingResources.delete(url);
  }
  
  /**
   * 获取已加载资源列表
   * @returns 已加载资源URL数组
   */
  public getLoadedResources(): string[] {
    return Array.from(this.loadedResources);
  }
  
  /**
   * 检查资源是否正在加载
   * @param url 资源URL
   * @returns 是否正在加载
   */
  public isResourceLoading(url: string): boolean {
    return this.loadingResources.has(url);
  }
  
  /**
   * 获取降级状态
   * @param key 资源键
   * @returns 降级次数
   */
  public getDegradationStatus(key: string): number {
    return this.degradationStatus.get(key) || 0;
  }
  
  /**
   * 设置降级状态
   * @param key 资源键
   * @param count 降级次数
   */
  public setDegradationStatus(key: string, count: number): void {
    this.degradationStatus.set(key, count);
  }
  
  /**
   * 重置降级状态
   * @param key 资源键
   */
  public resetDegradationStatus(key: string): void {
    this.degradationStatus.delete(key);
  }
  
  /**
   * 获取缓存的资源数据
   * @param url 资源URL
   * @returns 缓存的资源数据，如果不存在则返回undefined
   */
  public getCachedResource(url: string): any {
    return this.cachedResources.get(url);
  }
  
  /**
   * 设置缓存的资源数据
   * @param url 资源URL
   * @param data 资源数据
   */
  public setCachedResource(url: string, data: any): void {
    this.cachedResources.set(url, data);
    this.markResourceLoaded(url);
  }
  
  /**
   * 检查是否有缓存的资源数据
   * @param url 资源URL
   * @returns 是否有缓存
   */
  public hasCachedResource(url: string): boolean {
    return this.cachedResources.has(url);
  }
  
  /**
   * 清除缓存的资源数据
   * @param url 资源URL，如果不提供则清除所有
   */
  public clearCachedResources(url?: string): void {
    if (url) {
      this.cachedResources.delete(url);
    } else {
      this.cachedResources.clear();
    }
  }
  
  /**
   * 清空资源记录 (主要用于测试)
   */
  public reset(): void {
    this.loadedResources.clear();
    this.loadingResources.clear();
    this.initializationStatus.clear();
    this.degradationStatus.clear();
    this.cachedResources.clear();
  }
  
  /**
   * 从URL中提取资源类型
   * @param url API URL
   * @returns 资源类型，如果无法提取则返回null
   */
  public static getResourceTypeFromUrl(url: string): string | null {
    if (!url) return null;
    
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
          console.log(`从URL ${url} 提取到资源类型: ${resourceType}`);
          return resourceType;
        }
      }
    }
    
    console.log(`无法从URL ${url} 提取资源类型`);
    return null;
  }
  
  /**
   * 递增降级次数并返回
   * @param url 资源URL
   * @returns 增加后的降级次数
   */
  public static incrementDegradationCount(url: string): number {
    if (!url) return 0;
    
    const instance = ResourceController.getInstance();
    const currentCount = instance.getDegradationStatus(url);
    const newCount = currentCount + 1;
    instance.setDegradationStatus(url, newCount);
    return newCount;
  }
  
  /**
   * 清除指定的缓存资源
   * @param url 资源URL
   */
  public clearCachedResource(url: string): void {
    this.cachedResources.delete(url);
    this.loadedResources.delete(url);
    console.log(`已清除缓存资源: ${url}`);
  }
  
  /**
   * 清除所有符合前缀的缓存资源
   * @param prefix 资源URL前缀
   */
  public static clearAllCachedResources(prefix: string): void {
    const instance = ResourceController.getInstance();
    
    // 清除所有匹配前缀的资源
    Array.from(instance.cachedResources.keys())
      .filter(key => key.startsWith(prefix))
      .forEach(key => {
        instance.cachedResources.delete(key);
        instance.loadedResources.delete(key);
      });
    
    console.log(`已清除所有以 "${prefix}" 开头的缓存资源`);
  }
}

// 导出单例实例
export default ResourceController.getInstance(); 