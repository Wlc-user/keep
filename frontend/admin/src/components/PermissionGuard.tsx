import React, { useEffect } from 'react';
import { Result, Button, Empty, Space, Tooltip, Typography } from 'antd';
import usePermission from '../hooks/usePermission';
import { UserRole } from '../contexts/AppContext';
import { hasPermission, hasPermissionByType } from '../utils/permissionUtils';
import { InfoCircleOutlined, LockOutlined } from '@ant-design/icons';
import { ModulePermissions } from '../utils/permissionUtils';
import { useAppContext } from '../contexts/AppContext';

interface PermissionGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredPermission?: string[]; // 例如: ['courses.view', 'courses.manage']
  requiredModule?: keyof typeof ModulePermissions; // 使用模块权限配置
  fallback?: React.ReactNode; // 可选的备用显示内容
  noDeniedFeedback?: boolean; // 是否不显示权限不足的提示
  showEmptyPlaceholder?: boolean; // 是否显示空占位符
  componentName?: string; // 组件名称，用于日志
  redirectTo?: string; // 重定向到指定页面
  showGuide?: boolean; // 是否显示访问指南
  showErrorPage?: boolean; // 是否显示错误页面
  backButton?: boolean; // 是否显示返回上一页按钮
  homeButton?: boolean; // 是否显示返回首页按钮
}

/**
 * 权限控制组件 - 用于控制页面内的组件是否显示
 * 
 * 可以基于角色或基于权限点或基于模块控制
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  children, 
  allowedRoles, 
  requiredPermission,
  requiredModule,
  fallback,
  noDeniedFeedback = false,
  showEmptyPlaceholder = false,
  componentName = '组件',
  redirectTo,
  showGuide = false,
  showErrorPage = false,
  backButton = false,
  homeButton = false
}) => {
  const { userRole, permissions, checkModulePermission } = usePermission();
  const { user } = useAppContext();
  
  // 检查是否基于角色有权限
  const hasRolePermission = () => {
    if (!allowedRoles || allowedRoles.length === 0) {
      return true;
    }
    
    if (!userRole) {
      return false;
    }
    
    return allowedRoles.includes(userRole);
  };

  // 检查是否有模块权限
  const hasModulePermission = () => {
    if (!requiredModule) {
      return true;
    }
    
    return checkModulePermission(requiredModule);
  };

  // 检查是否有特定的功能权限
  const hasFeaturePermission = () => {
    if (!requiredPermission || requiredPermission.length === 0) {
      return true;
    }
    
    if (!permissions) {
      return false;
    }
    
    // 对于学生特定功能的特殊处理
    if (userRole === 'student' && requiredPermission.some(p => p.startsWith('student_'))) {
      // 学生功能权限列表
      const studentFeatures = [
        'student_dashboard',
        'student_courses',
        'student_assignments',
        'student_materials',
        'student_progress',
        'student_achievements',
        'student_notifications',
        'student_profile',
        'student_points_system',
        'student_competitions',
        'student_study_partners',
        'student_questions',
        'student_knowledge_graph',
        'student_learning_history'
      ];
      
      // 检查是否为学生可用功能
      const isStudentFeature = requiredPermission.every(p => 
        studentFeatures.includes(p) || p.startsWith('student_')
      );
      
      return isStudentFeature;
    }
    
    // 对于其他角色，检查是否有所有必要的权限
    return requiredPermission.every(permission => 
      hasPermissionByType(permissions, permission)
    );
  };

  // 综合检查所有权限
  const checkPermission = () => {
    const rolePermission = hasRolePermission();
    const modulePermission = hasModulePermission();
    const featurePermission = hasFeaturePermission();
    
    console.log(`权限检查 - 角色: ${rolePermission}, 模块: ${modulePermission}, 功能: ${featurePermission}`);
    
    return rolePermission && modulePermission && featurePermission;
  };

  useEffect(() => {
    if (!checkPermission() && showErrorPage) {
      console.warn(`用户缺少访问权限:`, {
        userRole,
        requiredModule,
        requiredPermission,
        allowedRoles
      });
    }
  }, [userRole, requiredModule, requiredPermission, allowedRoles, showErrorPage]);

  // 获取当前用户信息
  const userName = user?.fullName || user?.username || '用户';
  const roleDisplayName = user?.roleDisplayName || (userRole === 'admin' ? '管理员' : userRole === 'teacher' ? '教师' : '学生');

  // 检查权限并渲染对应内容
  if (checkPermission()) {
    return <>{children}</>;
  } else if (redirectTo) {
    window.location.href = redirectTo;
    return null;
  } else if (showEmptyPlaceholder) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <Space direction="vertical" align="center">
            <Typography.Text type="secondary">
              <LockOutlined /> {userName}（{roleDisplayName}）没有权限访问{componentName || '此功能'}
            </Typography.Text>
            {showGuide && (
              <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                <InfoCircleOutlined /> 如需访问权限，请联系系统管理员
              </Typography.Text>
            )}
          </Space>
        }
      />
    );
  } else if (showErrorPage) {
    return (
      <Result
        status="403"
        title="访问受限"
        subTitle={`很抱歉，${userName}（${roleDisplayName}）没有权限访问${componentName || '此页面'}`}
        extra={
          <Space>
            {backButton && (
              <Button type="primary" onClick={() => window.history.back()}>
                返回上一页
              </Button>
            )}
            {homeButton && (
              <Button onClick={() => window.location.href = '/'}>
                返回首页
              </Button>
            )}
            {showGuide && (
              <Tooltip title="如需访问权限，请联系系统管理员">
                <Button type="link" icon={<InfoCircleOutlined />}>
                  权限说明
                </Button>
              </Tooltip>
            )}
          </Space>
        }
      />
    );
  } else {
    return null;
  }
};

export default PermissionGuard; 