import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout, Dropdown, Avatar, Space, Typography, message, Divider, Menu, Badge, Spin, App as AntdApp, Button } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ReadOutlined,
  ExperimentOutlined,
  DashboardOutlined,
  BookOutlined,
  TeamOutlined,
  FileOutlined,
  BarChartOutlined,
  NodeIndexOutlined,
  MessageOutlined,
  ApiOutlined,
  BellOutlined,
  RadarChartOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  FileTextOutlined,
  CommentOutlined
} from '@ant-design/icons';
import LoadingComponent from './components/LoadingComponent';
import ErrorBoundary from './components/ErrorBoundary';
import ThemeSwitch from './components/ThemeSwitch';
import SideMenu from './components/SideMenu';
import NotificationCenter from './components/NotificationCenter';
import { useAppContext } from './contexts/AppContext';
import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import RoleSelection from './pages/RoleSelection';
import { initializeResources } from './styles/loadExternalResources';
import KnowledgeGraphTest from './pages/KnowledgeGraphTest';
import { Link } from 'react-router-dom';
import notificationService from './services/notificationService';
import { INotification } from './components/NotificationItem';
import PrivateRoute from './components/PrivateRoute';
import TeacherResearchGroup from './pages/TeacherResearchGroup';
import NotificationManagementPage from './pages/NotificationManagementPage';
import ApiTest from './pages/ApiTest';
import ApiTestPage from './pages/ApiTestPage';
import ApiDocumentation from './pages/ApiDocumentation';
import VideoTest from './pages/VideoTest';
import AuthHandler from './components/AuthHandler';
import { initializeMockEnvironment } from './utils/mockSetup';
import MockDataHandler from './components/MockDataHandler';
import config from './config/env'; // 导入环境配置
import errorHandler from './utils/errorHandler';
import './App.css';
import api from './services/api'; // 导入API服务
import authService from './services/authService'; // 导入认证服务
import AppRoutes from './router/AppRoutes';

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

