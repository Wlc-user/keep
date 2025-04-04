/**
 * 外部资源加载工具
 * 用于在应用启动时加载外部样式和脚本
 */
import ResourceController from '../utils/ResourceController';
import InitializationGuard from '../utils/InitializationGuard';

// 获取应用的基础URL，在不同环境下可能会不同
const BASE_URL = import.meta.env.BASE_URL || '/';
console.log('资源加载基础路径:', BASE_URL);

// 获取完整的资源路径
const getFullPath = (path: string): string => {
  // 如果路径已经是绝对路径，直接返回
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) {
    return path;
  }
  
  // 确保路径以/开头
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // 基础路径结尾有/时，需要避免重复
  if (BASE_URL.endsWith('/')) {
    return `${BASE_URL.slice(0, -1)}${normalizedPath}`;
  }
  
  return `${BASE_URL}${normalizedPath}`;
};

// 检查资源是否存在
const checkResourceExists = async (url: string): Promise<boolean> => {
  // 如果资源已加载，直接返回true
  if (ResourceController.isResourceLoaded(url)) {
    return true;
  }
  
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error(`检查资源失败: ${url}`, error);
    return false;
  }
};

// 加载本地字体
export const loadLocalFonts = async (): Promise<boolean> => {
  try {
    console.log('正在加载本地字体...');
    
    // 加载本地字体CSS
    const fontCssPath = getFullPath('/assets/fonts/roboto.css');
    const cssLoaded = await ResourceController.loadCSS(fontCssPath);
    
    if (!cssLoaded) {
      console.warn('本地字体CSS加载失败，使用系统字体回退');
      
      // 添加内联字体样式，避免外部请求
      const style = document.createElement('style');
      style.textContent = `
        /* 系统字体回退 */
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        }
      `;
      document.head.appendChild(style);
      ResourceController.markResourceLoaded('system-fonts-fallback');
    }
    
    console.log('字体设置成功');
    return true;
  } catch (error) {
    console.error('字体设置失败:', error);
    return false;
  }
};

// 加载CSS文件
export const loadCSS = async (href: string): Promise<boolean> => {
  try {
    // 确保使用正确的路径
    const fullPath = getFullPath(href);
    console.log(`尝试加载CSS: ${fullPath} (原路径: ${href})`);
    
    // 使用ResourceController加载CSS
    const result = await ResourceController.loadCSS(fullPath);
    
    // 如果加载失败，尝试备用路径
    if (!result && href.startsWith('/')) {
      const backupPath = href.substring(1);
      console.log(`尝试备用CSS路径: ${backupPath}`);
      return await ResourceController.loadCSS(backupPath);
    }
    
    return result;
  } catch (error) {
    console.error(`CSS加载出错: ${href}`, error);
    return false;
  }
};

// 加载JS文件
export const loadScript = async (src: string, async = true, defer = false): Promise<boolean> => {
  try {
    // 确保使用正确的路径
    const fullPath = getFullPath(src);
    console.log(`尝试加载JS: ${fullPath} (原路径: ${src})`);
    
    // 使用ResourceController加载脚本
    const result = await ResourceController.loadScript(fullPath, async, defer);
    
    // 如果加载失败，尝试备用路径
    if (!result && src.startsWith('/')) {
      const backupPath = src.substring(1);
      console.log(`尝试备用JS路径: ${backupPath}`);
      return await ResourceController.loadScript(backupPath, async, defer);
    }
    
    return result;
  } catch (error) {
    console.error(`JS加载出错: ${src}`, error);
    return false;
  }
};

// 批量加载CSS文件
export const loadAllCSS = async (): Promise<boolean> => {
  // 使用初始化守卫确保只执行一次
  return InitializationGuard.ensureInitialized('load-all-css', async () => {
    // 使用绝对路径，确保正确加载
    const cssList = [
      '/css/critical.css',
      '/css/animations.css',
      '/css/print.css'
    ];
    
    console.log('准备加载CSS文件:', cssList);
    
    try {
      const results = await Promise.all(cssList.map(href => loadCSS(href)));
      const successCount = results.filter(Boolean).length;
      
      console.log(`CSS文件加载完成: ${successCount}/${cssList.length} 成功`);
      return successCount > 0; // 只要有一个成功就算成功
    } catch (error) {
      console.error('CSS批量加载失败:', error);
      return false;
    }
  });
};

