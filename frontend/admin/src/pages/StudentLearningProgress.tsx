import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Progress, 
  Table, 
  Tag, 
  Statistic, 
  Select, 
  DatePicker, 
  Button, 
  Tooltip, 
  Tabs,
  List,
  Typography,
  Space,
  Empty,
  Divider,
  Badge,
  Timeline,
  Descriptions
} from 'antd';
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  BookOutlined, 
  TrophyOutlined,
  CalendarOutlined,
  BarChartOutlined,
  LineChartOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  QuestionCircleOutlined,
  RiseOutlined,
  StarOutlined,
  MessageOutlined
} from '@ant-design/icons';
import { Column, Pie, Line, Radar, Heatmap } from '@ant-design/charts';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

// 知识点类型
enum KnowledgeNodeType {
  CONCEPT = 'concept',
  PRINCIPLE = 'principle',
  FACT = 'fact',
  PROCEDURE = 'procedure',
  SKILL = 'skill'
}

// 知识点掌握程度
enum MasteryLevel {
  NOT_STARTED = 'not_started',
  INTRODUCED = 'introduced',
  PRACTICING = 'practicing',
  MASTERED = 'mastered'
}

// 知识点接口
interface KnowledgeNode {
  id: string;
  title: string;
  type: KnowledgeNodeType;
  courseId: string;
  dependsOn: string[]; // 依赖的其他知识点ID
  mastery: MasteryLevel;
  lastPracticed?: string;
  confidence: number; // 0-100
}

// 学习路径推荐
interface LearningPathRecommendation {
  id: string;
  title: string;
  description: string;
  targetSkill: string;
  estimatedTimeToComplete: number; // 分钟
  priority: 'low' | 'medium' | 'high';
  relevance: number; // 0-100，表示与学生目标的相关性
  steps: {
    id: string;
    type: 'video' | 'reading' | 'practice' | 'quiz' | 'project';
    title: string;
    description: string;
    estimatedTime: number;
    resourceUrl?: string;
    knowledgeNodeIds: string[]; // 关联的知识点
  }[];
  benefits: string[];
}

// 学习成就
interface LearningAchievement {
  id: string;
  title: string;
  description: string;
  earnedDate?: string;
  progress: number; // 0-100
  iconName: string;
  type: 'course' | 'skill' | 'activity' | 'streak' | 'milestone';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic';
}

// 学习热图数据
interface LearningHeatmapData {
  date: string;
  count: number;
  intensity: 'low' | 'medium' | 'high' | 'very-high';
}

// 模拟数据接口
interface Course {
  id: string;
  title: string;
  totalChapters: number;
  completedChapters: number;
  totalAssignments: number;
  completedAssignments: number;
  totalQuizzes: number;
  completedQuizzes: number;
  totalVideos: number;
  watchedVideos: number;
  totalReadings: number;
  completedReadings: number;
  totalTimeSpent: number; // 分钟
  lastAccessDate: string;
  grade: number;
  status: 'not_started' | 'in_progress' | 'completed';
}

interface LearningActivity {
  id: string;
  date: string;
  courseId: string;
  courseTitle: string;
  activityType: 'video' | 'reading' | 'quiz' | 'assignment' | 'discussion';
  title: string;
  timeSpent: number; // 分钟
  completed: boolean;
  score?: number;
}

interface WeeklyProgress {
  week: string;
  timeSpent: number;
  activitiesCompleted: number;
}

interface SkillProgress {
  skill: string;
  level: number;
  progress: number;
}

// 模拟数据
const mockCourses: Course[] = [
  {
    id: '1',
    title: '数据结构与算法',
    totalChapters: 12,
    completedChapters: 8,
    totalAssignments: 6,
    completedAssignments: 4,
    totalQuizzes: 12,
    completedQuizzes: 10,
    totalVideos: 24,
    watchedVideos: 20,
    totalReadings: 18,
    completedReadings: 15,
    totalTimeSpent: 1840,
    lastAccessDate: '2023-04-10',
    grade: 88,
    status: 'in_progress'
  },
  {
    id: '2',
    title: '机器学习基础',
    totalChapters: 10,
    completedChapters: 10,
    totalAssignments: 5,
    completedAssignments: 5,
    totalQuizzes: 10,
    completedQuizzes: 10,
    totalVideos: 20,
    watchedVideos: 20,
    totalReadings: 15,
    completedReadings: 15,
    totalTimeSpent: 2100,
    lastAccessDate: '2023-04-08',
    grade: 95,
    status: 'completed'
  },
  {
    id: '3',
    title: '网络安全入门',
    totalChapters: 8,
    completedChapters: 3,
    totalAssignments: 4,
    completedAssignments: 1,
    totalQuizzes: 8,
    completedQuizzes: 3,
    totalVideos: 16,
    watchedVideos: 7,
    totalReadings: 12,
    completedReadings: 5,
    totalTimeSpent: 720,
    lastAccessDate: '2023-04-12',
    grade: 75,
    status: 'in_progress'
  },
  {
    id: '4',
    title: '前端开发实践',
    totalChapters: 15,
    completedChapters: 0,
    totalAssignments: 8,
    completedAssignments: 0,
    totalQuizzes: 15,
    completedQuizzes: 0,
    totalVideos: 30,
    watchedVideos: 0,
    totalReadings: 20,
    completedReadings: 0,
    totalTimeSpent: 0,
    lastAccessDate: '',
    grade: 0,
    status: 'not_started'
  },
  {
    id: '5',
    title: '数据库系统概论',
    totalChapters: 10,
    completedChapters: 6,
    totalAssignments: 5,
    completedAssignments: 3,
    totalQuizzes: 10,
    completedQuizzes: 6,
    totalVideos: 20,
    watchedVideos: 12,
    totalReadings: 15,
    completedReadings: 9,
    totalTimeSpent: 1200,
    lastAccessDate: '2023-04-11',
    grade: 82,
    status: 'in_progress'
  }
];

