/**
 * 初始化守卫 - 防止重复初始化
 * 用于跟踪已初始化的操作/模块，避免重复执行初始化逻辑
 */
export class InitializationGuard {
  private static instance: InitializationGuard | null = null;
  private initializedOperations: Set<string> = new Set();
  private pendingOperations: Map<string, Promise<boolean>> = new Map();
  private initializationTimestamps: Map<string, number> = new Map();
  
  private constructor() {
    console.log('初始化守卫已创建');
  }
  
  /**
   * 获取单例实例
   */
  public static getInstance(): InitializationGuard {
    if (!InitializationGuard.instance) {
      InitializationGuard.instance = new InitializationGuard();
    }
    return InitializationGuard.instance;
  }
  
  /**
   * 检查操作是否已初始化
   * @param operationId 操作ID
   * @returns 是否已初始化
   */
  public isInitialized(operationId: string): boolean {
    return this.initializedOperations.has(operationId);
  }
  
  /**
   * 标记操作为已初始化
   * @param operationId 操作ID
   */
  public markInitialized(operationId: string): void {
    this.initializedOperations.add(operationId);
    this.initializationTimestamps.set(operationId, Date.now());
    this.pendingOperations.delete(operationId);
  }
  
  /**
   * 获取操作初始化时间
   * @param operationId 操作ID
   * @returns 初始化时间戳或undefined
   */
  public getInitializationTime(operationId: string): number | undefined {
    return this.initializationTimestamps.get(operationId);
  }
  
  /**
   * 执行操作（如果未初始化）
   * @param operationId 操作ID
   * @param initFunction 初始化函数
   * @returns 初始化结果Promise
   */
  public async ensureInitialized(
    operationId: string, 
    initFunction: () => Promise<boolean> | boolean
  ): Promise<boolean> {
    // 如果已初始化，直接返回成功
    if (this.isInitialized(operationId)) {
      console.log(`操作 ${operationId} 已初始化，跳过执行`);
      return true;
    }
    
    // 如果正在初始化，返回正在进行的Promise
    if (this.pendingOperations.has(operationId)) {
      console.log(`操作 ${operationId} 正在初始化中，等待完成`);
      return this.pendingOperations.get(operationId)!;
    }
    
    // 创建新的初始化Promise
    console.log(`开始初始化操作: ${operationId}`);
    const initPromise = Promise.resolve().then(async () => {
      try {
        const result = await initFunction();
        if (result) {
          this.markInitialized(operationId);
        }
        return result;
      } catch (error) {
        console.error(`初始化操作 ${operationId} 失败:`, error);
        this.pendingOperations.delete(operationId);
        return false;
      }
    });
    
    // 存储pending状态
    this.pendingOperations.set(operationId, initPromise);
    
    return initPromise;
  }
  
  /**
   * 检查操作是否正在初始化
   * @param operationId 操作ID
   * @returns 是否正在初始化
   */
  public isInitializing(operationId: string): boolean {
    return this.pendingOperations.has(operationId);
  }
  
  /**
   * 获取所有已初始化的操作
   * @returns 操作ID数组
   */
  public getInitializedOperations(): string[] {
    return Array.from(this.initializedOperations);
  }
  
  /**
   * 重置指定操作的初始化状态
   * @param operationId 操作ID
   */
  public resetOperation(operationId: string): void {
    this.initializedOperations.delete(operationId);
    this.pendingOperations.delete(operationId);
    this.initializationTimestamps.delete(operationId);
  }
  
  /**
   * 清空所有初始化状态 (主要用于测试)
   */
  public reset(): void {
    this.initializedOperations.clear();
    this.pendingOperations.clear();
    this.initializationTimestamps.clear();
  }
}

// 导出单例实例
export default InitializationGuard.getInstance(); 