// 批量加载JS文件
export const loadAllScripts = async (): Promise<boolean> => {
  // 使用初始化守卫确保只执行一次
  return InitializationGuard.ensureInitialized('load-all-scripts', async () => {
    // 使用绝对路径，确保正确加载
    const scriptList = [
      '/scripts/analytics.js',
      '/scripts/feedback.js'
    ];
    
    console.log('准备加载JS文件:', scriptList);
    
    // 延迟加载非关键脚本
    return new Promise(resolve => {
      // 页面加载完成后再加载脚本
      if (document.readyState === 'complete') {
        loadScripts();
      } else {
        window.addEventListener('load', () => {
          setTimeout(() => loadScripts(), 2000);
        });
      }
      
      // 加载所有脚本的函数
      async function loadScripts() {
        try {
          const results = await Promise.all(scriptList.map(src => loadScript(src)));
          const successCount = results.filter(Boolean).length;
          
          console.log(`JS文件加载完成: ${successCount}/${scriptList.length} 成功`);
          resolve(successCount > 0); // 只要有一个成功就算成功
        } catch (error) {
          console.error('JS批量加载失败:', error);
          resolve(false);
        }
      }
    });
  });
};

// 检查关键资源是否存在
export const checkResources = async (): Promise<boolean> => {
  // 使用初始化守卫确保只执行一次
  return InitializationGuard.ensureInitialized('check-resources', async () => {
    try {
      const criticalResources = [
        '/css/critical.css',
        '/logo.svg',
        '/favicon.svg'
      ];
      
      console.log('检查关键资源:', criticalResources);
      
      const results = await Promise.all(criticalResources.map(async resource => {
        const fullPath = getFullPath(resource);
        console.log(`检查资源: ${fullPath} (原路径: ${resource})`);
        
        try {
          const exists = await checkResourceExists(fullPath);
          
          if (!exists && resource.startsWith('/')) {
            // 尝试备用路径
            const backupPath = resource.substring(1);
            console.log(`尝试备用资源路径: ${backupPath}`);
            return await checkResourceExists(backupPath);
          }
          
          return exists;
        } catch (error) {
          console.error(`资源检查失败: ${fullPath}`, error);
          return false;
        }
      }));
      
      const successCount = results.filter(Boolean).length;
      console.log(`资源检查完成: ${successCount}/${criticalResources.length} 可用`);
      
      return successCount > 0; // 只要有一个成功就算成功
    } catch (error) {
      console.error('资源检查过程出错:', error);
      return false;
    }
  });
};

// 初始化所有资源
export const initializeResources = async (): Promise<boolean> => {
  // 使用初始化守卫确保只执行一次
  return InitializationGuard.ensureInitialized('initialize-resources', async () => {
    console.log('开始初始化外部资源...');
    
    try {
      // 设置主题
      const theme = localStorage.getItem('theme') || 'light';
      document.documentElement.setAttribute('data-theme', theme);
      console.log(`主题设置为: ${theme}`);
      
      // 并行执行各项初始化任务
      const results = await Promise.all([
        loadLocalFonts(),
        checkResources(),
        loadAllCSS(),
        loadAllScripts()
      ]);
      
      const success = results.some(Boolean); // 只要有一项成功就算初始化成功
      
      console.log(`外部资源初始化${success ? '成功' : '失败'}`);
      return success;
    } catch (error) {
      console.error('资源初始化失败:', error);
      return false;
    }
  });
};

export default {
  loadLocalFonts,
  loadCSS,
  loadScript,
  loadAllCSS,
  loadAllScripts,
  checkResources,
  initializeResources
}; 