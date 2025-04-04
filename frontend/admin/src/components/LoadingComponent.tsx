import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface LoadingComponentProps {
  tip?: string;
  size?: 'small' | 'default' | 'large';
  fullScreen?: boolean;
  delay?: number;
}

/**
 * 通用加载组件
 * 可以设置为全屏或者内联
 */
const LoadingComponent: React.FC<LoadingComponentProps> = ({
  tip = '加载中...',
  size = 'large',
  fullScreen = false,
  delay = 0
}) => {
  const spinIcon = <LoadingOutlined style={{ fontSize: size === 'large' ? 40 : size === 'small' ? 16 : 24 }} spin />;
  
  // 内联样式
  if (!fullScreen) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '20px',
        width: '100%'
      }}>
        <Spin indicator={spinIcon} tip={tip} size={size} delay={delay} />
      </div>
    );
  }
  
  // 全屏样式
  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      background: 'rgba(255, 255, 255, 0.65)',
      zIndex: 9999
    }}>
      <Spin indicator={spinIcon} tip={tip} size={size} delay={delay} />
    </div>
  );
};

export default LoadingComponent; 