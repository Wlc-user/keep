import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';
import './styles/base.css';  // 导入基础样式
import './styles/theme.css';  // 添加主题样式
import 'antd/dist/reset.css'; // 添加Ant Design样式
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { initializeResources } from './styles/loadExternalResources';
import { setupGlobalErrorHandling } from './utils/errorHandler';

// 设置React Router未来标志
window.__reactRouterFutureFlags = {
  v7_startTransition: true,
  v7_relativeSplatPath: true
};

// 显示初始加载状态
const showInitialLoadingState = () => {
  // 如果已经存在loading元素，则不再创建
  if (document.getElementById('initial-loading')) return;
  
  console.log('显示初始加载状态');
  
  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'initial-loading';
  loadingDiv.style.position = 'fixed';
  loadingDiv.style.top = '0';
  loadingDiv.style.left = '0';
  loadingDiv.style.width = '100%';
  loadingDiv.style.height = '100%';
  loadingDiv.style.backgroundColor = '#f0f2f5';
  loadingDiv.style.display = 'flex';
  loadingDiv.style.justifyContent = 'center';
  loadingDiv.style.alignItems = 'center';
  loadingDiv.style.flexDirection = 'column';
  loadingDiv.style.zIndex = '9999';
  
  const spinner = document.createElement('div');
  spinner.style.border = '4px solid rgba(0, 0, 0, 0.1)';
  spinner.style.borderLeft = '4px solid #1890ff';
  spinner.style.borderRadius = '50%';
  spinner.style.width = '40px';
  spinner.style.height = '40px';
  spinner.style.animation = 'spin 1s linear infinite';
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  
  const loadingText = document.createElement('div');
  loadingText.textContent = '应用加载中...';
  loadingText.style.marginTop = '16px';
  loadingText.style.color = '#1890ff';
  loadingText.style.fontSize = '16px';
  
  // 添加资源加载状态信息
  const loadingInfo = document.createElement('div');
  loadingInfo.id = 'loading-info';
  loadingInfo.style.marginTop = '8px';
  loadingInfo.style.color = '#888';
  loadingInfo.style.fontSize = '12px';
  loadingInfo.textContent = '准备资源中...';
  
  document.head.appendChild(style);
  loadingDiv.appendChild(spinner);
  loadingDiv.appendChild(loadingText);
  loadingDiv.appendChild(loadingInfo);
  document.body.appendChild(loadingDiv);
};

// 更新加载状态信息
export const updateLoadingInfo = (message: string) => {
  const loadingInfo = document.getElementById('loading-info');
  if (loadingInfo) {
    loadingInfo.textContent = message;
  }
};

// 移除初始加载状态
const removeInitialLoadingState = () => {
  const loadingDiv = document.getElementById('initial-loading');
  if (loadingDiv) {
    loadingDiv.style.opacity = '0';
    loadingDiv.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
      loadingDiv.remove();
    }, 500);
  }
};

// 显示初始加载状态
showInitialLoadingState();

// 要预加载的重要资源
const resourcesToPreload = [
  'favicon.svg',
  'logo.svg',
  'css/critical.css',
  'scripts/analytics.js',
  'scripts/feedback.js'
];

// 预加载关键资源
const preloadResources = async () => {
  try {
    updateLoadingInfo('正在预加载资源...');
    for (const resource of resourcesToPreload) {
      try {
        const response = await fetch(resource);
        if (!response.ok) {
          console.warn(`资源预加载失败: ${resource}`);
          updateLoadingInfo(`无法加载资源: ${resource}`);
        } else {
          console.log(`资源预加载成功: ${resource}`);
        }
      } catch (error) {
        console.error(`资源预加载错误: ${resource}`, error);
      }
    }
    updateLoadingInfo('资源预加载完成');
  } catch (error) {
    console.error('资源预加载过程出错:', error);
    updateLoadingInfo('资源预加载失败，将尝试正常加载');
  }
};

// 初始化外部资源
const initializeApp = async () => {
  try {
    // 预加载资源
    await preloadResources();
    
    // 初始化外部资源
    updateLoadingInfo('正在初始化应用资源...');
    initializeResources();
    
    // 初始化全局错误处理
    setupGlobalErrorHandling();
    
    // 创建根元素
    const root = ReactDOM.createRoot(
      document.getElementById('root') as HTMLElement
    );
    
    // 渲染应用
    updateLoadingInfo('正在渲染应用...');
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <AppProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </AppProvider>
        </ErrorBoundary>
      </React.StrictMode>
    );
    
    // 显示"应用已加载"信息，然后淡出
    updateLoadingInfo('应用加载完成');
    
    // 应用渲染完成后延迟移除加载状态
    setTimeout(removeInitialLoadingState, 1000);
  } catch (error) {
    console.error('应用初始化失败:', error);
    updateLoadingInfo('应用初始化失败，请刷新页面重试');
  }
};

// 启动应用
initializeApp(); 