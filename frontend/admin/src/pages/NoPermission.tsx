import React from 'react';
import { Result, Button, Space, Typography } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';

const { Text } = Typography;

const NoPermission: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAppContext();
  const requiredRoles = location.state?.requiredRoles || [];

  // 根据用户角色确定首页路径
  const getHomePath = (role?: string) => {
    switch (role) {
      case 'admin':
        return '/dashboard';
      case 'teacher':
        return '/teacher/dashboard';
      case 'student':
        return '/student/dashboard';
      default:
        return '/';
    }
  };

  return (
    <Result
      status="403"
      title="无权访问"
      subTitle={
        <Space direction="vertical">
          <Text>您当前的角色（{user?.role || '未知'}）无权访问此页面</Text>
          {requiredRoles.length > 0 && (
            <Text type="secondary">需要 {requiredRoles.join(' 或 ')} 角色权限</Text>
          )}
        </Space>
      }
      extra={[
        <Button 
          type="primary" 
          key="home" 
          onClick={() => navigate(getHomePath(user?.role))}>
          返回我的首页
        </Button>,
        <Button 
          key="login" 
          onClick={() => {
            logout();
            navigate('/login');
          }}>
          切换账号
        </Button>
      ]}
    />
  );
};

export default NoPermission; 