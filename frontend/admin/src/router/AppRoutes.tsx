import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import SideMenu from '../components/SideMenu';
import PrivateRoute from '../components/PrivateRoute';
import NoPermission from '../pages/NoPermission';
import Login from '../pages/Login';
import NotFound from '../pages/NotFound';
import RoleSelection from '../pages/RoleSelection';
import RoleBasedRedirect from '../components/RoleBasedRedirect';

// 反馈管理页面
import FeedbackManagement from '../pages/FeedbackManagement';
import FeedbackDetailPage from '../pages/FeedbackDetailPage';
import CreateFeedbackPage from '../pages/CreateFeedbackPage';

// 课程管理页面
import CourseManagement from '../pages/CourseManagement';
import CourseDetail from '../pages/CourseDetail';
import CourseForm from '../pages/CourseForm';
import CourseChapters from '../pages/CourseChapters';

// 学习材料页面
import MaterialManagement from '../pages/MaterialManagement';
import MaterialDetail from '../pages/MaterialDetail';
import MaterialSearch from '../pages/MaterialSearch';
import MaterialUpload from '../pages/MaterialUpload';
import MaterialCategoryManagement from '../pages/MaterialCategoryManagement';

// 学生页面
import StudentDashboard from '../pages/StudentDashboard';
import StudentCourseList from '../pages/StudentCourseList';
import StudentLearningCenter from '../pages/StudentLearningCenter';
import StudentLearningProgress from '../pages/StudentLearningProgress';
import StudentEvaluation from '../pages/StudentEvaluation';
import StudentManagement from '../pages/StudentManagement';

// 教师页面
import TeacherDashboard from '../pages/TeacherDashboard';
import TeacherCourseManagement from '../pages/TeacherCourseManagement';
import TeacherManagement from '../pages/TeacherManagement';
import TeacherResearchGroup from '../pages/TeacherResearchGroup';
import TeacherAssignmentManagement from '../pages/TeacherAssignmentManagement';
import TeacherAssignmentGrading from '../pages/TeacherAssignmentGrading';

// 知识图谱
import KnowledgeGraphView from '../pages/KnowledgeGraphView';
import KnowledgeGraphManagement from '../pages/KnowledgeGraphManagement';
import KnowledgeGraphTest from '../pages/KnowledgeGraphTest';

// 考试管理
import ExamManagement from '../pages/ExamManagement';
import ExamCenter from '../pages/ExamCenter';
import ExamReview from '../pages/ExamReview';
import ExamAnalytics from '../pages/ExamAnalytics';
import ExamCreation from '../pages/ExamCreation';
import StudentExams from '../pages/StudentExams';
import ExamTaking from '../pages/ExamTaking';
import ExamGrading from '../pages/ExamGrading';

// 其他页面
import Dashboard from '../pages/Dashboard';
import NotificationPage from '../pages/NotificationPage';
import NotificationManagementPage from '../pages/NotificationManagementPage';
import SystemSettings from '../pages/SystemSettings';
import Diagnostics from '../pages/Diagnostics';
import ClassEvaluation from '../pages/ClassEvaluation';
import UserProfile from '../pages/UserProfile';

const { Content, Sider } = Layout;

