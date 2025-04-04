import React, { useState, useEffect, lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider, Layout, Menu, Avatar, Dropdown, Button, Spin, Space, Typography } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  DashboardOutlined, 
  BookOutlined, 
  TeamOutlined, 
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined 
} from '@ant-design/icons';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import zhCN from 'antd/locale/zh_CN';
import './index.css';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

// 简单的加载组件
const LoadingComponent = ({ fullScreen = false, tip = "加载中..." }) => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center',
    height: fullScreen ? '100vh' : '100%',
    padding: '20px'
  }}>
    <Spin tip={tip} size="large" />
  </div>
);

// 错误边界组件
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("应用渲染错误:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, margin: 20, backgroundColor: '#fff1f0', border: '1px solid #ffa39e', borderRadius: 4 }}>
          <h2>页面加载错误</h2>
          <p>抱歉，页面加载过程中发生错误。</p>
          <pre style={{ backgroundColor: '#fafafa', padding: 10, borderRadius: 4, overflow: 'auto' }}>
            {this.state.error?.toString()}
          </pre>
          <button onClick={() => window.location.reload()} style={{ backgroundColor: '#1890ff', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', marginTop: 16 }}>
            刷新页面
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// 懒加载页面组件
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const StudentManagement = lazy(() => import('./pages/StudentManagement'));
const CourseManagement = lazy(() => import('./pages/CourseManagement'));
const SystemSettings = lazy(() => import('./pages/SystemSettings'));
const NotFound = lazy(() => import('./pages/NotFound'));

// 包装懒加载组件
const PageLoader = ({ children }) => (
  <ErrorBoundary>
    <Suspense fallback={<LoadingComponent />}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

// 简化版应用
const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 模拟检查认证
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 尝试从localStorage获取用户信息
        const userStr = localStorage.getItem('currentUser');
        const token = localStorage.getItem('token');
        
        if (userStr && token) {
          const savedUser = JSON.parse(userStr);
          setUser(savedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('验证用户失败:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // 模拟登录
  const handleLogin = (credentials) => {
    // 在实际应用中，这里会调用API
    const mockUser = {
      id: '1',
      username: credentials.username,
      name: credentials.username === 'admin' ? '管理员' : '用户',
      role: credentials.username === 'admin' ? 'admin' : 'user',
      avatar: ''
    };
    
    setUser(mockUser);
    setIsAuthenticated(true);
    
    // 保存到localStorage模拟持久化
    localStorage.setItem('currentUser', JSON.stringify(mockUser));
    localStorage.setItem('token', 'mock-token-123');
    
    return mockUser;
  };
  
  // 模拟登出
  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  };
  
  if (loading) {
    return <LoadingComponent fullScreen />;
  }

  // 登录页面
  if (!isAuthenticated) {
    return (
      <ConfigProvider locale={zhCN}>
        <Router>
          <Routes>
            <Route path="*" element={
              <PageLoader>
                <Login onLogin={handleLogin} />
              </PageLoader>
            } />
          </Routes>
        </Router>
      </ConfigProvider>
    );
  }

  // 用户菜单
  const userMenu = [
    {
      key: 'profile',
      label: <Link to="/profile">个人资料</Link>,
      icon: <UserOutlined />
    },
    {
      key: 'logout',
      label: <span onClick={handleLogout}>退出登录</span>,
      icon: <LogoutOutlined />
    }
  ];

  // 侧边栏菜单
  const sideMenuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard">仪表盘</Link>
    },
    {
      key: 'courses',
      icon: <BookOutlined />,
      label: <Link to="/courses">课程管理</Link>
    },
    {
      key: 'students',
      icon: <TeamOutlined />,
      label: <Link to="/students">学生管理</Link>
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: <Link to="/settings">系统设置</Link>
    }
  ];

  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <Layout style={{ minHeight: '100vh' }}>
          <Sider 
            trigger={null} 
            collapsible 
            collapsed={collapsed}
            theme="dark"
          >
            <div className="logo">
              {collapsed ? "OLS" : "在线学习系统"}
            </div>
            <Menu
              theme="dark"
              mode="inline"
              defaultSelectedKeys={['dashboard']}
              items={sideMenuItems}
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
              <div style={{ marginRight: 20, display: 'flex', alignItems: 'center' }}>
                <Button type="text" icon={<BellOutlined />} style={{ marginRight: 12 }} />
                <Dropdown
                  menu={{ items: userMenu }}
                  placement="bottomRight"
                  arrow
                >
                  <div style={{ cursor: 'pointer' }}>
                    <Space>
                      <Avatar icon={<UserOutlined />} src={user?.avatar} />
                      <Text>{user?.name || '用户'}</Text>
                    </Space>
                  </div>
                </Dropdown>
              </div>
            </Header>
            <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', borderRadius: 4 }}>
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<PageLoader><Dashboard /></PageLoader>} />
                  <Route path="/courses" element={<PageLoader><CourseManagement /></PageLoader>} />
                  <Route path="/students" element={<PageLoader><StudentManagement /></PageLoader>} />
                  <Route path="/settings" element={<PageLoader><SystemSettings /></PageLoader>} />
                  <Route path="*" element={<PageLoader><NotFound /></PageLoader>} />
                </Routes>
              </ErrorBoundary>
            </Content>
          </Layout>
        </Layout>
      </Router>
    </ConfigProvider>
  );
};

// 渲染应用
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 