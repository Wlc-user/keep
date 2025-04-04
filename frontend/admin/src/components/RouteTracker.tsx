import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { addRouteHistory } from '../utils/routeUtils';

/**
 * 路由跟踪器组件
 * 用于监听路由变化并记录历史
 */
const RouteTracker: React.FC = () => {
  const location = useLocation();
  
  // 监听路由变化，记录路由历史
  useEffect(() => {
    addRouteHistory(location.pathname);
    
    // 记录到控制台（开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.log('路由变化:', location.pathname, location.state);
    }
  }, [location.pathname, location.state]);
  
  // 不渲染任何内容，纯逻辑组件
  return null;
};

export default RouteTracker; 