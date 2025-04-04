import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import AppLayout from './components/AppLayout';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import RequireAuth from './components/RequireAuth';

// 角色选择和登录页面
import RoleSelection from './pages/RoleSelection';
import AdminLogin from './pages/AdminLogin';
import TeacherLogin from './pages/TeacherLogin';
import StudentLogin from './pages/StudentLogin';

// 懒加载页面组件
const Dashboard = lazy(() => import('./pages/Dashboard'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const CourseManagement = lazy(() => import('./pages/CourseManagement'));
const CourseDetail = lazy(() => import('./pages/CourseDetail'));
const CourseCategories = lazy(() => import('./pages/CourseCategories'));
const MaterialManagement = lazy(() => import('./pages/MaterialManagement'));
const KnowledgeGraph = lazy(() => import('./pages/KnowledgeGraph'));
const NotificationManagement = lazy(() => import('./pages/NotificationManagement'));
const ExamManagement = lazy(() => import('./pages/ExamManagement'));
const GradeManagement = lazy(() => import('./pages/GradeManagement'));
const Settings = lazy(() => import('./pages/Settings'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard'));
const TeacherMaterialManagement = lazy(() => import('./pages/TeacherMaterialManagement'));
const StudentMaterialsView = lazy(() => import('./pages/StudentMaterialsView'));

// 加载中组件
const LoadingComponent = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Spin size="large" tip="加载中..." />
  </div>
);

const Router: React.FC = () => {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <Routes>
        {/* 角色选择为默认入口 */}
        <Route path="/" element={<RoleSelection />} />
        
        {/* 角色特定登录页面 */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/teacher/login" element={<TeacherLogin />} />
        <Route path="/student/login" element={<StudentLogin />} />
        
        {/* 保留原始登录页面，作为兼容性支持 */}
        <Route path="/login" element={<Login />} />
        
        {/* 管理员路由 - 受保护的路由 */}
        <Route path="/" element={<RequireAuth allowedRoles={['admin']}><AppLayout /></RequireAuth>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="user-management" element={<UserManagement />} />
          <Route path="course-management" element={<CourseManagement />} />
          <Route path="course-detail/:id" element={<CourseDetail />} />
          <Route path="course-categories" element={<CourseCategories />} />
          <Route path="material-management" element={<MaterialManagement />} />
          <Route path="knowledge-graph" element={<KnowledgeGraph />} />
          <Route path="notifications" element={<NotificationManagement />} />
          <Route path="exam-management" element={<ExamManagement />} />
          <Route path="grade-management" element={<GradeManagement />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        
        {/* 教师路由 */}
        <Route path="/teacher" element={<RequireAuth allowedRoles={['teacher']}><AppLayout /></RequireAuth>}>
          <Route index element={<Navigate to="/teacher/dashboard" replace />} />
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="materials" element={<TeacherMaterialManagement />} />
          {/* 更多教师特定页面... */}
        </Route>
        
        {/* 学生路由 */}
        <Route path="/student" element={<RequireAuth allowedRoles={['student']}><AppLayout /></RequireAuth>}>
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="materials" element={<StudentMaterialsView />} />
          {/* 更多学生特定页面... */}
        </Route>
        
        {/* 404页面 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default Router; 