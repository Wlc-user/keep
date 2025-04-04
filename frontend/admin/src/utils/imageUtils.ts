/**
 * 图片工具函数
 * 包含处理图片的各种实用工具函数
 */

/**
 * 生成在线占位图URL
 * @param width 图片宽度
 * @param height 图片高度
 * @param text 图片上显示的文本
 * @param backgroundColor 背景颜色
 * @param textColor 文本颜色
 * @returns 占位图URL
 */
export const getPlaceholderImage = (
  width: number = 300, 
  height: number = 200, 
  text: string = 'Image', 
  backgroundColor: string = '0D6EFD', 
  textColor: string = 'FFFFFF'
): string => {
  // 使用 via.placeholder.com 服务生成占位图
  return `https://via.placeholder.com/${width}x${height}/${backgroundColor}/${textColor}?text=${encodeURIComponent(text)}`;
};

/**
 * 生成课程占位图URL
 * @param courseId 课程ID
 * @param courseName 课程名称
 * @returns 课程占位图URL
 */
export const getCoursePlaceholderImage = (courseId: string, courseName: string): string => {
  // 根据课程ID生成唯一颜色
  const colorNum = parseInt(courseId.replace(/\D/g, '').substring(0, 6) || '0', 10) % 16777215;
  const backgroundColor = colorNum.toString(16).padStart(6, '0');
  
  return getPlaceholderImage(800, 400, courseName, backgroundColor);
};

/**
 * 生成用户头像占位图URL
 * @param userId 用户ID
 * @param userName 用户名称
 * @returns 用户头像占位图URL
 */
export const getUserAvatarPlaceholderImage = (userId: string, userName: string): string => {
  // 根据用户ID生成唯一颜色
  const colorNum = parseInt(userId.replace(/\D/g, '').substring(0, 6) || '0', 10) % 16777215;
  const backgroundColor = colorNum.toString(16).padStart(6, '0');
  
  // 取用户名首字母或首字
  const initial = userName.charAt(0).toUpperCase();
  
  return getPlaceholderImage(100, 100, initial, backgroundColor);
};

/**
 * 生成回退图片URL
 * 如果原始图片URL无效，提供一个回退图片
 * @param originalUrl 原始图片URL
 * @param placeholderText 占位图上的文本
 * @param width 占位图宽度
 * @param height 占位图高度
 * @returns 图片URL或回退URL
 */
export const getImageWithFallback = (
  originalUrl: string | undefined, 
  placeholderText: string = 'Image', 
  width: number = 300,
  height: number = 200
): string => {
  if (!originalUrl) {
    return getPlaceholderImage(width, height, placeholderText);
  }
  
  // 如果是本地路径但不是以/开头，添加/
  if (!originalUrl.startsWith('http') && !originalUrl.startsWith('/')) {
    return `/${originalUrl}`;
  }
  
  return originalUrl;
};

/**
 * 根据在线状态检查图片是否可以访问
 * @param url 图片URL
 * @returns Promise<boolean> 图片是否可访问
 */
export const checkImageExists = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.warn(`图片访问失败: ${url}`, error);
    return false;
  }
};

/**
 * 图片加载错误处理器
 * @param event 错误事件
 * @param fallbackUrl 可选的回退URL
 */
export const handleImageError = (
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackUrl?: string
): void => {
  const target = event.target as HTMLImageElement;
  const alt = target.alt || 'Image';
  
  // 设置fallback图片
  if (fallbackUrl) {
    target.src = fallbackUrl;
  } else {
    // 生成带文本的占位图
    const width = target.width || 300;
    const height = target.height || 200;
    target.src = getPlaceholderImage(width, height, alt);
  }
  
  // 避免重复触发错误
  target.onerror = null;
}; 