/**
 * 数据库降级服务已禁用
 * 此文件存在仅为支持旧代码引用
 */

export async function checkFallbackHealth(): Promise<boolean> {
  console.log('数据库降级服务已禁用，健康检查直接返回false');
  return false;
}

export const getDbFallbackData = async (
  resourceType: string, 
  params?: Record<string, any>,
  useCache: boolean = true,
  retryCount: number = 2
): Promise<any> => {
  console.log('数据库降级服务已禁用，数据获取直接返回null');
  return null;
};

export const preloadCommonFallbackData = async (): Promise<void> => {
  console.log('数据库降级服务已禁用，跳过预加载');
  return;
};

export const resetFallbackCache = (resourceType?: string): void => {
  console.log('数据库降级服务已禁用，跳过缓存重置');
  return;
}; 