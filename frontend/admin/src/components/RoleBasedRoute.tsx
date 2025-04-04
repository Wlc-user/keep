import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin, message } from 'antd';
import authService from '../services/authService';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ children, allowedRoles }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      
      try {
        // 检查用户是否已登录
        const user = authService.getCurrentUser();
        if (!user) {
          message.error('请先登录');
          setAuthorized(false);
          setLoading(false);
          return;
        }

        // 验证token有效性
        const isValid = authService.isTokenValid();
        if (!isValid) {
          try {
            // 尝试刷新token
            const refreshed = await authService.refreshToken();
            if (!refreshed) {
              message.error('登录已过期，请重新登录');
              authService.logout();
              setAuthorized(false);
              setLoading(false);
              return;
            }
          } catch (error) {
            console.error('刷新token失败', error);
            message.error('登录已过期，请重新登录');
            authService.logout();
            setAuthorized(false);
            setLoading(false);
            return;
          }
        }

        // 检查用户角色是否在允许的角色列表中
        if (user.role && allowedRoles.includes(user.role)) {
          setAuthorized(true);
        } else {
          message.error('您没有权限访问此页面');
          setAuthorized(false);
        }
      } catch (error) {
        console.error('授权检查失败', error);
        message.error('授权验证失败');
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [allowedRoles, location.pathname]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="验证权限中..." />
      </div>
    );
  }

  if (!authorized) {
    // 获取当前用户角色，根据角色重定向到不同的登录页面
    const role = authService.getCurrentUser()?.role || 'student';
    
    if (role === 'admin') {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    } else if (role === 'teacher') {
      return <Navigate to="/teacher/login" state={{ from: location }} replace />;
    } else {
      return <Navigate to="/student/login" state={{ from: location }} replace />;
    }
  }

  return <>{children}</>;
};

export default RoleBasedRoute; 