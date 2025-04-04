/**
 * 模拟数据功能已完全禁用
 * 这个文件仅是为了兼容旧代码的引用
 */

/**
 * 所有函数返回false，无需任何实际操作
 */
export const createMockDirectories = async (): Promise<boolean> => false;
export const checkMockDirectories = async (): Promise<boolean> => false;
export const preloadMockData = async (): Promise<boolean> => false;
export const initializeFallbackService = async (): Promise<boolean> => false;
export const initializeMockEnvironment = async (): Promise<boolean> => false;

// 默认导出
export default {
  createMockDirectories,
  checkMockDirectories,
  preloadMockData,
  initializeFallbackService,
  initializeMockEnvironment
}; 