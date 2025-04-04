import React from 'react';
import { Menu } from 'antd';
import { Link } from 'react-router-dom';
import {
  DashboardOutlined,
  BookOutlined,
  TeamOutlined,
  SettingOutlined,
  UserOutlined,
  FolderOutlined,
  BarChartOutlined,
  InteractionOutlined,
  GlobalOutlined,
  FileTextOutlined,
  ExperimentOutlined
} from '@ant-design/icons';

/**
 * 管理员专用的菜单组件
 */
const AdminMenu: React.FC = () => {
  return (
    <Menu
      theme="dark"
      mode="inline"
      defaultSelectedKeys={['dashboard']}
      items={[
        {
          key: 'dashboard',
          icon: <DashboardOutlined />,
          label: <Link to="/dashboard">仪表盘</Link>,
        },
        {
          key: 'courses',
          icon: <BookOutlined />,
          label: '课程管理',
          children: [
            {
              key: 'course-management',
              label: <Link to="/course-management">课程列表</Link>,
            },
            {
              key: 'course-categories',
              label: <Link to="/course-categories">课程分类</Link>,
            },
          ],
        },
        {
          key: 'students',
          icon: <TeamOutlined />,
          label: <Link to="/admin/students">学生管理</Link>,
        },
        {
          key: 'teachers',
          icon: <TeamOutlined />,
          label: <Link to="/admin/teachers">教师管理</Link>,
        },
        {
          key: 'resource-library',
          icon: <FolderOutlined />,
          label: '教育资源库',
          children: [
            {
              key: 'material-management',
              label: <Link to="/material-management">资源管理</Link>
            },
            {
              key: 'material-upload',
              label: <Link to="/material-upload">资源上传</Link>
            },
            {
              key: 'material-category',
              label: <Link to="/material-category">分类管理</Link>
            },
            {
              key: 'material-search',
              label: <Link to="/material-search">资源搜索</Link>
            }
          ]
        },
        {
          key: 'analytics-center',
          icon: <BarChartOutlined />,
          label: '学习分析中心',
          children: [
            {
              key: 'student-performance',
              label: <Link to="/analytics/student-performance">学生表现</Link>
            },
            {
              key: 'course-analytics',
              label: <Link to="/analytics/course-analytics">课程分析</Link>
            },
            {
              key: 'learning-behavior',
              label: <Link to="/analytics/learning-behavior">学习行为</Link>
            },
            {
              key: 'exam-analytics',
              label: <Link to="/exam-analytics">考试分析</Link>
            }
          ]
        },
        {
          key: 'interactive-learning',
          icon: <InteractionOutlined />,
          label: '交互式学习',
          children: [
            {
              key: 'knowledge-graph',
              label: <Link to="/knowledge-graph-management">知识图谱</Link>
            },
            {
              key: 'simulation-labs',
              label: <Link to="/simulation-labs">模拟实验室</Link>
            },
            {
              key: 'virtual-classroom',
              label: <Link to="/virtual-classroom">虚拟课堂</Link>
            },
            {
              key: 'interactive-quizzes',
              label: <Link to="/interactive-quizzes">互动测验</Link>
            }
          ]
        },
        {
          key: 'research-community',
          icon: <GlobalOutlined />,
          label: '教研社区',
          children: [
            {
              key: 'research-groups',
              label: <Link to="/admin/teacher-groups">教研组</Link>
            },
            {
              key: 'academic-resources',
              label: <Link to="/academic-resources">学术资源</Link>
            },
            {
              key: 'teaching-methods',
              label: <Link to="/teaching-methods">教学方法</Link>
            },
            {
              key: 'peer-reviews',
              label: <Link to="/peer-reviews">同行评审</Link>
            }
          ]
        },
        {
          key: 'system-settings',
          icon: <SettingOutlined />,
          label: <Link to="/system-settings">系统设置</Link>,
        },
        {
          key: 'profile',
          icon: <UserOutlined />,
          label: <Link to="/profile">个人资料</Link>,
        },
      ]}
    />
  );
};

export default AdminMenu; 