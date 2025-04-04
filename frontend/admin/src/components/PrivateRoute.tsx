import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  roles?: string[]; // 允许访问的角色列表
}

/**
 * 私有路由组件
 * 用于根据用户角色和认证状态控制路由访问
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, roles = [] }) => {
  const { isAuthenticated, user } = useAppContext();
  const location = useLocation();

  // 如果用户未登录，重定向到登录页面
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 如果指定了角色限制，但用户没有所需角色，重定向到无权限页面
  if (roles.length > 0 && (!user?.role || !roles.includes(user.role))) {
    return <Navigate to="/no-permission" state={{ requiredRoles: roles }} replace />;
  }

  // 用户已登录且有权限，渲染子组件
  return <>{children}</>;
};

export default PrivateRoute; 