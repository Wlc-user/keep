import React, { useEffect } from 'react';
import config from '../config/env';

/**
 * MockDataHandler组件
 * 简化版本，仅提供模拟数据环境的状态日志
 */
const MockDataHandler: React.FC = () => {
  useEffect(() => {
    // 输出当前模拟数据状态
    if (config.USE_MOCK_DATA) {
      console.log('模拟数据模式已启用，系统将使用模拟数据响应API请求');
    } else {
      console.log('模拟数据模式已禁用，系统将直接使用后端API');
    }
    
    return () => {
      console.log('MockDataHandler组件已卸载');
    };
  }, []);

  // 组件不渲染任何内容
  return null;
};

export default MockDataHandler; 