const mockActivities: LearningActivity[] = [
  {
    id: '1',
    date: '2023-04-12',
    courseId: '1',
    courseTitle: '数据结构与算法',
    activityType: 'video',
    title: '平衡二叉树介绍',
    timeSpent: 45,
    completed: true
  },
  {
    id: '2',
    date: '2023-04-12',
    courseId: '1',
    courseTitle: '数据结构与算法',
    activityType: 'quiz',
    title: '树结构测验',
    timeSpent: 30,
    completed: true,
    score: 85
  },
  {
    id: '3',
    date: '2023-04-11',
    courseId: '3',
    courseTitle: '网络安全入门',
    activityType: 'reading',
    title: '密码学基础',
    timeSpent: 60,
    completed: true
  },
  {
    id: '4',
    date: '2023-04-11',
    courseId: '5',
    courseTitle: '数据库系统概论',
    activityType: 'assignment',
    title: 'SQL查询优化',
    timeSpent: 120,
    completed: false
  },
  {
    id: '5',
    date: '2023-04-10',
    courseId: '1',
    courseTitle: '数据结构与算法',
    activityType: 'discussion',
    title: '算法复杂度分析讨论',
    timeSpent: 45,
    completed: true
  },
  {
    id: '6',
    date: '2023-04-10',
    courseId: '2',
    courseTitle: '机器学习基础',
    activityType: 'video',
    title: '神经网络架构',
    timeSpent: 50,
    completed: true
  },
  {
    id: '7',
    date: '2023-04-09',
    courseId: '2',
    courseTitle: '机器学习基础',
    activityType: 'assignment',
    title: '实现简单神经网络',
    timeSpent: 180,
    completed: true,
    score: 92
  },
  {
    id: '8',
    date: '2023-04-08',
    courseId: '5',
    courseTitle: '数据库系统概论',
    activityType: 'quiz',
    title: '事务管理测验',
    timeSpent: 25,
    completed: true,
    score: 78
  }
];

const mockWeeklyProgress: WeeklyProgress[] = [
  { week: '第1周', timeSpent: 420, activitiesCompleted: 8 },
  { week: '第2周', timeSpent: 380, activitiesCompleted: 7 },
  { week: '第3周', timeSpent: 450, activitiesCompleted: 9 },
  { week: '第4周', timeSpent: 320, activitiesCompleted: 6 },
  { week: '第5周', timeSpent: 500, activitiesCompleted: 10 },
  { week: '第6周', timeSpent: 380, activitiesCompleted: 7 },
  { week: '第7周', timeSpent: 420, activitiesCompleted: 8 },
  { week: '第8周', timeSpent: 480, activitiesCompleted: 9 }
];

const mockSkills: SkillProgress[] = [
  { skill: '算法分析', level: 3, progress: 75 },
  { skill: '数据结构', level: 4, progress: 85 },
  { skill: '机器学习', level: 3, progress: 70 },
  { skill: '数据库设计', level: 2, progress: 45 },
  { skill: '网络安全', level: 1, progress: 25 },
  { skill: '前端开发', level: 0, progress: 0 }
];

