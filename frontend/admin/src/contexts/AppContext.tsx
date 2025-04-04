import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { message } from 'antd';
import authService from '../services/authService';
import { Notification } from '../types/notification';

// 用户角色类型
export type UserRole = 'admin' | 'teacher' | 'student';

// 教师分组类型
export type TeacherGroupType = 'research' | 'preparation' | 'review';

// 教师分组信息
export interface TeacherGroup {
  id: string;
  name: string;
  type: TeacherGroupType;
  description: string;
  members?: string[];
  leaderId?: string;
}

// 考试相关数据模型
export type ExamStatus = 'draft' | 'pending_review' | 'approved' | 'published' | 'active' | 'ended' | 'archived';
export type QuestionType = 'multiple_choice' | 'single_choice' | 'true_false' | 'fill_blank' | 'short_answer' | 'essay';

export interface ExamQuestion {
  id: string;
  content: string;
  type: QuestionType;
  options?: string[];
  correctAnswer?: string | string[];
  score: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseName: string;
  creatorId: string;
  creatorName: string;
  status: ExamStatus;
  duration: number; // 考试时长(分钟)
  startTime: string; // ISO日期时间字符串
  endTime: string; // ISO日期时间字符串
  totalScore: number;
  passingScore: number;
  questions: ExamQuestion[];
  isRandomOrder: boolean;
  allowedRetries: number;
  visibleToStudents: boolean;
  reviewerId?: string;
  reviewerName?: string;
  reviewTime?: string;
  reviewComment?: string;
}

export interface ExamSubmission {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  startTime: string;
  endTime: string;
  status: 'in_progress' | 'submitted' | 'graded';
  answers: {
    questionId: string;
    answer: string | string[];
  }[];
  score?: number;
  graderId?: string;
  graderName?: string;
  gradingTime?: string;
  gradingComments?: string;
}

// 用户信息接口
export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  avatar?: string;
  email?: string;
  department?: string;
  phone?: string;
  bio?: string;
  // 教师分组相关字段
  teacherGroups?: TeacherGroup[]; // 所属的教师分组
  isGroupLeader?: boolean; // 是否是某个组的组长
  // 模块权限列表
  modulePermissions?: string[];
  // 学生特定属性
  studentId?: string;
  classId?: string;
  className?: string;
  grade?: string;
  enrollmentYear?: number;
  major?: string;
  // 教师特定属性
  title?: string;
}

// 主题类型
export type ThemeMode = 'light' | 'dark';

// 应用状态接口
interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  theme: ThemeMode;
  loading: boolean;
  sidebarCollapsed: boolean;
  notifications: Notification[];
  unreadCount: number;
}

// 应用上下文接口
export interface AppContextValue {
  user: User | null;
  isAuthenticated: boolean;
  theme: ThemeMode;
  loading: boolean;
  sidebarCollapsed: boolean;
  notifications: Notification[];
  unreadCount: number;
  login: (user: User) => number | undefined;
  logout: () => void;
  updateUser: (user: User) => void;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  toggleSidebar: () => void;
  setLoading: (loading: boolean) => void;
  setNotifications: (notifications: Notification[]) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
  deleteAllNotifications: () => void;
}

// 创建上下文
const AppContext = createContext<AppContextValue | undefined>(undefined);

// 上下文提供者Props
interface AppProviderProps {
  children: ReactNode;
}

// 用于存储token检查的interval ID
let tokenCheckIntervalId: number | undefined;

