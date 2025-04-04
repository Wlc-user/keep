import React from 'react';
import { Menu } from 'antd';
import { Link } from 'react-router-dom';
import {
  DashboardOutlined,
  BookOutlined,
  CheckCircleOutlined,
  FileOutlined,
  MessageOutlined,
  BellOutlined,
  UserOutlined,
  FolderOutlined,
  BarChartOutlined,
  InteractionOutlined,
  TeamOutlined,
  ExperimentOutlined,
  FileSearchOutlined
} from '@ant-design/icons';

/**
 * 教师专用的菜单组件
 */
const TeacherMenu: React.FC = () => {
  return (
    <Menu
      theme="dark"
      mode="inline"
      defaultSelectedKeys={['dashboard']}
      items={[
        {
          key: 'dashboard',
          icon: <DashboardOutlined />,
          label: <Link to="/teacher/dashboard">教师中心</Link>,
        },
        {
          key: 'courses',
          icon: <BookOutlined />,
          label: <Link to="/teacher/courses">我的课程</Link>,
        },
        {
          key: 'assignments',
          icon: <CheckCircleOutlined />,
          label: <Link to="/teacher/assignments">作业管理</Link>,
        },
        {
          key: 'resource-library',
          icon: <FolderOutlined />,
          label: '教学资源',
          children: [
            {
              key: 'material-search',
              icon: <FileSearchOutlined />,
              label: <Link to="/material-search">资源搜索</Link>,
            },
            {
              key: 'material-upload',
              icon: <FileOutlined />,
              label: <Link to="/material-upload">资源上传</Link>,
            },
            {
              key: 'my-materials',
              icon: <FileOutlined />,
              label: <Link to="/my-materials">我的资源</Link>,
            }
          ]
        },
        {
          key: 'analytics',
          icon: <BarChartOutlined />,
          label: '学生分析',
          children: [
            {
              key: 'class-evaluation',
              label: <Link to="/class-evaluation">班级评估</Link>,
            },
            {
              key: 'student-performance',
              label: <Link to="/analytics/student-performance">学生表现</Link>,
            },
            {
              key: 'exam-analytics',
              label: <Link to="/exam-analytics">考试分析</Link>,
            }
          ]
        },
        {
          key: 'interactive-teaching',
          icon: <InteractionOutlined />,
          label: '交互式教学',
          children: [
            {
              key: 'knowledge-graph',
              label: <Link to="/knowledge-graph-management">知识图谱</Link>,
            },
            {
              key: 'exam-creation',
              label: <Link to="/exam-creation">创建考试</Link>,
            },
            {
              key: 'virtual-classroom',
              label: <Link to="/virtual-classroom">在线教室</Link>,
            }
          ]
        },
        {
          key: 'research',
          icon: <TeamOutlined />,
          label: '教研活动',
          children: [
            {
              key: 'research-group',
              label: <Link to="/teacher/research-group">教研小组</Link>,
            },
            {
              key: 'teaching-methods',
              label: <Link to="/teaching-methods">教学方法</Link>,
            },
            {
              key: 'academic-exchange',
              label: <Link to="/academic-exchange">学术交流</Link>,
            }
          ]
        },
        {
          key: 'feedback',
          icon: <MessageOutlined />,
          label: <Link to="/feedback">学生反馈</Link>,
        },
        {
          key: 'notifications',
          icon: <BellOutlined />,
          label: <Link to="/notifications">消息中心</Link>,
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

export default TeacherMenu; 