// 模拟知识点数据
const mockKnowledgeNodes: KnowledgeNode[] = [
  {
    id: 'k1',
    title: '数组基础',
    type: KnowledgeNodeType.CONCEPT,
    courseId: '1',
    dependsOn: [],
    mastery: MasteryLevel.MASTERED,
    lastPracticed: '2023-04-10',
    confidence: 95
  },
  {
    id: 'k2',
    title: '链表结构',
    type: KnowledgeNodeType.CONCEPT,
    courseId: '1',
    dependsOn: ['k1'],
    mastery: MasteryLevel.MASTERED,
    lastPracticed: '2023-04-08',
    confidence: 90
  },
  {
    id: 'k3',
    title: '二叉树',
    type: KnowledgeNodeType.CONCEPT,
    courseId: '1',
    dependsOn: ['k2'],
    mastery: MasteryLevel.PRACTICING,
    lastPracticed: '2023-04-12',
    confidence: 75
  },
  {
    id: 'k4',
    title: '图算法',
    type: KnowledgeNodeType.PRINCIPLE,
    courseId: '1',
    dependsOn: ['k3'],
    mastery: MasteryLevel.INTRODUCED,
    lastPracticed: '2023-04-05',
    confidence: 40
  },
  {
    id: 'k5',
    title: '动态规划',
    type: KnowledgeNodeType.PRINCIPLE,
    courseId: '1',
    dependsOn: ['k1', 'k3'],
    mastery: MasteryLevel.NOT_STARTED,
    confidence: 0
  },
  {
    id: 'k6',
    title: '机器学习模型',
    type: KnowledgeNodeType.CONCEPT,
    courseId: '2',
    dependsOn: [],
    mastery: MasteryLevel.MASTERED,
    lastPracticed: '2023-04-07',
    confidence: 92
  }
];

// 模拟学习路径推荐
const mockLearningRecommendations: LearningPathRecommendation[] = [
  {
    id: 'rec1',
    title: '掌握高级数据结构',
    description: '深入学习平衡树和高级图算法，提升解决复杂问题的能力',
    targetSkill: '算法设计',
    estimatedTimeToComplete: 840, // 14小时
    priority: 'high',
    relevance: 95,
    steps: [
      {
        id: 'step1',
        type: 'video',
        title: '红黑树详解',
        description: '学习红黑树的原理和实现',
        estimatedTime: 60,
        resourceUrl: '/courses/1/videos/15',
        knowledgeNodeIds: ['k3', 'k4']
      },
      {
        id: 'step2',
        type: 'practice',
        title: '红黑树操作练习',
        description: '完成10个红黑树相关的编程练习',
        estimatedTime: 120,
        knowledgeNodeIds: ['k3', 'k4']
      },
      {
        id: 'step3',
        type: 'reading',
        title: '高级图算法',
        description: '学习最短路径、最小生成树等经典图算法',
        estimatedTime: 90,
        resourceUrl: '/courses/1/readings/12',
        knowledgeNodeIds: ['k4']
      },
      {
        id: 'step4',
        type: 'quiz',
        title: '图算法测验',
        description: '完成图算法相关测验，巩固所学知识',
        estimatedTime: 60,
        knowledgeNodeIds: ['k4']
      }
    ],
    benefits: [
      '提高复杂问题求解能力',
      '为高级算法课程打下基础',
      '提升竞争性编程技能'
    ]
  },
  {
    id: 'rec2',
    title: '动态规划入门',
    description: '学习动态规划的基本概念和应用场景',
    targetSkill: '算法优化',
    estimatedTimeToComplete: 420, // 7小时
    priority: 'medium',
    relevance: 85,
    steps: [
      {
        id: 'step1',
        type: 'video',
        title: '动态规划基础',
        description: '了解动态规划的核心概念和基本结构',
        estimatedTime: 45,
        resourceUrl: '/courses/1/videos/20',
        knowledgeNodeIds: ['k5']
      },
      {
        id: 'step2',
        type: 'reading',
        title: '经典动态规划问题',
        description: '学习背包问题、最长公共子序列等经典案例',
        estimatedTime: 60,
        resourceUrl: '/courses/1/readings/18',
        knowledgeNodeIds: ['k5']
      },
      {
        id: 'step3',
        type: 'practice',
        title: '简单动态规划练习',
        description: '完成5个入门级动态规划练习题',
        estimatedTime: 120,
        knowledgeNodeIds: ['k5']
      }
    ],
    benefits: [
      '掌握一种强大的算法设计技术',
      '解决更多类型的高级问题',
      '提高代码优化能力'
    ]
  }
];

// 模拟学习成就
const mockAchievements: LearningAchievement[] = [
  {
    id: 'ach1',
    title: '算法入门者',
    description: '完成数据结构与算法课程的前3章',
    earnedDate: '2023-03-15',
    progress: 100,
    iconName: 'algorithm-badge',
    type: 'course',
    rarity: 'common'
  },
  {
    id: 'ach2',
    title: '勤奋学习者',
    description: '连续14天登录学习',
    earnedDate: '2023-04-02',
    progress: 100,
    iconName: 'streak-badge',
    type: 'streak',
    rarity: 'uncommon'
  },
  {
    id: 'ach3',
    title: '数据结构大师',
    description: '在所有数据结构测验中获得90%以上的分数',
    progress: 75,
    iconName: 'master-badge',
    type: 'skill',
    rarity: 'rare'
  },
  {
    id: 'ach4',
    title: '知识探索者',
    description: '完成100小时的学习',
    progress: 68,
    iconName: 'explorer-badge',
    type: 'milestone',
    rarity: 'epic'
  }
];

