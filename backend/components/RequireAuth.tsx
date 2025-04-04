import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin, message } from 'antd';
import authService from '../services/authService';

interface RequireAuthProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        // 验证用户是否已登录
        const user = authService.getCurrentUser();
        
        if (!user) {
          setAuthorized(false);
          return;
        }
        
        // 验证token有效性
        const isValid = await authService.verifyToken();
        
        if (!isValid) {
          authService.logout();
          message.error('您的登录已过期，请重新登录');
          setAuthorized(false);
          return;
        }
        
        // 验证用户角色权限
        if (allowedRoles.length > 0) {
          const userRole = user.role || '';
          if (!allowedRoles.includes(userRole)) {
            message.error('您没有访问此页面的权限');
            setAuthorized(false);
            return;
          }
        }
        
        // 通过所有验证
        setAuthorized(true);
      } catch (error) {
        console.error('Auth verification error:', error);
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [location.pathname, allowedRoles]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="验证身份中..." />
      </div>
    );
  }

  if (!authorized) {
    // 根据当前路径确定重定向路径
    let redirectPath = '/';
    
    // 如果路径包含特定角色，则重定向到相应的登录页
    if (location.pathname.startsWith('/admin')) {
      redirectPath = '/admin/login';
    } else if (location.pathname.startsWith('/teacher')) {
      redirectPath = '/teacher/login';
    } else if (location.pathname.startsWith('/student')) {
      redirectPath = '/student/login';
    }
    
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default RequireAuth; 