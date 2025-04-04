/**
 * 从URL提取资源类型
 * 解析API路径，获取资源类型名称
 * @param url API请求URL
 * @returns 资源类型
 */
public static getResourceTypeFromUrl(url: string): string | null {
  if (!url) return null;
  
  try {
    // 清理URL参数
    const cleanUrl = url.split('?')[0];
    
    // 尝试匹配API格式：/api/resource
    const apiPathRegex = /\/api\/([a-zA-Z0-9-_]+)(?:\/|$)/;
    const match = cleanUrl.match(apiPathRegex);
    
    if (match && match[1]) {
      return match[1].toLowerCase();
    }
    
    // 尝试匹配直接路径格式：/resource
    const directPathRegex = /\/([a-zA-Z0-9-_]+)(?:\/|$)/;
    const directMatch = cleanUrl.match(directPathRegex);
    
    if (directMatch && directMatch[1]) {
      const possibleType = directMatch[1].toLowerCase();
      
      // 排除通用路径标识符
      if (!['api', 'auth', 'login', 'health', 'public'].includes(possibleType)) {
        return possibleType;
      }
    }
    
    // 使用URL最后一部分
    const parts = cleanUrl.split('/').filter(Boolean);
    if (parts.length > 0) {
      return parts[parts.length - 1].toLowerCase();
    }
  } catch (error) {
    console.error('从URL中提取资源类型出错:', error);
  }
  
  return null;
} 