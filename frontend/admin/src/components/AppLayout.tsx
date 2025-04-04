import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Space, Badge } from 'antd';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  DashboardOutlined,
  BookOutlined,
  SettingOutlined,
  FileOutlined,
  BellOutlined,
  LogoutOutlined,
  TeamOutlined,
  NotificationOutlined,
  ReadOutlined,
  ShareAltOutlined,
  ProjectOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png';

const { Header, Sider, Content } = Layout;
type MenuItem = Required<MenuProps>['items'][number];

interface AppLayoutProps {
  children?: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, roles, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedKeys, setSelectedKeys] = useState<string[]>(['dashboard']);
  
  // 根据当前路径设置选中的菜单项
  useEffect(() => {
    const pathname = location.pathname;
    const firstSegment = pathname.split('/')[1] || 'dashboard';
    setSelectedKeys([firstSegment]);
  }, [location.pathname]);
  
  // 处理登出
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  // 处理头像点击
  const handleAvatarClick = (key: string) => {
    if (key === 'profile') {
      if (roles?.includes('admin')) {
        navigate('/user-profile');
      } else if (roles?.includes('teacher')) {
        navigate('/teacher/profile');
      } else if (roles?.includes('student')) {
        navigate('/student/profile');
      }
    } else if (key === 'logout') {
      handleLogout();
    }
  };
  
  // 获取根据角色的菜单项
  const getMenuItems = (): MenuItem[] => {
    // 管理员菜单
    if (roles?.includes('admin')) {
      return [
        {
          key: 'dashboard',
          icon: <DashboardOutlined />,
          label: <Link to="/dashboard">仪表盘</Link>,
        },
        {
          key: 'user-management',
          icon: <UserOutlined />,
          label: <Link to="/user-management">用户管理</Link>,
        },
        {
          key: 'course-management',
          icon: <BookOutlined />,
          label: <Link to="/course-management">课程管理</Link>,
          children: [
            {
              key: 'course-list',
              label: <Link to="/course-management">课程列表</Link>,
            },
            {
              key: 'course-categories',
              label: <Link to="/course-categories">课程分类</Link>,
            },
          ]
        },
        {
          key: 'material-management',
          icon: <FileOutlined />,
          label: <Link to="/material-management">学习素材管理</Link>,
        },
        {
          key: 'knowledge-graph',
          icon: <ShareAltOutlined />,
          label: <Link to="/knowledge-graph">知识图谱管理</Link>,
        },
        {
          key: 'notification',
          icon: <BellOutlined />,
          label: <Link to="/notifications">通知管理</Link>,
        },
        {
          key: 'evaluation',
          icon: <ProjectOutlined />,
          label: <Link to="/evaluations">评估与成绩</Link>,
          children: [
            {
              key: 'exam-management',
              label: <Link to="/exam-management">考试管理</Link>,
            },
            {
              key: 'grade-management',
              label: <Link to="/grade-management">成绩管理</Link>,
            },
          ]
        },
        {
          key: 'settings',
          icon: <SettingOutlined />,
          label: <Link to="/settings">系统设置</Link>,
        },
      ];
    }
    // 教师菜单
    else if (roles?.includes('teacher')) {
      return [
        {
          key: 'dashboard',
          icon: <DashboardOutlined />,
          label: <Link to="/teacher/dashboard">仪表盘</Link>,
        },
        {
          key: 'course-management',
          icon: <BookOutlined />,
          label: <Link to="/teacher/courses">课程管理</Link>,
        },
        {
          key: 'materials',
          icon: <FileOutlined />,
          label: <Link to="/teacher/materials">学习素材</Link>,
        },
        {
          key: 'students',
          icon: <TeamOutlined />,
          label: <Link to="/teacher/students">学生管理</Link>,
        },
        {
          key: 'notification',
          icon: <BellOutlined />,
          label: <Link to="/teacher/notifications">通知管理</Link>,
        },
        {
          key: 'evaluation',
          icon: <ProjectOutlined />,
          label: <Link to="/teacher/evaluations">评估与成绩</Link>,
        },
      ];
    }
    // 学生菜单
    else {
      return [
        {
          key: 'dashboard',
          icon: <DashboardOutlined />,
          label: <Link to="/student/dashboard">仪表盘</Link>,
        },
        {
          key: 'courses',
          icon: <BookOutlined />,
          label: <Link to="/student/courses">我的课程</Link>,
        },
        {
          key: 'materials',
          icon: <FileOutlined />,
          label: <Link to="/student/materials">学习素材</Link>,
        },
        {
          key: 'notification',
          icon: <BellOutlined />,
          label: <Link to="/student/notifications">消息中心</Link>,
        },
        {
          key: 'grades',
          icon: <ProjectOutlined />,
          label: <Link to="/student/grades">我的成绩</Link>,
        },
      ];
    }
  };
  
  // 头像下拉菜单
  const avatarMenu = (
    <Menu
      onClick={({ key }) => handleAvatarClick(key)}
      items={[
        {
          key: 'profile',
          icon: <UserOutlined />,
          label: '个人资料',
        },
        {
          key: 'settings',
          icon: <SettingOutlined />,
          label: '账户设置',
        },
        {
          type: 'divider',
        },
        {
          key: 'logout',
          icon: <LogoutOutlined />,
          label: '退出登录',
        },
      ]}
    />
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} width={260}>
        <div className="logo-container" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          padding: '16px', 
          color: 'white',
          height: '64px',
          justifyContent: collapsed ? 'center' : 'flex-start'
        }}>
          {!collapsed && (
            <>
              <img src={logo} alt="Logo" style={{ height: '32px', marginRight: '10px' }} />
              <h1 style={{ margin: 0, color: 'white', fontSize: '18px' }}>在线学习系统</h1>
            </>
          )}
          {collapsed && <img src={logo} alt="Logo" style={{ height: '32px' }} />}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          defaultOpenKeys={['course-management', 'evaluation']}
          items={getMenuItems()}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: '#fff', display: 'flex', justifyContent: 'space-between' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          <div style={{ marginRight: 20 }}>
            <Space size="middle">
              <Badge count={5}>
                <Button shape="circle" icon={<BellOutlined />} />
              </Badge>
              <Dropdown overlay={avatarMenu}>
                <Space style={{ cursor: 'pointer' }}>
                  <Avatar src={user?.avatarUrl} icon={<UserOutlined />} />
                  {user?.name || user?.username || '用户'}
                </Space>
              </Dropdown>
            </Space>
          </div>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: '#fff', overflow: 'auto' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout; 