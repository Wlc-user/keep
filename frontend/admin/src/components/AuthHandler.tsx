import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { message } from 'antd';
import errorHandler from '../utils/errorHandler';

/**
 * 认证处理组件
 * 负责处理全局认证状态和登录跳转
 */
const AuthHandler: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [authErrorCount, setAuthErrorCount] = useState(0);
  
  // 监听认证错误，处理登录跳转
  useEffect(() => {
    // 订阅自定义认证错误事件
    const handleAuthError = (event: CustomEvent) => {
      // 避免在登录页面重复处理
      if (location.pathname === '/login') {
        return;
      }
      
      // 增加错误计数
      setAuthErrorCount(prev => prev + 1);
      
      // 如果是第一次错误，执行跳转
      if (authErrorCount === 0) {
        // 保存当前路径用于登录后重定向
        const currentPath = location.pathname + location.search;
        if (currentPath !== '/login') {
          localStorage.setItem('redirectPath', currentPath);
          
          // 延迟跳转，给用户时间看到消息
          setTimeout(() => {
            navigate('/login');
          }, 1500);
        }
      }
    };
    
    // 创建自定义事件监听器
    window.addEventListener('auth:error' as any, handleAuthError);
    
    return () => {
      window.removeEventListener('auth:error' as any, handleAuthError);
    };
  }, [navigate, location, authErrorCount]);
  
  // 监听登录成功，重置认证错误状态
  useEffect(() => {
    const handleLoginSuccess = () => {
      // 重置错误计数
      setAuthErrorCount(0);
      // 重置错误处理器的认证状态
      errorHandler.resetAuthErrorState();
      
      // 检查是否有保存的重定向路径
      const redirectPath = localStorage.getItem('redirectPath');
      if (redirectPath && redirectPath !== '/login') {
        localStorage.removeItem('redirectPath');
        // 跳转到原来的页面
        navigate(redirectPath);
      }
    };
    
    // 创建登录成功事件监听器
    window.addEventListener('auth:login-success' as any, handleLoginSuccess);
    
    return () => {
      window.removeEventListener('auth:login-success' as any, handleLoginSuccess);
    };
  }, [navigate]);
  
  // 登录页面时，检查是否已登录
  useEffect(() => {
    if (location.pathname === '/login') {
      const token = localStorage.getItem('token');
      if (token) {
        // 已登录用户访问登录页，引导回首页
        message.info('您已登录，正在跳转到首页');
        navigate('/');
      }
    }
  }, [location.pathname, navigate]);
  
  // 当用户处于登录页面时，重置认证错误状态
  useEffect(() => {
    if (location.pathname === '/login') {
      setAuthErrorCount(0);
    }
  }, [location.pathname]);
  
  // 这是一个无UI组件，仅处理逻辑
  return null;
};

export default AuthHandler; 