// 模拟学习热图数据
const mockHeatmapData: LearningHeatmapData[] = [
  { date: '2023-04-01', count: 45, intensity: 'low' },
  { date: '2023-04-02', count: 120, intensity: 'medium' },
  { date: '2023-04-03', count: 90, intensity: 'medium' },
  { date: '2023-04-04', count: 0, intensity: 'low' },
  { date: '2023-04-05', count: 30, intensity: 'low' },
  { date: '2023-04-06', count: 60, intensity: 'low' },
  { date: '2023-04-07', count: 180, intensity: 'high' },
  { date: '2023-04-08', count: 240, intensity: 'very-high' },
  { date: '2023-04-09', count: 45, intensity: 'low' },
  { date: '2023-04-10', count: 150, intensity: 'high' },
  { date: '2023-04-11', count: 120, intensity: 'medium' },
  { date: '2023-04-12', count: 75, intensity: 'medium' },
  { date: '2023-04-13', count: 0, intensity: 'low' },
  { date: '2023-04-14', count: 60, intensity: 'low' }
];

const StudentLearningProgress: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [activities, setActivities] = useState<LearningActivity[]>(mockActivities);
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress[]>(mockWeeklyProgress);
  const [skills, setSkills] = useState<SkillProgress[]>(mockSkills);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<any>(null);
  const [activeTabKey, setActiveTabKey] = useState<string>('overview');
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('chart');
  const [loading, setLoading] = useState<boolean>(false);
  const [skillView, setSkillView] = useState<'table' | 'radar'>('radar');
  const [knowledgeMap, setKnowledgeMap] = useState<boolean>(true);
  const [selectedKnowledgeNode, setSelectedKnowledgeNode] = useState<string | null>(null);

  // 计算总体学习进度
  const calculateOverallProgress = () => {
    const totalChapters = courses.reduce((sum, course) => sum + course.totalChapters, 0);
    const completedChapters = courses.reduce((sum, course) => sum + course.completedChapters, 0);
    
    return totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;
  };

  // 计算总学习时间（小时）
  const calculateTotalTimeSpent = () => {
    const totalMinutes = courses.reduce((sum, course) => sum + course.totalTimeSpent, 0);
    return (totalMinutes / 60).toFixed(1);
  };

  // 计算已完成课程数
  const calculateCompletedCourses = () => {
    return courses.filter(course => course.status === 'completed').length;
  };

  // 计算平均成绩
  const calculateAverageGrade = () => {
    const coursesWithGrades = courses.filter(course => course.grade > 0);
    if (coursesWithGrades.length === 0) return 0;
    
    const totalGrade = coursesWithGrades.reduce((sum, course) => sum + course.grade, 0);
    return Math.round(totalGrade / coursesWithGrades.length);
  };

  // 过滤活动记录
  const getFilteredActivities = () => {
    let filtered = [...activities];
    
    // 按课程过滤
    if (selectedCourse !== 'all') {
      filtered = filtered.filter(activity => activity.courseId === selectedCourse);
    }
    
    // 按日期范围过滤
    if (selectedDate && selectedDate[0] && selectedDate[1]) {
      const startDate = selectedDate[0].toISOString().split('T')[0];
      const endDate = selectedDate[1].toISOString().split('T')[0];
      
      filtered = filtered.filter(activity => 
        activity.date >= startDate && activity.date <= endDate
      );
    }
    
    return filtered;
  };

  // 计算课程完成度
  const calculateCourseCompletion = (course: Course) => {
    const totalItems = course.totalChapters + course.totalAssignments + 
                      course.totalQuizzes + course.totalVideos + course.totalReadings;
    
    const completedItems = course.completedChapters + course.completedAssignments + 
                          course.completedQuizzes + course.watchedVideos + course.completedReadings;
    
    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  };

  // 表格列定义
  const courseColumns = [
    {
      title: '课程名称',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Course) => (
        <Space>
          <Text strong>{text}</Text>
          {record.status === 'completed' && <Tag color="success">已完成</Tag>}
        </Space>
      )
    },
    {
      title: '完成度',
      dataIndex: 'completion',
      key: 'completion',
      render: (_: any, record: Course) => {
        const completion = calculateCourseCompletion(record);
        let color = 'blue';
        if (completion >= 80) color = 'green';
        else if (completion >= 50) color = 'cyan';
        else if (completion > 0) color = 'orange';
        else color = 'gray';
        
        return <Progress percent={completion} size="small" strokeColor={color} />;
      },
      sorter: (a: Course, b: Course) => calculateCourseCompletion(a) - calculateCourseCompletion(b)
    },
    {
      title: '学习时间',
      dataIndex: 'totalTimeSpent',
      key: 'totalTimeSpent',
      render: (time: number) => `${(time / 60).toFixed(1)} 小时`,
      sorter: (a: Course, b: Course) => a.totalTimeSpent - b.totalTimeSpent
    },
    {
      title: '成绩',
      dataIndex: 'grade',
      key: 'grade',
      render: (grade: number) => {
        if (grade === 0) return <Text type="secondary">暂无</Text>;
        
        let color = 'green';
        if (grade < 60) color = 'red';
        else if (grade < 80) color = 'orange';
        
        return <Text style={{ color }}>{grade}</Text>;
      },
      sorter: (a: Course, b: Course) => a.grade - b.grade
    },
    {
      title: '最近访问',
      dataIndex: 'lastAccessDate',
      key: 'lastAccessDate',
      render: (date: string) => date ? date : <Text type="secondary">未开始</Text>,
      sorter: (a: Course, b: Course) => {
        if (!a.lastAccessDate) return 1;
        if (!b.lastAccessDate) return -1;
        return a.lastAccessDate.localeCompare(b.lastAccessDate);
      }
    },
    {
      title: '详情',
      key: 'action',
      render: (_: any, record: Course) => (
        <Button type="link" size="small">查看详情</Button>
      )
    }
  ];

  // 活动记录列定义
  const activityColumns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date'
    },
    {
      title: '课程',
      dataIndex: 'courseTitle',
      key: 'courseTitle'
    },
    {
      title: '活动类型',
      dataIndex: 'activityType',
      key: 'activityType',
      render: (type: string) => {
        const typeMap: Record<string, { color: string, icon: React.ReactNode, text: string }> = {
          video: { color: 'blue', icon: <PlayCircleOutlined />, text: '视频' },
          reading: { color: 'green', icon: <FileTextOutlined />, text: '阅读' },
          quiz: { color: 'orange', icon: <QuestionCircleOutlined />, text: '测验' },
          assignment: { color: 'purple', icon: <BookOutlined />, text: '作业' },
          discussion: { color: 'cyan', icon: <MessageOutlined />, text: '讨论' }
        };
        
        const { color, icon, text } = typeMap[type] || { color: 'default', icon: null, text: type };
        
        return (
          <Tag color={color} icon={icon}>
            {text}
          </Tag>
        );
      }
    },
    {
      title: '活动名称',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: '用时',
      dataIndex: 'timeSpent',
      key: 'timeSpent',
      render: (time: number) => `${time} 分钟`
    },
    {
      title: '状态',
      dataIndex: 'completed',
      key: 'completed',
      render: (completed: boolean, record: LearningActivity) => {
        if (completed) {
          if (record.score !== undefined) {
            return <Tag color="success" icon={<CheckCircleOutlined />}>已完成 (得分: {record.score})</Tag>;
          }
          return <Tag color="success" icon={<CheckCircleOutlined />}>已完成</Tag>;
        }
        return <Tag color="warning" icon={<ClockCircleOutlined />}>进行中</Tag>;
      }
    }
  ];

  // 渲染活动完成图表
  const renderActivitiesChart = () => {
    const data = weeklyProgress.map(item => ({
      week: item.week,
      value: item.activitiesCompleted,
      type: '已完成活动'
    }));

    const config = {
      data,
      xField: 'week',
      yField: 'value',
      seriesField: 'type',
      color: '#52c41a',
      label: {
        position: 'middle',
        style: {
          fill: '#FFFFFF',
          opacity: 0.6,
        },
      },
      meta: {
        value: {
          alias: '完成活动数',
        },
      },
      tooltip: {
        formatter: (datum) => {
          return { name: '完成活动数', value: datum.value };
        },
      },
    };

    return <Column {...config} />;
  };

  // 渲染时间线图表
  const renderTimeSpentChart = () => {
    const data = weeklyProgress.map(item => ({
      week: item.week,
      value: item.timeSpent,
    }));

    const config = {
      data,
      xField: 'week',
      yField: 'value',
      point: {
        size: 5,
        shape: 'diamond',
      },
      label: {
        style: {
          fill: '#aaa',
        },
      },
      color: '#1890ff',
      tooltip: {
        formatter: (datum) => {
          return { name: '学习时间(分钟)', value: datum.value };
        },
      },
    };

    return <Line {...config} />;
  };

  // 渲染饼图
  const renderPieChart = () => {
    const data = courseDistributionData.map(item => ({
      type: item.type,
      value: item.value,
    }));

    const config = {
      appendPadding: 10,
      data,
      angleField: 'value',
      colorField: 'type',
      radius: 0.8,
      label: {
        type: 'outer',
        content: '{name} {percentage}',
      },
      interactions: [
        {
          type: 'pie-legend-active',
        },
        {
          type: 'element-active',
        },
      ],
      tooltip: {
        formatter: (datum) => {
          return { name: datum.type, value: `${datum.value} 分钟` };
        },
      },
    };

    return <Pie {...config} />;
  };

  const courseDistributionData = courses.map(course => ({
    type: course.title,
    value: course.totalTimeSpent
  }));

  // 渲染知识图谱
  const renderKnowledgeMap = () => {
    const mastered = mockKnowledgeNodes.filter(node => node.mastery === MasteryLevel.MASTERED);
    const practicing = mockKnowledgeNodes.filter(node => node.mastery === MasteryLevel.PRACTICING);
    const introduced = mockKnowledgeNodes.filter(node => node.mastery === MasteryLevel.INTRODUCED);
    const notStarted = mockKnowledgeNodes.filter(node => node.mastery === MasteryLevel.NOT_STARTED);
    
    const getMasteryColor = (mastery: MasteryLevel) => {
      switch (mastery) {
        case MasteryLevel.MASTERED:
          return '#52c41a';
        case MasteryLevel.PRACTICING:
          return '#1890ff';
        case MasteryLevel.INTRODUCED:
          return '#faad14';
        case MasteryLevel.NOT_STARTED:
          return '#bfbfbf';
        default:
          return '#bfbfbf';
      }
    };

  return (
      <div className="knowledge-map-container">
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title="知识掌握情况" extra={
              <Space>
                <Select
                  value={selectedCourse}
                  onChange={setSelectedCourse}
                  style={{ width: 180 }}
                >
                  <Option value="all">所有课程</Option>
                  {mockCourses.map(course => (
                    <Option key={course.id} value={course.id}>{course.title}</Option>
                  ))}
                </Select>
                <Button 
                  icon={<QuestionCircleOutlined />}
                  type="text"
                >
                  帮助
                </Button>
              </Space>
            }>
              <Row gutter={[16, 16]}>
                <Col span={16}>
                  <div className="knowledge-nodes-container" style={{ height: 400, border: '1px solid #f0f0f0', borderRadius: 4, padding: 16, position: 'relative' }}>
                    {/* 这里应该使用专业的图谱可视化组件，这里简化处理 */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                      {mockKnowledgeNodes
                        .filter(node => selectedCourse === 'all' || node.courseId === selectedCourse)
                        .map(node => (
                          <div 
                            key={node.id}
                            onClick={() => setSelectedKnowledgeNode(node.id)}
                            style={{ 
                              padding: '12px 16px',
                              border: `2px solid ${getMasteryColor(node.mastery)}`,
                              borderRadius: 4,
                              background: selectedKnowledgeNode === node.id ? '#f6f6f6' : 'white',
                              cursor: 'pointer',
                              position: 'relative',
                              minWidth: 120,
                              boxShadow: selectedKnowledgeNode === node.id ? '0 0 8px rgba(0,0,0,0.1)' : 'none'
                            }}
                          >
                            <div style={{ fontWeight: 'bold' }}>{node.title}</div>
                            <div style={{ marginTop: 4, fontSize: 12, color: '#666' }}>{node.type}</div>
                            <div style={{ 
                              position: 'absolute', 
                              top: -8, 
                              right: -8, 
                              width: 16, 
                              height: 16, 
                              borderRadius: '50%', 
                              background: getMasteryColor(node.mastery) 
                            }} />
                          </div>
                        ))}
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <Card title="知识点详情" size="small" bordered={false} style={{ height: '100%' }}>
                    {selectedKnowledgeNode ? (
                      (() => {
                        const node = mockKnowledgeNodes.find(n => n.id === selectedKnowledgeNode);
                        if (!node) return <Empty description="未选择知识点" />;
                        
                        return (
                          <>
                            <Descriptions column={1} size="small">
                              <Descriptions.Item label="名称">{node.title}</Descriptions.Item>
                              <Descriptions.Item label="类型">{node.type}</Descriptions.Item>
                              <Descriptions.Item label="掌握程度">
                                <Tag color={getMasteryColor(node.mastery)}>
                                  {node.mastery === MasteryLevel.MASTERED ? '已掌握' : 
                                   node.mastery === MasteryLevel.PRACTICING ? '练习中' : 
                                   node.mastery === MasteryLevel.INTRODUCED ? '已了解' : '未开始'}
                                </Tag>
                              </Descriptions.Item>
                              <Descriptions.Item label="信心指数">
                                <Progress 
                                  percent={node.confidence} 
                                  size="small" 
                                  status={
                                    node.confidence >= 80 ? 'success' : 
                                    node.confidence >= 40 ? 'active' : 'exception'
                                  }
                                />
                              </Descriptions.Item>
                              {node.lastPracticed && (
                                <Descriptions.Item label="最近练习时间">{node.lastPracticed}</Descriptions.Item>
                              )}
                            </Descriptions>
                            
                            <Divider style={{ margin: '12px 0' }} />
                            
                            <Title level={5}>学习建议</Title>
                            {node.mastery === MasteryLevel.MASTERED ? (
                              <Text type="success">恭喜！你已经掌握了这个知识点。</Text>
                            ) : (
                              <ul style={{ paddingLeft: 16, marginTop: 8 }}>
                                {node.mastery === MasteryLevel.NOT_STARTED && (
                                  <li><Text>开始学习这个知识点的基础内容</Text></li>
                                )}
                                {node.mastery === MasteryLevel.INTRODUCED && (
                                  <>
                                    <li><Text>通过练习巩固基础概念</Text></li>
                                    <li><Text>完成相关的编程练习</Text></li>
                                  </>
                                )}
                                {node.mastery === MasteryLevel.PRACTICING && (
                                  <>
                                    <li><Text>解决更多相关问题以提高熟练度</Text></li>
                                    <li><Text>进行测验检验掌握程度</Text></li>
                                  </>
                                )}
                              </ul>
                            )}
                          </>
                        );
                      })()
                    ) : (
                      <Empty description="请选择一个知识点查看详情" />
                    )}
                  </Card>
                </Col>
              </Row>
              
              <Row style={{ marginTop: 16 }}>
                <Col span={24}>
                  <Space>
                    <Statistic 
                      title="已掌握"
                      value={mastered.length}
                      suffix={`/ ${mockKnowledgeNodes.length}`}
                      valueStyle={{ color: '#52c41a' }}
                    />
                    <Statistic 
                      title="练习中"
                      value={practicing.length}
                      suffix={`/ ${mockKnowledgeNodes.length}`}
                      valueStyle={{ color: '#1890ff' }}
                    />
                    <Statistic 
                      title="已了解"
                      value={introduced.length}
                      suffix={`/ ${mockKnowledgeNodes.length}`}
                      valueStyle={{ color: '#faad14' }}
                    />
                    <Statistic 
                      title="未开始"
                      value={notStarted.length}
                      suffix={`/ ${mockKnowledgeNodes.length}`}
                      valueStyle={{ color: '#bfbfbf' }}
                    />
                  </Space>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };
  
  // 渲染学习热图
  const renderLearningHeatmap = () => {
    const getColorByIntensity = (intensity: string) => {
      switch (intensity) {
        case 'low':
          return '#ebedf0';
        case 'medium':
          return '#9be9a8';
        case 'high':
          return '#40c463';
        case 'very-high':
          return '#216e39';
        default:
          return '#ebedf0';
      }
    };
    
    const config = {
      data: mockHeatmapData,
      xField: 'date',
      yField: 'intensity',
      colorField: 'count',
      color: ({ count }: any) => {
        if (count === 0) return '#ebedf0';
        if (count < 60) return '#9be9a8';
        if (count < 120) return '#40c463';
        return '#216e39';
      },
      meta: {
        date: {
          type: 'cat',
        },
      },
      tooltip: {
        title: 'date',
        formatter: (datum: any) => {
          return { name: '学习时长', value: `${datum.count} 分钟` };
        },
      },
    };
    
    return (
      <Card title="学习热度地图" style={{ marginTop: 16 }}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <div style={{ padding: '8px 0', textAlign: 'center', marginBottom: 16 }}>
              <Text>每日学习时长热度图，越深表示学习时间越长</Text>
            </div>
            {/* 用于简化，实际上应使用Heatmap组件 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center', paddingBottom: 16 }}>
              {mockHeatmapData.map((day, index) => (
                <Tooltip key={index} title={`${day.date}: ${day.count}分钟`}>
                  <div 
                    style={{ 
                      width: 24, 
                      height: 24, 
                      backgroundColor: getColorByIntensity(day.intensity),
                      borderRadius: 4
                    }} 
                  />
                </Tooltip>
              ))}
            </div>
          </Col>
        </Row>
        
        <Row>
          <Col span={24}>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
              <Space>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: 16, height: 16, backgroundColor: '#ebedf0', marginRight: 8, borderRadius: 2 }} />
                  <Text>无学习</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: 16, height: 16, backgroundColor: '#9be9a8', marginRight: 8, borderRadius: 2 }} />
                  <Text>&lt; 60分钟</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: 16, height: 16, backgroundColor: '#40c463', marginRight: 8, borderRadius: 2 }} />
                  <Text>60-120分钟</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: 16, height: 16, backgroundColor: '#216e39', marginRight: 8, borderRadius: 2 }} />
                  <Text>&gt; 120分钟</Text>
                </div>
              </Space>
            </div>
          </Col>
        </Row>
      </Card>
    );
  };
  
  // 渲染学习路径推荐
  const renderLearningPathRecommendations = () => {
    return (
      <Card title="个性化学习路径推荐" style={{ marginTop: 16 }}>
        <List
          itemLayout="vertical"
          dataSource={mockLearningRecommendations}
          renderItem={recommendation => (
            <List.Item
              key={recommendation.id}
              actions={[
                <Button type="primary">开始学习</Button>,
                <Button>添加到计划</Button>,
                <Button type="link">查看详情</Button>
              ]}
              extra={
                <div style={{ textAlign: 'right' }}>
                  <div>
                    <Tag color={
                      recommendation.priority === 'high' ? 'red' : 
                      recommendation.priority === 'medium' ? 'orange' : 'blue'
                    }>
                      {recommendation.priority === 'high' ? '高优先级' : 
                       recommendation.priority === 'medium' ? '中优先级' : '低优先级'}
                    </Tag>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Text>预计完成时间: {Math.floor(recommendation.estimatedTimeToComplete / 60)}小时{recommendation.estimatedTimeToComplete % 60}分钟</Text>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Text>相关性: </Text>
                    <Progress percent={recommendation.relevance} size="small" />
                  </div>
                </div>
              }
            >
              <List.Item.Meta
                title={<>{recommendation.title}</>}
                description={recommendation.description}
              />
              <div>
                <Title level={5} style={{ marginTop: 8 }}>学习步骤</Title>
                <Timeline>
                  {recommendation.steps.map(step => (
                    <Timeline.Item key={step.id}>
                      <Text strong>{step.title}</Text>
                      <br />
                      <Text type="secondary">{step.description}</Text>
                      <br />
                      <Text type="secondary">预计时间: {step.estimatedTime}分钟</Text>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </div>
              <div>
                <Title level={5}>预期收益</Title>
                <ul>
                  {recommendation.benefits.map((benefit, index) => (
                    <li key={index}><Text>{benefit}</Text></li>
                  ))}
                </ul>
              </div>
            </List.Item>
          )}
        />
      </Card>
    );
  };
  
  // 渲染学习成就
  const renderAchievements = () => {
    const getRarityColor = (rarity: string) => {
      switch (rarity) {
        case 'common':
          return '#bfbfbf';
        case 'uncommon':
          return '#52c41a';
        case 'rare':
          return '#1890ff';
        case 'epic':
          return '#722ed1';
        default:
          return '#bfbfbf';
      }
    };
    
    return (
      <Card title="学习成就" style={{ marginTop: 16 }}>
        <Row gutter={[16, 16]}>
          {mockAchievements.map(achievement => (
            <Col key={achievement.id} span={6}>
              <Card
                hoverable
                style={{ 
                  textAlign: 'center',
                  borderColor: achievement.progress === 100 ? getRarityColor(achievement.rarity) : '#f0f0f0'
                }}
              >
                <div>
                  {/* 在实际实现中，这里应该是真实的图标 */}
                  <div style={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: '50%', 
                    background: getRarityColor(achievement.rarity),
                    margin: '0 auto 16px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'white',
                    fontSize: 24
                  }}>
                    <TrophyOutlined />
                  </div>
                  <Title level={5}>{achievement.title}</Title>
                  <Paragraph type="secondary" ellipsis={{ rows: 2 }}>{achievement.description}</Paragraph>
                  {achievement.earnedDate ? (
                    <Tag color="success">已获得 {achievement.earnedDate}</Tag>
                  ) : (
                    <Progress percent={achievement.progress} size="small" />
                  )}
                  <div style={{ marginTop: 8 }}>
                    <Tag color={getRarityColor(achievement.rarity)}>
                      {achievement.rarity === 'common' ? '普通' : 
                       achievement.rarity === 'uncommon' ? '特殊' : 
                       achievement.rarity === 'rare' ? '稀有' : '史诗'}
                    </Tag>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    );
  };

  return (
    <div className="student-learning-progress-page">
      <div className="page-header">
        <Title level={2}>学习进度分析</Title>
        <Paragraph>
          查看并分析您的学习进度，掌握知识图谱，发现学习模式，制定有效学习计划。
        </Paragraph>
      </div>
      
      {/* 总体统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总体完成度"
              value={calculateOverallProgress()}
              suffix="%"
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
            <Progress 
              percent={calculateOverallProgress()} 
              status="active" 
              strokeColor={{ 
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总学习时间"
              value={calculateTotalTimeSpent()}
              suffix="小时"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#0050b3' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="已完成课程"
              value={calculateCompletedCourses()}
              suffix={`/ ${courses.length}`}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="平均成绩"
              value={calculateAverageGrade()}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>
      
      <Tabs 
        activeKey={activeTabKey} 
        onChange={setActiveTabKey}
        style={{ marginTop: 24 }}
        type="card"
      >
        <TabPane tab="总览" key="overview">
          {/* ... existing overview content ... */}
        </TabPane>
        
        <TabPane tab="知识图谱" key="knowledge-map">
          {renderKnowledgeMap()}
        </TabPane>
        
        <TabPane tab="活动记录" key="activities">
          {/* ... existing activities content ... */}
          {renderLearningHeatmap()}
        </TabPane>
        
        <TabPane tab="学习推荐" key="recommendations">
          {renderLearningPathRecommendations()}
        </TabPane>
        
        <TabPane tab="学习成就" key="achievements">
          {renderAchievements()}
        </TabPane>
        
        <TabPane tab="技能分析" key="skills">
          {/* ... existing skills content ... */}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default StudentLearningProgress; 