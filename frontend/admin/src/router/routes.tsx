import MaterialUpload from '../pages/MaterialUpload';
import CourseManagement from '../pages/CourseManagement';
import CourseDetail from '../pages/CourseDetail';
import CourseForm from '../pages/CourseForm';
import CourseChapters from '../pages/CourseChapters';

// 课程和资源管理
{
  path: '/courses',
  element: <ProtectedRoute><MainLayout /></ProtectedRoute>,
  children: [
    { index: true, element: <CourseList /> },
    { path: 'create', element: <CourseEdit /> },
    { path: 'edit/:id', element: <CourseEdit /> },
    { path: ':id', element: <CourseDetail /> },
    { path: 'chapters/:courseId', element: <ChapterList /> },
    { path: 'materials', element: <MaterialUpload /> },
  ],
}, 

// 课程管理路由
{
  path: '/courses',
  component: CourseManagement,
  exact: true,
  title: '课程管理',
  permissions: ['admin', 'teacher', 'student'],
  icon: 'ReadOutlined',
},
{
  path: '/courses/create',
  component: CourseForm,
  exact: true,
  title: '创建课程',
  permissions: ['admin', 'teacher'],
  hideInMenu: true,
},
{
  path: '/courses/:id',
  component: CourseDetail,
  exact: true,
  title: '课程详情',
  permissions: ['admin', 'teacher', 'student'],
  hideInMenu: true,
},
{
  path: '/courses/:id/edit',
  component: CourseForm,
  exact: true,
  title: '编辑课程',
  permissions: ['admin', 'teacher'],
  hideInMenu: true,
},
{
  path: '/courses/:id/chapters',
  component: CourseChapters,
  exact: true,
  title: '课程章节管理',
  permissions: ['admin', 'teacher'],
  hideInMenu: true,
}, 