// 上下文提供者组件
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // 初始状态
  const [state, setState] = useState<AppState>({
    user: null,
    isAuthenticated: false,
    theme: 'light',
    loading: true,
    sidebarCollapsed: false,
    notifications: [],
    unreadCount: 0,
  });

  // 从本地存储加载用户信息和主题设置
  useEffect(() => {
    const loadUserFromStorage = async () => {
      const userStr = localStorage.getItem('user');
      const themeMode = localStorage.getItem('theme') as ThemeMode || 'light';
      const sidebarState = localStorage.getItem('sidebarCollapsed') === 'true';
      
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          setState(prev => ({
            ...prev,
            user: userData,
            isAuthenticated: true,
            theme: themeMode,
            sidebarCollapsed: sidebarState
          }));
        } catch (error) {
          console.error('解析用户数据失败', error);
        }
      } else {
        setState(prev => ({
          ...prev,
          theme: themeMode,
          sidebarCollapsed: sidebarState
        }));
      }
    };

    loadUserFromStorage();
  }, []);

  // 初始化应用状态
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('初始化应用状态...');
        
        // 初始化认证状态
        const authInitialized = await authService.initAuth();
        
        if (authInitialized) {
          const user = authService.getCurrentUser();
          if (user) {
            setState(prev => ({
              ...prev,
              user,
              isAuthenticated: true,
            }));
            console.log('用户已认证:', user.username);
          }
        }
      } catch (error) {
        console.error('初始化应用状态失败:', error);
      } finally {
        setState(prev => ({
          ...prev,
          loading: false,
        }));
      }
    };
    
    initializeApp();
    
    // 组件卸载时清除interval
    return () => {
      if (tokenCheckIntervalId) {
        clearInterval(tokenCheckIntervalId);
      }
    };
  }, []);

  // 登录方法
  const login = (user: User) => {
    console.log('AppContext: 登录用户', user);
    
    // 验证用户角色
    if (!user.role || !['admin', 'teacher', 'student'].includes(user.role)) {
      console.error('AppContext: 用户角色无效或未设置', user.role);
      message.error('用户角色无效，请联系管理员');
      return;
    }
    
    console.log('AppContext: 用户已登录', user.username, '角色:', user.role);
    
    // 保存用户信息
    localStorage.setItem('user', JSON.stringify(user));
    
    // 更新状态
    setState(prev => ({
      ...prev,
      user,
      isAuthenticated: true,
    }));
    
    // 创建token检查定时器，在后台运行验证token状态
    tokenCheckIntervalId = window.setInterval(() => {
      authService.checkAndRefreshToken().catch(error => {
        console.error('Token刷新失败:', error);
        // 如果刷新失败且token已过期，强制登出
        if (error.message?.includes('expired')) {
          logout();
          message.error('登录已过期，请重新登录');
        }
      });
    }, 60000); // 每分钟检查一次
    
    return tokenCheckIntervalId;
  };

  // 登出方法
  const logout = () => {
    // 调用authService的logout方法确保清理所有认证数据
    authService.logout();
    
    // 清除额外的本地存储
    localStorage.removeItem('lastPath');
    
    // 更新状态
    setState(prev => ({
      ...prev,
      user: null,
      isAuthenticated: false,
      notifications: [],
    }));
    
    // 清除token检查interval
    if (tokenCheckIntervalId) {
      clearInterval(tokenCheckIntervalId);
      tokenCheckIntervalId = undefined;
    }
    
    // 显示提示
    message.success('您已成功退出登录');
  };

  // 切换主题
  const toggleTheme = () => {
    const newTheme: ThemeMode = state.theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };
  
  // 设置主题
  const setTheme = (theme: ThemeMode) => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    setState(prev => ({
      ...prev,
      theme,
    }));
  };

  // 切换侧边栏
  const toggleSidebar = () => {
    const newState = !state.sidebarCollapsed;
    localStorage.setItem('sidebarCollapsed', String(newState));
    setState(prev => ({
      ...prev,
      sidebarCollapsed: newState,
    }));
  };

  // 设置加载状态
  const setLoading = (loading: boolean) => {
    setState(prev => ({
      ...prev,
      loading,
    }));
  };

  // 更新用户信息
  const updateUser = (user: User) => {
    console.log('AppContext: 更新用户信息', user);
    localStorage.setItem('user', JSON.stringify(user));
    setState(prev => ({
      ...prev,
      user,
    }));
  };

  // 设置通知列表
  const setNotifications = (notifications: Notification[]) => {
    setState(prev => ({
      ...prev,
      notifications,
      unreadCount: notifications.filter(n => !n.read).length,
    }));
  };

  // 标记通知为已读
  const markNotificationAsRead = (id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(notification => 
        notification.id.toString() === id 
          ? { ...notification, read: true } 
          : notification
      ),
      unreadCount: prev.unreadCount - 1,
    }));
  };
  
  // 标记所有通知为已读
  const markAllNotificationsAsRead = () => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(notification => ({ ...notification, read: true })),
      unreadCount: 0,
    }));
  };
  
  // 删除通知
  const deleteNotification = (id: string) => {
    setState(prev => {
      const notification = prev.notifications.find(n => n.id.toString() === id);
      const unreadDelta = notification && !notification.read ? -1 : 0;
      
      return {
        ...prev,
        notifications: prev.notifications.filter(n => n.id.toString() !== id),
        unreadCount: prev.unreadCount + unreadDelta,
      };
    });
  };
  
  // 删除所有通知
  const deleteAllNotifications = () => {
    setState(prev => ({
      ...prev,
      notifications: [],
      unreadCount: 0,
    }));
  };

  // 提供上下文值
  const value: AppContextValue = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    theme: state.theme,
    loading: state.loading,
    sidebarCollapsed: state.sidebarCollapsed,
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    login,
    logout,
    updateUser,
    toggleTheme,
    setTheme,
    toggleSidebar,
    setLoading,
    setNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    deleteAllNotifications,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// 使用上下文的自定义Hook
export const useAppContext = (): AppContextValue => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext必须在AppProvider内部使用');
  }
  return context;
};

export default AppContext; 