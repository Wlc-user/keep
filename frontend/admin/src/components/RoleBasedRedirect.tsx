import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';

/**
 * 基于角色的重定向组件
 * 根据用户角色重定向到对应的仪表盘页面
 */
const RoleBasedRedirect: React.FC = () => {
  const { user } = useAppContext();
  
  // 根据用户角色重定向到相应的仪表盘
  if (user?.role === 'admin') {
    return <Navigate to="/dashboard" replace />;
  } else if (user?.role === 'teacher') {
    return <Navigate to="/teacher/dashboard" replace />;
  } else if (user?.role === 'student') {
    return <Navigate to="/student/dashboard" replace />;
  }
  
  // 如果没有角色或登录信息，重定向到登录页面
  return <Navigate to="/login" replace />;
};

export default RoleBasedRedirect; 