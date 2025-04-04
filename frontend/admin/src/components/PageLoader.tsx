import React, { Suspense } from 'react';
import { Spin } from 'antd';
import ErrorBoundary from './ErrorBoundary';

interface PageLoaderProps {
  children: React.ReactNode;
  loadingText?: string;
  fallback?: React.ReactNode;
}

/**
 * 页面加载组件
 * 提供错误边界和加载状态
 */
const PageLoader: React.FC<PageLoaderProps> = ({ 
  children, 
  loadingText = '加载中...',
  fallback
}) => {
  // 默认的加载组件
  const defaultFallback = (
    <div className="page-loading-container" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      width: '100%',
      padding: '20px 0'
    }}>
      <Spin tip={loadingText} size="large" />
    </div>
  );

  return (
    <ErrorBoundary>
      <Suspense fallback={fallback || defaultFallback}>
        <div className="page-content">
          {children}
        </div>
      </Suspense>
    </ErrorBoundary>
  );
};

export default PageLoader; 