import React from 'react';
import { Menu } from 'antd';
import { Link } from 'react-router-dom';
import {
  DashboardOutlined,
  BookOutlined,
  FileOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  MessageOutlined,
  BellOutlined,
  UserOutlined,
  FolderOutlined,
  LineChartOutlined,
  InteractionOutlined,
  TeamOutlined,
  FileSearchOutlined,
  ExperimentOutlined,
  CompassOutlined,
  RocketOutlined
} from '@ant-design/icons';

/**
 * 学生专用的菜单组件
 */
const StudentMenu: React.FC = () => {
  return (
    <Menu
      theme="dark"
      mode="inline"
      defaultSelectedKeys={['dashboard']}
      items={[
        {
          key: 'dashboard',
          icon: <DashboardOutlined />,
          label: <Link to="/student/dashboard">学习中心</Link>,
        },
        {
          key: 'courses',
          icon: <BookOutlined />,
          label: <Link to="/student/courses">我的课程</Link>,
        },
        // 学习资源模块
        {
          key: 'learning-resources',
          icon: <FolderOutlined />,
          label: '学习资源',
          children: [
            {
              key: 'material-search',
              icon: <FileSearchOutlined />,
              label: <Link to="/material-search">资源搜索</Link>,
            },
            {
              key: 'recommended-materials',
              icon: <FileOutlined />,
              label: <Link to="/recommended-materials">推荐资源</Link>,
            },
            {
              key: 'saved-materials',
              icon: <FileOutlined />,
              label: <Link to="/saved-materials">收藏资源</Link>,
            }
          ]
        },
        // 学习进度与分析
        {
          key: 'progress-analytics',
          icon: <LineChartOutlined />,
          label: '学习进度',
          children: [
            {
              key: 'learning-progress',
              icon: <TrophyOutlined />,
              label: <Link to="/student/progress">学习进度</Link>,
            },
            {
              key: 'performance-analytics',
              icon: <LineChartOutlined />,
              label: <Link to="/student/analytics">学习分析</Link>,
            },
            {
              key: 'learning-path',
              icon: <CompassOutlined />,
              label: <Link to="/student/learning-center">学习路径</Link>,
            }
          ]
        },
        // 互动学习体验
        {
          key: 'interactive-learning',
          icon: <InteractionOutlined />,
          label: '互动学习',
          children: [
            {
              key: 'knowledge-graph-view',
              icon: <CompassOutlined />,
              label: <Link to="/knowledge-graph-view">知识图谱</Link>,
            },
            {
              key: 'virtual-lab',
              icon: <ExperimentOutlined />,
              label: <Link to="/student/virtual-lab">虚拟实验</Link>,
            },
            {
              key: 'interactive-quizzes',
              icon: <RocketOutlined />,
              label: <Link to="/student/quizzes">互动测验</Link>,
            }
          ]
        },
        // 任务和考试
        {
          key: 'tasks',
          icon: <CheckCircleOutlined />,
          label: '学习任务',
          children: [
            {
              key: 'assignments',
              icon: <CheckCircleOutlined />,
              label: <Link to="/student/assignments">我的作业</Link>,
            },
            {
              key: 'exams',
              icon: <FileOutlined />,
              label: <Link to="/student-exams">我的考试</Link>,
            },
            {
              key: 'daily-challenges',
              icon: <RocketOutlined />,
              label: <Link to="/student/challenges">每日挑战</Link>,
            }
          ]
        },
        // 学习社区
        {
          key: 'learning-community',
          icon: <TeamOutlined />,
          label: '学习社区',
          children: [
            {
              key: 'study-groups',
              icon: <TeamOutlined />,
              label: <Link to="/student/study-groups">学习小组</Link>,
            },
            {
              key: 'discussion-forum',
              icon: <MessageOutlined />,
              label: <Link to="/student/forum">讨论区</Link>,
            },
            {
              key: 'create-feedback',
              icon: <MessageOutlined />,
              label: <Link to="/create-feedback">提交反馈</Link>,
            }
          ]
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

export default StudentMenu; 