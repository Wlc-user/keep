import { NavigateFunction } from 'react-router-dom';

/**
 * 应用路由工具函数
 */

// 路由历史记录
const routeHistory: string[] = [];

// 最大历史记录长度
const MAX_HISTORY_LENGTH = 50;

/**
 * 添加路由历史记录
 * @param path 路由路径
 */
export const addRouteHistory = (path: string): void => {
  // 避免重复添加同一路径
  if (routeHistory.length > 0 && routeHistory[routeHistory.length - 1] === path) {
    return;
  }
  
  routeHistory.push(path);
  
  // 限制历史记录长度
  if (routeHistory.length > MAX_HISTORY_LENGTH) {
    routeHistory.shift();
  }
  
  // 在本地存储中保存最近的10条记录
  const recentHistory = routeHistory.slice(-10);
  localStorage.setItem('route_history', JSON.stringify(recentHistory));
};

/**
 * 获取路由历史记录
 */
export const getRouteHistory = (): string[] => {
  return [...routeHistory];
};

/**
 * 清除路由历史记录
 */
export const clearRouteHistory = (): void => {
  routeHistory.length = 0;
  localStorage.removeItem('route_history');
};

/**
 * 获取上一个路由
 */
export const getPreviousRoute = (): string | null => {
  if (routeHistory.length < 2) {
    return null;
  }
  return routeHistory[routeHistory.length - 2];
};

/**
 * 导航到上一个路由
 * @param navigate react-router-dom的navigate函数
 * @param defaultPath 默认路径，如果没有上一个路由则使用此路径
 */
export const navigateBack = (navigate: NavigateFunction, defaultPath: string = '/'): void => {
  const prevRoute = getPreviousRoute();
  if (prevRoute) {
    navigate(prevRoute);
  } else {
    navigate(defaultPath);
  }
};

/**
 * 带状态导航 - 可以传递数据给目标路由
 * @param navigate react-router-dom的navigate函数
 * @param path 目标路径
 * @param state 要传递的状态数据
 */
export const navigateWithState = (navigate: NavigateFunction, path: string, state: any): void => {
  navigate(path, { state });
};

/**
 * 检查用户是否有权限访问指定的路径
 * @param path 要检查的路径
 * @param userRole 用户角色
 */
export const hasPathPermission = (path: string, userRole?: string): boolean => {
  if (!userRole) return false;
  
  // 定义路径权限映射
  const pathPermissions: Record<string, string[]> = {
    // 管理员可以访问所有路径
    '/admin': ['admin'],
    '/admin/students': ['admin'],
    '/admin/teachers': ['admin'],
    '/system-settings': ['admin'],
    
    // 教师路径
    '/teacher': ['admin', 'teacher'],
    '/teacher/dashboard': ['admin', 'teacher'],
    '/teacher/courses': ['admin', 'teacher'],
    '/teacher/research-group': ['admin', 'teacher'],
    '/teacher/assignments': ['admin', 'teacher'],
    
    // 学生路径
    '/student': ['admin', 'student'],
    '/student/dashboard': ['admin', 'student'],
    '/student/courses': ['admin', 'student'],
    '/student/learning-center': ['admin', 'student'],
    '/student/progress': ['admin', 'student'],
    '/student/evaluation': ['admin', 'student']
  };
  
  // 检查是否有特定权限配置
  for (const [routePath, allowedRoles] of Object.entries(pathPermissions)) {
    if (path.startsWith(routePath) && !allowedRoles.includes(userRole)) {
      return false;
    }
  }
  
  // 默认情况下，如果没有特定配置，则允许访问
  return true;
};

/**
 * 初始化路由历史记录
 */
export const initRouteHistory = (): void => {
  try {
    const savedHistory = localStorage.getItem('route_history');
    if (savedHistory) {
      const parsedHistory = JSON.parse(savedHistory);
      if (Array.isArray(parsedHistory)) {
        // 只保留有效的字符串路径
        const validPaths = parsedHistory.filter(path => typeof path === 'string');
        routeHistory.push(...validPaths);
      }
    }
  } catch (error) {
    console.error('初始化路由历史记录失败:', error);
  }
};

// 初始化
if (typeof window !== 'undefined') {
  initRouteHistory();
} 