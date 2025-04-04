/**
 * 图片优化工具类
 * 提供图片加载、压缩和转换等功能
 */

/**
 * 图片加载选项
 */
export interface ImageLoadOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  placeholder?: string;
  crossOrigin?: boolean;
  cacheKey?: string;
}

/**
 * 默认图片加载选项
 */
const defaultOptions: ImageLoadOptions = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.8,
  format: 'webp',
  placeholder: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"%3E%3Crect width="300" height="200" fill="%23cccccc"%3E%3C/rect%3E%3C/svg%3E',
  crossOrigin: true,
  cacheKey: 'img_cache'
};

/**
 * 图片缓存对象
 */
const imageCache: Record<string, string> = {};

/**
 * 预加载图片
 * @param urls 图片URL数组
 * @param options 加载选项
 * @returns Promise，解析为加载成功的图片URL数组
 */
export const preloadImages = async (
  urls: string[],
  options: Partial<ImageLoadOptions> = {}
): Promise<string[]> => {
  const opts = { ...defaultOptions, ...options };
  const loadPromises = urls.map(url => loadImage(url, opts));
  
  try {
    return await Promise.all(loadPromises);
  } catch (error) {
    console.error('预加载图片失败:', error);
    return [];
  }
};

/**
 * 加载单张图片
 * @param url 图片URL
 * @param options 加载选项
 * @returns Promise，解析为加载成功的图片URL或数据URL
 */
export const loadImage = (
  url: string,
  options: Partial<ImageLoadOptions> = {}
): Promise<string> => {
  const opts = { ...defaultOptions, ...options };
  
  // 检查缓存
  const cacheKey = `${opts.cacheKey}:${url}`;
  if (imageCache[cacheKey]) {
    return Promise.resolve(imageCache[cacheKey]);
  }
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    if (opts.crossOrigin) {
      img.crossOrigin = 'anonymous';
    }
    
    img.onload = () => {
      try {
        // 如果需要调整大小或转换格式
        if (opts.maxWidth || opts.maxHeight || opts.format !== 'png') {
          const resizedUrl = resizeImage(img, opts);
          imageCache[cacheKey] = resizedUrl;
          resolve(resizedUrl);
        } else {
          imageCache[cacheKey] = url;
          resolve(url);
        }
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error(`图片加载失败: ${url}`));
    };
    
    img.src = url;
  });
};

/**
 * 调整图片大小
 * @param img 图片元素
 * @param options 调整选项
 * @returns 调整后的图片数据URL
 */
export const resizeImage = (
  img: HTMLImageElement,
  options: Partial<ImageLoadOptions> = {}
): string => {
  const opts = { ...defaultOptions, ...options };
  
  // 计算新尺寸
  let { width, height } = img;
  const aspectRatio = width / height;
  
  if (opts.maxWidth && width > opts.maxWidth) {
    width = opts.maxWidth;
    height = width / aspectRatio;
  }
  
  if (opts.maxHeight && height > opts.maxHeight) {
    height = opts.maxHeight;
    width = height * aspectRatio;
  }
  
  // 创建canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  // 绘制图片
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('无法创建canvas上下文');
  }
  
  ctx.drawImage(img, 0, 0, width, height);
  
  // 转换为数据URL
  const mimeType = opts.format === 'webp' 
    ? 'image/webp' 
    : opts.format === 'jpeg' 
      ? 'image/jpeg' 
      : 'image/png';
  
  return canvas.toDataURL(mimeType, opts.quality);
};

/**
 * 将图片转换为Base64
 * @param url 图片URL
 * @param options 转换选项
 * @returns Promise，解析为Base64字符串
 */
export const imageToBase64 = async (
  url: string,
  options: Partial<ImageLoadOptions> = {}
): Promise<string> => {
  try {
    const dataUrl = await loadImage(url, options);
    return dataUrl.split(',')[1];
  } catch (error) {
    console.error('图片转Base64失败:', error);
    return '';
  }
};

/**
 * 创建图片占位符
 * @param width 宽度
 * @param height 高度
 * @param color 颜色
 * @returns SVG数据URL
 */
export const createPlaceholder = (
  width: number = 300,
  height: number = 200,
  color: string = '#cccccc'
): string => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
      <rect width="${width}" height="${height}" fill="${color}"></rect>
    </svg>
  `;
  
  return `data:image/svg+xml,${encodeURIComponent(svg.trim())}`;
};

/**
 * 图片懒加载
 * @param selector 图片选择器
 * @param options 加载选项
 */
export const lazyLoadImages = (
  selector: string = 'img[data-src]',
  options: Partial<ImageLoadOptions> = {}
): void => {
  const opts = { ...defaultOptions, ...options };
  
  // 创建交叉观察器
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.getAttribute('data-src');
          
          if (src) {
            loadImage(src, opts)
              .then(url => {
                img.src = url;
                img.removeAttribute('data-src');
              })
              .catch(error => {
                console.error('懒加载图片失败:', error);
                img.src = opts.placeholder || '';
              });
          }
          
          observer.unobserve(img);
        }
      });
    });
    
    // 观察所有匹配的图片
    document.querySelectorAll(selector).forEach(img => {
      observer.observe(img);
    });
  } else {
    // 回退方案：立即加载所有图片
    document.querySelectorAll(selector).forEach(img => {
      const imgElement = img as HTMLImageElement;
      const src = imgElement.getAttribute('data-src');
      
      if (src) {
        imgElement.src = src;
        imgElement.removeAttribute('data-src');
      }
    });
  }
};

/**
 * 清除图片缓存
 * @param prefix 缓存键前缀
 */
export const clearImageCache = (prefix?: string): void => {
  if (prefix) {
    Object.keys(imageCache).forEach(key => {
      if (key.startsWith(prefix)) {
        delete imageCache[key];
      }
    });
  } else {
    Object.keys(imageCache).forEach(key => {
      delete imageCache[key];
    });
  }
}; 