// 懒加载页面组件
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MaterialManagement = lazy(() => import('./pages/MaterialManagement'));
const MaterialCategoryManagement = lazy(() => import('./pages/MaterialCategoryManagement'));
const MaterialSearch = lazy(() => import('./pages/MaterialSearch'));
const MaterialDetail = lazy(() => import('./pages/MaterialDetail'));
const TeacherManagement = lazy(() => import('./pages/TeacherManagement'));
const StudentManagement = lazy(() => import('./pages/StudentManagement'));
const ApplicationManagement = lazy(() => import('./pages/ApplicationManagement'));
const SystemSettings = lazy(() => import('./pages/SystemSettings'));
const CourseManagement = lazy(() => import('./pages/CourseManagement'));
const CourseDetail = lazy(() => import('./pages/CourseDetail'));
const FeedbackManagement = lazy(() => import('./pages/FeedbackManagement'));
const FeedbackDetail = lazy(() => import('./pages/FeedbackDetail'));
const CreateFeedback = lazy(() => import('./pages/CreateFeedback'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Login = lazy(() => import('./pages/Login'));
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const CourseDetailView = lazy(() => import('./pages/CourseDetailView'));
const KnowledgeGraphManagement = lazy(() => import('./pages/KnowledgeGraphManagement'));
const KnowledgeGraphView = lazy(() => import('./pages/KnowledgeGraphView'));
const ExamCenter = lazy(() => import('./pages/ExamCenter'));
const ExamManagement = lazy(() => import('./pages/ExamManagement'));
const ExamCreation = lazy(() => import('./pages/ExamCreation'));
const ExamReview = lazy(() => import('./pages/ExamReview'));
const StudentExams = lazy(() => import('./pages/StudentExams'));
const ExamTaking = lazy(() => import('./pages/ExamTaking'));
const ExamGrading = lazy(() => import('./pages/ExamGrading'));
const ExamAnalytics = lazy(() => import('./pages/ExamAnalytics'));
const TeacherCourseManagement = lazy(() => import('./pages/TeacherCourseManagement'));
const TeacherAssignmentManagement = lazy(() => import('./pages/TeacherAssignmentManagement'));
const TeacherAssignmentGrading = lazy(() => import('./pages/TeacherAssignmentGrading'));
const StudentCourseList = lazy(() => import('./pages/StudentCourseList'));
const StudentAssignmentSubmission = lazy(() => import('./pages/StudentAssignmentSubmission'));
const StudentLearningProgress = lazy(() => import('./pages/StudentLearningProgress'));
const StudentEvaluation = lazy(() => import('./pages/StudentEvaluation'));
const ClassEvaluation = lazy(() => import('./pages/ClassEvaluation'));
const MaterialStatistics = lazy(() => import('./pages/MaterialStatistics'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const MaterialUpload = lazy(() => import('./pages/MaterialUpload'));
const NotificationPage = lazy(() => import('./pages/NotificationPage'));
const PermissionDemo = lazy(() => import('./pages/PermissionDemo'));
const StudentLearningCenter = lazy(() => import('./pages/StudentLearningCenter'));
const StudentAchievements = lazy(() => import('./pages/StudentAchievements'));
const StudentCompetitions = lazy(() => import('./pages/StudentCompetitions'));
const StudentPointsHistory = lazy(() => import('./pages/StudentPointsHistory'));
const FeedbackDetailPage = lazy(() => import('./pages/FeedbackDetailPage'));
const CreateFeedbackPage = lazy(() => import('./pages/CreateFeedbackPage'));
const Diagnostics = lazy(() => import('./pages/Diagnostics'));

// 加载包装器
const PageLoader = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary>
    <Suspense fallback={<LoadingComponent fullScreen={false} />}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

// 基于角色的重定向组件，根据用户角色重定向到对应的仪表盘
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

// 初始化应用资源
const initializeAppResources = async () => {
  try {
    // 记录启动流程
  console.log('开始初始化应用资源...');
  
    // 初始化API连接
    const apiConnected = await api.checkApiConnection();
    if (!apiConnected) {
      console.warn('API连接失败，将使用本地模拟数据');
      
      // 检查是否是认证问题导致的连接失败
      const token = localStorage.getItem('token');
      if (token) {
        // 尝试验证令牌
        try {
          const isTokenValid = await authService.verifyToken();
          if (!isTokenValid) {
            console.warn('认证令牌已过期，清除登录状态');
            authService.logout();
            window.location.href = '/login'; // 强制跳转到登录页面
            return false;
          }
        } catch (err) {
          console.error('验证令牌失败，清除登录状态:', err);
          authService.logout();
          window.location.href = '/login'; // 强制跳转到登录页面
          return false;
        }
    }
  } else {
      console.log('API连接成功');
    }
    
    // 记录当前用户状态
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      console.log('当前登录用户:', currentUser);
      console.log('用户角色:', currentUser.role);
      } else {
      console.log('当前未登录');
      }
    
    console.log('资源初始化成功');
    return true;
    } catch (error) {
    console.error('资源初始化失败:', error);
    return false;
    }
};

const App: React.FC = () => {
  const { user, isAuthenticated, sidebarCollapsed, toggleSidebar, logout } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [notificationMenuVisible, setNotificationMenuVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pageLoading, setPageLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // 检查认证状态
  useEffect(() => {
    // 模拟API检查，确保有视觉反馈
    setTimeout(() => {
      setLoading(false);
      
      // 移除直接使用navigate的代码
      // 这些导航逻辑现在由 AppRoutes 组件中的路由配置处理
    }, 500); // 短暂延迟以显示加载状态
  }, [isAuthenticated]);

  // 加载通知数据
  useEffect(() => {
    // 只在用户已登录时加载通知
    if (isAuthenticated) {
      loadNotifications();
      
      // 设置定时器，每分钟刷新一次通知
      const intervalId = setInterval(loadNotifications, 60000);
      
      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated]);
  
  // 加载通知
  const loadNotifications = async () => {
    try {
      setNotificationsLoading(true);
      
      // 直接使用已导入的 notificationService 实例
      const response = await notificationService.getNotifications();
      
      // 检查响应格式，处理新的返回结构
      const fetchedNotifications = response.data || response;
      
      if (fetchedNotifications && fetchedNotifications.length > 0) {
        console.log(`成功加载${fetchedNotifications.length}条通知`);
        setNotifications(fetchedNotifications);
        setUnreadCount(fetchedNotifications.filter(item => !item.isRead).length);
      } else {
        console.log('没有获取到通知或返回为空');
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('加载通知失败:', error);
    } finally {
      setNotificationsLoading(false);
    }
  };
  
  // 处理已读通知
  const handleReadNotification = async (id: string) => {
    try {
      // 模拟API调用
      console.log(`模拟标记通知 ${id} 为已读`);
      
      // 更新本地通知状态
      const updatedNotifications = notifications.map(notification => {
        if (notification.id === id) {
          return {
            ...notification,
            isRead: true
          };
        }
        return notification;
      });
      
      setNotifications(updatedNotifications);
      // 重新计算未读数量
      setUnreadCount(updatedNotifications.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('标记通知已读失败:', error);
    }
  };
  
  // 标记所有通知为已读
  const handleReadAllNotifications = async () => {
    try {
      console.log('模拟标记所有通知为已读');
      
      // 直接更新本地状态
      setNotifications(prev => 
        prev.map(item => ({ ...item, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('标记所有通知已读失败:', error);
    }
  };
  
  // 处理删除通知
  const handleDeleteNotification = async (id: string) => {
    try {
      // 模拟API调用
      console.log(`模拟删除通知 ${id}`);
      
      // 从本地状态中移除通知
      const updatedNotifications = notifications.filter(n => n.id !== id);
      setNotifications(updatedNotifications);
      // 重新计算未读数量
      setUnreadCount(updatedNotifications.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('删除通知失败:', error);
    }
  };
  
  // 删除所有通知
  const handleDeleteAllNotifications = async () => {
    try {
      console.log('模拟删除所有通知');
      
      // 直接更新本地状态
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('删除所有通知失败:', error);
    }
  };

  // 处理通知点击
  const handleNotificationClick = (notification: INotification) => {
    // 处理通知点击，例如导航到相关页面
    console.log('点击通知:', notification);
    
    // 标记已读
    if (!notification.isRead) {
      handleReadNotification(notification.id);
    }
  };

  // 应用初始化
  useEffect(() => {
    const initApp = async () => {
      try {
        setPageLoading(true);
        
        // 初始化环境
        if (config.USE_MOCK_DATA) {
          await initializeMockEnvironment();
        }
        
        // 应用各种初始化逻辑
        const initialized = await initializeAppResources();
        if (!initialized) {
          console.error('应用资源初始化失败');
        }
        
        // 检查自动登录
        await authService.checkAndAutoLogin();
      } catch (error) {
        console.error('应用初始化失败:', error);
        errorHandler.logError('application', '应用初始化失败', error);
      } finally {
        setPageLoading(false);
      }
    };
    
    initApp();
  }, []);

  // 用户菜单
  const userMenu = [
    {
      key: 'profile',
      label: <Link to="/profile">个人资料</Link>,
      icon: <UserOutlined />
    },
    {
      key: 'logout',
      label: <span onClick={logout}>退出登录</span>,
      icon: <LogoutOutlined />
    }
  ];

  // 渲染顶部用户菜单
  const renderUserMenu = () => (
    <Dropdown
      menu={{ items: userMenu }}
      placement="bottomRight"
      arrow
    >
      <div style={{ cursor: 'pointer' }}>
        <Space>
          <Avatar 
            icon={<UserOutlined />} 
            src={user?.avatar} 
          />
          <Text>{user?.name || '用户'}</Text>
        </Space>
      </div>
    </Dropdown>
  );

  // 渲染侧边栏菜单
  const renderSideMenu = () => (
    <SideMenu />
  );

  if (loading) {
    return <LoadingComponent fullScreen />;
  }

  // 不再根据路径条件渲染不同布局，而是统一由AppRoutes处理

  return (
    <ErrorBoundary>
      <ConfigProvider locale={zhCN} theme={{ algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm }}>
        <AntdApp>
          {/* @ts-ignore */}
          <AuthHandler>
            {/* @ts-ignore */}
            <MockDataHandler>
              {loading ? (
                <LoadingComponent fullScreen={true} tip="系统初始化中..." />
              ) : (
          <Layout style={{ minHeight: '100vh' }}>
                  {isAuthenticated && (
                    <Header className="main-header" style={{ padding: 0, background: darkMode ? '#001529' : '#fff' }}>
                      <div className="header-left">
                        <Button
                          type="text"
                          icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                          onClick={toggleSidebar}
                          className="trigger-button"
                />
              </div>
                      <div className="header-right">
                        {/* 通知中心 */}
                        {/* @ts-ignore */}
                  <NotificationCenter
                    loading={notificationsLoading}
                          notifications={notifications}
                    onMarkAsRead={handleReadNotification}
                    onMarkAllAsRead={handleReadAllNotifications}
                    onDelete={handleDeleteNotification}
                    onDeleteAll={handleDeleteAllNotifications}
                    onRefresh={loadNotifications}
                          onNotificationClick={handleNotificationClick}
                        />
                        
                        {/* 主题切换 */}
                        <ThemeSwitch 
                          darkMode={darkMode} 
                          onChange={(isDark) => setDarkMode(isDark)}
                        />
                        
                        {/* 用户菜单 */}
                  {renderUserMenu()}
                      </div>
              </Header>
                  )}
                  
                  <Layout>
                    {isAuthenticated && (
                      <Sider 
                        trigger={null} 
                        collapsible 
                        collapsed={sidebarCollapsed}
                        width={250}
                        collapsedWidth={80}
                        className="main-sidebar"
                        breakpoint="lg"
                      >
                        <div className="logo">
                          {sidebarCollapsed ? "OLS" : "在线学习系统"}
                        </div>
                        {renderSideMenu()}
                      </Sider>
                    )}
                    
                    <Layout>
                      <Content className="main-content">
                        <ErrorBoundary>
                <Routes>
                            {/* 公开路由 */}
                            <Route path="/login" element={<PageLoader><Login /></PageLoader>} />
                            <Route path="/choose-role" element={<PageLoader><RoleSelection /></PageLoader>} />
                            
                            {/* 角色重定向 */}
                            <Route path="/" element={
                              isAuthenticated ? 
                                <RoleBasedRedirect /> : 
                                <Navigate to="/login" replace />
                            } />
                            
                            {/* 应用路由 - 使用AppRoutes组件管理所有路由 */}
                            <Route path="/*" element={<AppRoutes />} />
                </Routes>
                        </ErrorBoundary>
              </Content>
            </Layout>
          </Layout>
                </Layout>
              )}
            </MockDataHandler>
          </AuthHandler>
        </AntdApp>
    </ConfigProvider>
    </ErrorBoundary>
  );
};

export default App; 