// 检查用户是否已登录的简单函数
const isLoggedIn = () => {
  return localStorage.getItem('token') !== null;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 登录路由 - 不需要布局 */}
      <Route path="/login" element={<Login />} />
      <Route path="/role-selection" element={<RoleSelection />} />
      <Route path="/no-permission" element={<NoPermission />} />
      
      {/* 需要认证的根路由 */}
      <Route path="/" element={
        isLoggedIn() ? (
          <Layout style={{ minHeight: '100vh' }}>
            <Sider width={200} className="site-layout-background">
              <SideMenu />
            </Sider>
            <Layout className="site-layout">
              <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: '#fff' }}>
                <Routes>
                  {/* 管理员功能路由 */}
                  <Route path="/dashboard" element={
                    <PrivateRoute roles={['admin']}>
                      <Dashboard />
                    </PrivateRoute>
                  } />
                  
                  <Route path="/admin/teacher-groups" element={
                    <PrivateRoute roles={['admin']}>
                      <TeacherResearchGroup />
                    </PrivateRoute>
                  } />
                  <Route path="/admin/students" element={
                    <PrivateRoute roles={['admin']}>
                      <StudentManagement />
                    </PrivateRoute>
                  } />
                  <Route path="/admin/teachers" element={
                    <PrivateRoute roles={['admin']}>
                      <TeacherManagement />
                    </PrivateRoute>
                  } />
                  <Route path="/system-settings" element={
                    <PrivateRoute roles={['admin']}>
                      <SystemSettings />
                    </PrivateRoute>
                  } />
                  
                  {/* 学生功能路由 */}
                  <Route path="/student/dashboard" element={
                    <PrivateRoute roles={['student', 'admin']}>
                      <StudentDashboard />
                    </PrivateRoute>
                  } />
                  <Route path="/student/courses" element={
                    <PrivateRoute roles={['student', 'admin']}>
                      <StudentCourseList />
                    </PrivateRoute>
                  } />
                  <Route path="/student/learning-center" element={
                    <PrivateRoute roles={['student', 'admin']}>
                      <StudentLearningCenter />
                    </PrivateRoute>
                  } />
                  <Route path="/student/progress" element={
                    <PrivateRoute roles={['student', 'admin']}>
                      <StudentLearningProgress />
                    </PrivateRoute>
                  } />
                  <Route path="/student/evaluation" element={
                    <PrivateRoute roles={['student', 'admin']}>
                      <StudentEvaluation />
                    </PrivateRoute>
                  } />
                  <Route path="/student-exams" element={
                    <PrivateRoute roles={['student', 'admin']}>
                      <StudentExams />
                    </PrivateRoute>
                  } />
                  <Route path="/exam-taking" element={
                    <PrivateRoute roles={['student', 'admin']}>
                      <ExamTaking />
                    </PrivateRoute>
                  } />
                  
                  {/* 教师功能路由 */}
                  <Route path="/teacher/dashboard" element={
                    <PrivateRoute roles={['teacher', 'admin']}>
                      <TeacherDashboard />
                    </PrivateRoute>
                  } />
                  <Route path="/teacher/courses" element={
                    <PrivateRoute roles={['teacher', 'admin']}>
                      <TeacherCourseManagement />
                    </PrivateRoute>
                  } />
                  <Route path="/teacher/research-group" element={
                    <PrivateRoute roles={['teacher', 'admin']}>
                      <TeacherResearchGroup />
                    </PrivateRoute>
                  } />
                  <Route path="/teacher/assignments" element={
                    <PrivateRoute roles={['teacher', 'admin']}>
                      <TeacherAssignmentManagement />
                    </PrivateRoute>
                  } />
                  <Route path="/teacher/assignments/:assignmentId" element={
                    <PrivateRoute roles={['teacher', 'admin']}>
                      <TeacherAssignmentGrading />
                    </PrivateRoute>
                  } />
                  <Route path="/exam-creation" element={
                    <PrivateRoute roles={['teacher', 'admin']}>
                      <ExamCreation />
                    </PrivateRoute>
                  } />
                  <Route path="/exam-grading" element={
                    <PrivateRoute roles={['teacher', 'admin']}>
                      <ExamGrading />
                    </PrivateRoute>
                  } />
                  <Route path="/class-evaluation" element={
                    <PrivateRoute roles={['teacher', 'admin']}>
                      <ClassEvaluation />
                    </PrivateRoute>
                  } />
                  
                  {/* 课程管理路由 - 管理员和教师可访问 */}
                  <Route path="/course-management" element={
                    <PrivateRoute roles={['admin', 'teacher']}>
                      <CourseManagement />
                    </PrivateRoute>
                  } />
                  <Route path="/course/create" element={
                    <PrivateRoute roles={['admin', 'teacher']}>
                      <CourseForm />
                    </PrivateRoute>
                  } />
                  <Route path="/course/:id" element={
                    <PrivateRoute roles={['admin', 'teacher', 'student']}>
                      <CourseDetail />
                    </PrivateRoute>
                  } />
                  <Route path="/course/:id/edit" element={
                    <PrivateRoute roles={['admin', 'teacher']}>
                      <CourseForm />
                    </PrivateRoute>
                  } />
                  <Route path="/course/chapters/:courseId" element={
                    <PrivateRoute roles={['admin', 'teacher']}>
                      <CourseChapters />
                    </PrivateRoute>
                  } />
                  
                  {/* 学习材料路由 */}
                  <Route path="/material-management" element={
                    <PrivateRoute roles={['admin', 'teacher']}>
                      <MaterialManagement />
                    </PrivateRoute>
                  } />
                  <Route path="/material-search" element={
                    <PrivateRoute roles={['admin', 'teacher', 'student']}>
                      <MaterialSearch />
                    </PrivateRoute>
                  } />
                  <Route path="/material-upload" element={
                    <PrivateRoute roles={['admin', 'teacher']}>
                      <MaterialUpload />
                    </PrivateRoute>
                  } />
                  <Route path="/material-category" element={
                    <PrivateRoute roles={['admin']}>
                      <MaterialCategoryManagement />
                    </PrivateRoute>
                  } />
                  <Route path="/material/:id" element={
                    <PrivateRoute roles={['admin', 'teacher', 'student']}>
                      <MaterialDetail />
                    </PrivateRoute>
                  } />
                  
                  {/* 知识图谱路由 */}
                  <Route path="/knowledge-graph-view" element={
                    <PrivateRoute roles={['admin', 'teacher', 'student']}>
                      <KnowledgeGraphView />
                    </PrivateRoute>
                  } />
                  <Route path="/knowledge-graph-management" element={
                    <PrivateRoute roles={['admin', 'teacher']}>
                      <KnowledgeGraphManagement />
                    </PrivateRoute>
                  } />
                  <Route path="/knowledge-graph-test" element={
                    <PrivateRoute roles={['admin', 'teacher']}>
                      <KnowledgeGraphTest />
                    </PrivateRoute>
                  } />
                  
                  {/* 考试管理路由 */}
                  <Route path="/exam-management" element={
                    <PrivateRoute roles={['admin', 'teacher']}>
                      <ExamManagement />
                    </PrivateRoute>
                  } />
                  <Route path="/exam-center" element={
                    <PrivateRoute roles={['admin', 'teacher', 'student']}>
                      <ExamCenter />
                    </PrivateRoute>
                  } />
                  <Route path="/exam-review" element={
                    <PrivateRoute roles={['admin']}>
                      <ExamReview />
                    </PrivateRoute>
                  } />
                  <Route path="/exam-analytics" element={
                    <PrivateRoute roles={['admin', 'teacher']}>
                      <ExamAnalytics />
                    </PrivateRoute>
                  } />
                  
                  {/* 反馈管理路由 */}
                  <Route path="/feedback" element={
                    <PrivateRoute roles={['admin', 'teacher']}>
                      <FeedbackManagement />
                    </PrivateRoute>
                  } />
                  <Route path="/create-feedback" element={
                    <PrivateRoute roles={['admin', 'teacher', 'student']}>
                      <CreateFeedbackPage />
                    </PrivateRoute>
                  } />
                  <Route path="/feedback/:id" element={
                    <PrivateRoute roles={['admin', 'teacher', 'student']}>
                      <FeedbackDetailPage />
                    </PrivateRoute>
                  } />
                  
                  {/* 通知路由 */}
                  <Route path="/notifications" element={
                    <PrivateRoute roles={['admin', 'teacher', 'student']}>
                      <NotificationPage />
                    </PrivateRoute>
                  } />
                  <Route path="/notification-management" element={
                    <PrivateRoute roles={['admin', 'teacher']}>
                      <NotificationManagementPage />
                    </PrivateRoute>
                  } />
                  
                  {/* 用户个人资料 */}
                  <Route path="/profile" element={
                    <PrivateRoute roles={['admin', 'teacher', 'student']}>
                      <UserProfile />
                    </PrivateRoute>
                  } />
                  
                  {/* 系统诊断页面 */}
                  <Route path="/diagnostics" element={
                    <PrivateRoute roles={['admin']}>
                      <Diagnostics />
                    </PrivateRoute>
                  } />
                  
                  {/* 默认路由使用RoleBasedRedirect组件 */}
                  <Route index element={<RoleBasedRedirect />} />
                  
                  {/* 404页面 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Content>
            </Layout>
          </Layout>
        ) : (
          <Navigate to="/login" replace />
        )
      } />
      
      {/* 捕获所有其他路由并重定向到根路径 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes; 