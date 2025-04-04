import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, List, Tag, Button, Progress, Avatar, Typography, Space, Tabs, Calendar, Badge, Spin, Alert, Tooltip, Divider, Steps, Affix, Table, Empty } from 'antd';
import { 
  BookOutlined, 
  TrophyOutlined, 
  ClockCircleOutlined, 
  FileOutlined,
  CheckCircleOutlined,
  BellOutlined,
  PlayCircleOutlined,
  HistoryOutlined,
  CloseCircleOutlined,
  UserOutlined,
  FireOutlined,
  RiseOutlined,
  StarOutlined,
  ThunderboltOutlined,
  FlagOutlined,
  TeamOutlined,
  BarChartOutlined,
  RocketOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  CommentOutlined,
  MailOutlined,
  LineChartOutlined,
  PieChartOutlined,
  ArrowUpOutlined,
  TrophyFilled,
  FireFilled,
  CrownOutlined,
  GiftOutlined,
  ReadOutlined,
  RadarChartOutlined,
  CalendarOutlined,
  FundOutlined,
  ArrowDownOutlined,
  GlobalOutlined,
  AimOutlined,
  LikeOutlined,
  PlusOutlined,
  MessageOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import type { Dayjs } from 'dayjs';
import dashboardService from '../services/dashboardService';
import { useAppContext } from '../contexts/AppContext';
import PermissionGuard from '../components/PermissionGuard';

// 导入图表组件
import { Column, Line, Pie, Radar } from '@ant-design/plots';

const { Text, Title, Paragraph } = Typography;
const { TabPane } = Tabs;

// 定义成就类型
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  date?: string;
  type: 'daily' | 'weekly' | 'course' | 'skill' | 'special';
  unlocked: boolean;
}

// 定义学习目标类型
interface LearningGoal {
  id: string;
  title: string;
  progress: number;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
}

// 定义学习时长统计
interface StudyTimeStats {
  today: number;
  week: number;
  total: number;
  streak: number;
}

// 定义学习效率分析接口
interface LearningEfficiencyAnalysis {
  bestTimeOfDay: string;
  optimalSessionLength: number;
  productiveStreak: number;
  recommendations: string[];
  focusScore: number;
  distractions: { type: string; count: number }[];
  learningPatterns?: {
    weekdayDistribution?: number[];
    timeOfDayDistribution?: number[];
  };
  recentProgress?: {
    focusScores?: number[];
  };
  improvementAreas?: {
    subject: string;
    currentScore: number;
    potentialScore: number;
  }[];
}

// 积分与等级接口
interface PointsSystem {
  currentPoints: number;
  totalPointsEarned: number;
  level: number;
  nextLevelPoints: number;
  rank: number;
  totalUsers: number;
  pointsToday: number;
  pointsThisWeek: number;
  pointsHistory: {
    date: string;
    points: number;
    source: string;
  }[];
}

// 每日挑战接口
interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  type: 'study' | 'quiz' | 'reading' | 'practice' | 'social';
  difficulty: 'easy' | 'medium' | 'hard';
  pointsReward: number;
  progress: number;
  completed: boolean;
  expiresAt: string;
}

// 添加学习伙伴接口
interface StudyPartner {
  id: string;
  name: string;
  avatar: string;
  major: string;
  level: number;
  matchScore: number; // 匹配度分数 0-100
  commonCourses: string[];
  onlineStatus: 'online' | 'offline' | 'away';
  lastActive: string;
}

// 学习进度统计接口
interface LearningProgressStats {
  weeklyProgress: {
    labels: string[];
    values: number[];
  };
  monthlyCompletion: number;
  streakDays: number;
  totalCompletedTasks: number;
  taskCompletionRate: number;
  subjectPerformance: {
    subject: string;
    score: number;
    improvement: number;
  }[];
  learningConsistency: number;
  perfectDays: number;
  lastWeekComparison: number;
}

// 学习挑战赛接口
interface LearningCompetition {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  participants: number;
  ranking?: number;
  prize: string;
  category: string;
  status: 'upcoming' | 'active' | 'completed';
  progress?: number;
}

// 在接口定义之前添加格言数组
const MOTIVATIONAL_QUOTES = [
  "计算帮助我们认识世界，但也需认识到计算的边界 - 体验的丰富性往往超出数据能捕捉的范畴。",
  "数据是知识的一种形式，但智慧需要在经验与数据的交织中寻找。",
  "赞美算法的精确，也珍视人类直觉的不可预测；两者结合，方能获得更深刻的洞见。",
  "学习是交织的过程：既需理解公式背后的逻辑，也需感受创意背后的情感。",
  "有些问题计算机能解决，有些则需人文思考；完整的教育应当兼顾二者。"
];

const StudentDashboard: React.FC = () => {
  const { user } = useAppContext();
  const [student, setStudent] = useState<any>({});
  const [courses, setCourses] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [learningRecords, setLearningRecords] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>({});
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [learningGoals, setLearningGoals] = useState<LearningGoal[]>([]);
  const [studyTimeStats, setStudyTimeStats] = useState<StudyTimeStats>({ today: 0, week: 0, total: 0, streak: 0 });
  const [ranking, setRanking] = useState<{position: number, total: number}>({ position: 0, total: 0 });
  const [todayMotivation, setTodayMotivation] = useState<string>('');
  const [efficiencyAnalysis, setEfficiencyAnalysis] = useState<LearningEfficiencyAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pointsSystem, setPointsSystem] = useState<PointsSystem | null>(null);
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([]);
  const [studyPartners, setStudyPartners] = useState<StudyPartner[]>([]);
  const [progressStats, setProgressStats] = useState<LearningProgressStats | null>(null);
  const [competitions, setCompetitions] = useState<LearningCompetition[]>([]);
  const [quote, setQuote] = useState<string>("");

  const navigate = useNavigate();

  // 生成今日格言
  const generateRandomQuote = useCallback(() => {
    const motivations = [
      "在可计算的事物中珍视计算，在不可计算的体验中感受价值。数据之外，尚有无限体验等待探索。",
      "知识的力量在于积累，每一天的学习都是重要的进步。",
      "勇敢面对挑战，每个问题都是提升自我的机会。",
      "成功不是偶然，而是持续努力的结果。",
      "专注当下，相信自己，你的潜力远超想象！",
      "学习是交织的过程：既需理解公式背后的逻辑，也需感受创意背后的情感。",
      "数据是知识的一种形式，但智慧需要在经验与数据的交织中寻找。"
    ];
    const randomIndex = Math.floor(Math.random() * motivations.length);
    setTodayMotivation(motivations[randomIndex]);
    setQuote(motivations[randomIndex]);
  }, []);
  
  // 测试模拟数据功能
  const testMockData = useCallback(async () => {
    console.log('=== 测试学生仪表盘模拟数据获取 ===');
    
    console.log('测试获取materials活动数据...');
    const materialsData = await dashboardService.getRecentActivities('materials', 3);
    console.log('materials活动数据结果:', materialsData);
    
    console.log('测试获取applications活动数据...');
    const applicationsData = await dashboardService.getRecentActivities('applications', 3);
    console.log('applications活动数据结果:', applicationsData);
    
    console.log('测试使用不存在的活动类型...');
    const unknownData = await dashboardService.getRecentActivities('unknown_type', 3);
    console.log('不存在活动类型数据结果:', unknownData);
    
    console.log('测试格言功能...');
    generateRandomQuote();
    console.log('随机格言:', quote || todayMotivation);
  }, [generateRandomQuote, quote, todayMotivation]);

  // 获取数据
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
    setLoading(true);
      setError(null); // 重置错误状态
      
      try {
        // 获取学生仪表盘数据...
        console.log('获取学生仪表盘数据...');
        
        // 统计数据
        const studentStats = await dashboardService.getUserStatistics(user.id || 'student_1');
        if (studentStats) {
          // 设置学生统计数据
          setStudent(studentStats);
          
          // 设置学习时间统计
          if (studentStats.studyTime) {
            setStudyTimeStats({
              today: studentStats.studyTime.today || 0,
              week: studentStats.studyTime.week || 0,
              total: studentStats.studyTime.total || 0,
              streak: studentStats.studyTime.streak || 0
            });
          }
          
          // 设置排名
          if (studentStats.ranking) {
            setRanking({
              position: studentStats.ranking.position || 0,
              total: studentStats.ranking.total || 0
            });
          }
          
          // 设置成就
          if (studentStats.achievements && Array.isArray(studentStats.achievements)) {
            setAchievements(studentStats.achievements);
          }
          
          // 设置学习目标
          if (studentStats.learningGoals && Array.isArray(studentStats.learningGoals)) {
            setLearningGoals(studentStats.learningGoals);
          }
        }
        
        // 课程数据
        const coursesData = await dashboardService.getRecentActivities('studentCourses', 4);
        if (coursesData) setCourses(coursesData);
        
        // 通知数据
        const notificationData = await dashboardService.getRecentActivities('notifications', 5);
        if (notificationData) setNotifications(notificationData);
        
        // 作业数据
        const assignmentData = await dashboardService.getRecentActivities('studentAssignments', 5);
        if (assignmentData) setAssignments(assignmentData);
        
        // 学习记录
        const learningData = await dashboardService.getRecentActivities('learningRecords', 5);
        if (learningData) setLearningRecords(learningData);
        
        // 日程数据
        const scheduleData = await dashboardService.getChartData('studentSchedule');
        if (scheduleData) setSchedule(scheduleData.events || []);
        
        // 设置今日格言
        generateRandomQuote();
        
        // 设置学习效率分析数据
        const efficiencyData = await dashboardService.getLearningEfficiencyAnalysis(user.id || 'student_1');
        if (efficiencyData) setEfficiencyAnalysis(efficiencyData);
        
        // 获取积分系统数据
        try {
          const pointsData = await dashboardService.getRecentActivities('studentPoints', 5);
          if (pointsData && pointsData.length > 0) {
            // 假设服务返回的第一项包含积分汇总信息
            setPointsSystem({
              currentPoints: pointsData[0].currentPoints || 0,
              totalPointsEarned: pointsData[0].totalPointsEarned || 0,
              level: pointsData[0].level || 1,
              nextLevelPoints: pointsData[0].nextLevelPoints || 1000,
              rank: pointsData[0].rank || 0,
              totalUsers: pointsData[0].totalUsers || 0,
              pointsToday: pointsData[0].pointsToday || 0,
              pointsThisWeek: pointsData[0].pointsThisWeek || 0,
              pointsHistory: pointsData[0].history || []
            });
          }
        } catch (e) {
          console.error('获取积分系统数据失败:', e);
          // 不影响整体仪表盘显示，继续执行
        }
        
        // 获取每日挑战数据
        try {
          const challengeData = await dashboardService.getRecentActivities('dailyChallenges', 3);
          if (challengeData) setDailyChallenges(challengeData);
        } catch (e) {
          console.error('获取每日挑战数据失败:', e);
          // 不影响整体仪表盘显示，继续执行
        }
        
        // 获取学习伙伴推荐
        try {
          const partnersData = await dashboardService.getRecentActivities('studyPartners', 3);
          if (partnersData) setStudyPartners(partnersData);
        } catch (e) {
          console.error('获取学习伙伴推荐失败:', e);
          // 不影响整体仪表盘显示，继续执行
        }
        
        // 获取学习进度统计
        try {
          const progressStatsData = await dashboardService.getChartData('studentLearningProgress');
          if (progressStatsData) setProgressStats(progressStatsData);
        } catch (e) {
          console.error('获取学习进度统计失败:', e);
          // 不影响整体仪表盘显示，继续执行
        }
        
        // 获取学习挑战赛数据
        try {
          const competitionsData = await dashboardService.getRecentActivities('learningCompetitions', 2);
          if (competitionsData) setCompetitions(competitionsData);
        } catch (e) {
          console.error('获取学习挑战赛数据失败:', e);
          // 不影响整体仪表盘显示，继续执行
        }
        
      } catch (error) {
        console.error('获取学生仪表盘数据失败:', error);
        setError('无法加载仪表盘数据，请稍后再试');
        
        // 加载测试数据以确保基本功能可用
        try {
          await testMockData();
        } catch (e) {
          console.error('加载测试数据失败:', e);
        }
      } finally {
      setLoading(false);
      }
    };
    
    fetchData();
  }, [user, testMockData, generateRandomQuote]);

  // 日历数据处理
  const getListData = (value: Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD');
    const dayEvents = schedule.filter(item => item.date === dateStr);
    return dayEvents.map(event => ({
      type: event.type || 'success',
      content: event.content || event.title
    }));
  };

  const dateCellRender = (value: Dayjs) => {
    const listData = getListData(value);
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {listData.map((item, index) => (
          <li key={index}>
            <Badge status="success" text={<Text ellipsis style={{ fontSize: '12px' }}>{item.content}</Text>} />
          </li>
        ))}
      </ul>
    );
  };

  // 获取作业状态标签
  const getAssignmentStatusTag = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Tag color="success">已提交</Tag>;
      case 'pending':
        return <Tag color="warning">待提交</Tag>;
      case 'graded':
        return <Tag color="blue">已批改</Tag>;
      case 'late':
        return <Tag color="error">已逾期</Tag>;
      default:
        return null;
    }
  };

  // 渲染学习效率分析卡片
  const renderEfficiencyAnalysis = () => {
    if (!efficiencyAnalysis) return null;
    
    // 设置周学习时间分布数据
    const weekdayData = [
      { day: '周一', value: efficiencyAnalysis.learningPatterns?.weekdayDistribution?.[0] || 0 },
      { day: '周二', value: efficiencyAnalysis.learningPatterns?.weekdayDistribution?.[1] || 0 },
      { day: '周三', value: efficiencyAnalysis.learningPatterns?.weekdayDistribution?.[2] || 0 },
      { day: '周四', value: efficiencyAnalysis.learningPatterns?.weekdayDistribution?.[3] || 0 },
      { day: '周五', value: efficiencyAnalysis.learningPatterns?.weekdayDistribution?.[4] || 0 },
      { day: '周六', value: efficiencyAnalysis.learningPatterns?.weekdayDistribution?.[5] || 0 },
      { day: '周日', value: efficiencyAnalysis.learningPatterns?.weekdayDistribution?.[6] || 0 }
    ];

    // 设置一天时间段学习分布数据
    const timeOfDayData = [
      { time: '凌晨(0-6)', value: efficiencyAnalysis.learningPatterns?.timeOfDayDistribution?.[0] || 0 },
      { time: '早晨(6-9)', value: efficiencyAnalysis.learningPatterns?.timeOfDayDistribution?.[1] || 0 },
      { time: '上午(9-12)', value: efficiencyAnalysis.learningPatterns?.timeOfDayDistribution?.[2] || 0 },
      { time: '中午(12-14)', value: efficiencyAnalysis.learningPatterns?.timeOfDayDistribution?.[3] || 0 },
      { time: '下午(14-18)', value: efficiencyAnalysis.learningPatterns?.timeOfDayDistribution?.[4] || 0 },
      { time: '晚上(18-21)', value: efficiencyAnalysis.learningPatterns?.timeOfDayDistribution?.[5] || 0 },
      { time: '深夜(21-24)', value: efficiencyAnalysis.learningPatterns?.timeOfDayDistribution?.[6] || 0 }
    ];

    // 设置专注力得分趋势数据
    const focusScoreData = efficiencyAnalysis.recentProgress?.focusScores?.map((score, idx) => ({
      day: `第${idx + 1}天`,
      score
    })) || [];

    // 设置潜能提升空间数据
    const improvementData = efficiencyAnalysis.improvementAreas?.map((area, index) => ({
      subject: area.subject,
      type: '当前分数',
      value: area.currentScore,
      key: `current-${index}`
    })).concat(
      efficiencyAnalysis.improvementAreas?.map((area, index) => ({
        subject: area.subject,
        type: '潜在分数',
        value: area.potentialScore,
        key: `potential-${index}`
      })) || []
    ) || [];

  return (
      <PermissionGuard
        requiredModule="STUDENT_POINTS_SYSTEM"
        showEmptyPlaceholder={true}
        componentName="学习积分"
      >
        <Card 
          title={
            <Space>
              <BarChartOutlined />
              <span>学习效率分析</span>
            </Space>
          }
          loading={loading}
          style={{ marginBottom: 16 }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Card size="small" variant="outlined">
                <Statistic
                  title="专注力得分"
                  value={efficiencyAnalysis.focusScore}
                  suffix="/100"
                  valueStyle={{ color: efficiencyAnalysis.focusScore > 70 ? '#52c41a' : '#faad14' }}
                  prefix={<LineChartOutlined />}
                />
                <Progress 
                  percent={efficiencyAnalysis.focusScore} 
                  status={efficiencyAnalysis.focusScore > 70 ? 'success' : 'normal'} 
                  size="small" 
                />
          </Card>
        </Col>
            <Col xs={24} sm={12} md={8}>
              <Card size="small" variant="outlined">
            <Statistic 
                  title="最佳学习时段"
                  value={efficiencyAnalysis.bestTimeOfDay}
                  valueStyle={{ fontSize: '16px' }}
                  prefix={<ClockCircleOutlined />}
                />
                <Text type="secondary">此时段学习效率最高</Text>
          </Card>
        </Col>
            <Col xs={24} sm={12} md={8}>
              <Card size="small" variant="outlined">
            <Statistic 
                  title="最佳单次学习时长"
                  value={efficiencyAnalysis.optimalSessionLength}
                  suffix="分钟"
                  prefix={<TrophyOutlined />}
                />
                <Text type="secondary">单次学习效率最佳时长</Text>
          </Card>
        </Col>
          </Row>
          
          <Divider style={{ margin: '16px 0' }} />
          
          <Alert
            message={
              <Typography.Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                <MessageOutlined /> 学习智慧
              </Typography.Text>
            }
            description={
              <Typography.Paragraph style={{ marginBottom: 0, fontSize: '14px', color: '#333' }}>
                在可计算的事物中珍视计算，在不可计算的体验中感受价值。数据之外，尚有无限体验等待探索。
              </Typography.Paragraph>
            }
            type="info"
            showIcon={false}
            style={{ 
              marginBottom: 16, 
              background: 'linear-gradient(to right, #f0f5ff, #e6f7ff)',
              border: '1px solid #91caff',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}
          />
          
          <Row gutter={[16, 24]}>
            <Col xs={24} md={12}>
              <Card 
                size="small" 
                title={
                  <Space>
                    <BarChartOutlined />
                    <span>每周学习时间分布</span>
                  </Space>
                }
              >
                <Column
                  data={weekdayData}
                  xField="day"
                  yField="value"
                  color="#1890ff"
                  label={{
                    position: 'top',
                    style: {
                      fill: '#999',
                      opacity: 0.8,
                    },
                  }}
                  meta={{
                    value: {
                      alias: '学习时间占比(%)',
                    },
                  }}
                  height={200}
            />
          </Card>
        </Col>
            <Col xs={24} md={12}>
              <Card 
                size="small" 
                title={
                  <Space>
                    <PieChartOutlined />
                    <span>一天中学习时间分布</span>
                  </Space>
                }
              >
                <Table
                  size="small"
                  pagination={false}
                  dataSource={timeOfDayData.map((item, index) => ({
                    ...item,
                    key: index,
                  }))}
                  columns={[
                    {
                      title: '时间段',
                      dataIndex: 'time',
                      key: 'time',
                    },
                    {
                      title: '占比(%)',
                      dataIndex: 'value',
                      key: 'value',
                      render: (value) => (
                        <Progress
                          percent={value}
                          size="small"
                          format={(percent) => `${percent}%`}
                        />
                      ),
                    },
                  ]}
            />
          </Card>
        </Col>
      </Row>

          <Row gutter={[16, 24]} style={{ marginTop: 16 }}>
            <Col xs={24} md={12}>
              <Card 
                size="small" 
                title={
                  <Space>
                    <LineChartOutlined />
                    <span>专注力趋势</span>
                  </Space>
                }
              >
                <Line
                  data={focusScoreData}
                  xField="day"
                  yField="score"
                  point={{
                    size: 5,
                    shape: 'circle',
                  }}
                  color="#5B8FF9"
                  height={200}
                />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card 
                size="small" 
                title={
                  <Space>
                    <ArrowUpOutlined />
                    <span>潜能提升空间</span>
                  </Space>
                }
              >
                <Table
                  size="small"
                  pagination={false}
                  dataSource={improvementData}
                  columns={[
                    {
                      title: '科目',
                      dataIndex: 'subject',
                      key: 'subject',
                    },
                    {
                      title: '类型',
                      dataIndex: 'type',
                      key: 'type',
                    },
                    {
                      title: '分数',
                      dataIndex: 'value',
                      key: 'value',
                    },
                  ]}
                />
              </Card>
            </Col>
          </Row>
          
          <Divider style={{ margin: '16px 0' }} />
          
          <Row gutter={[16, 16]}>
        <Col xs={24} md={16}>
              <div>
                <Title level={5}>个性化学习建议</Title>
            <List
                  size="small"
                  bordered
                  dataSource={efficiencyAnalysis.recommendations}
                  renderItem={(rec, idx) => (
                <List.Item
                      key={idx}
                  actions={[
                        <Badge count={idx + 1} style={{ backgroundColor: '#1890ff' }} />
                      ]}
                    >
                      <Space align="start">
                        <Text>{rec}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div>
                <Title level={5}>常见注意力分散因素</Title>
                <List
                  size="small"
                  bordered
                  dataSource={efficiencyAnalysis.distractions}
                  renderItem={item => (
                    <List.Item
                      key={item.type}
                      actions={[
                        <Row style={{ width: '100%' }}>
                          <Col span={12}>
                            <Text>{item.type}: </Text>
                          </Col>
                          <Col span={12}>
                            <Progress 
                              percent={Math.min(100, (item.count / 15) * 100)} 
                              strokeColor="#ff4d4f" 
                              size="small" 
                              format={() => `${item.count}次/天`} 
                            />
                          </Col>
                        </Row>
                      ]}
                    />
                  )}
                />
              </div>
            </Col>
          </Row>
          
          <div style={{ textAlign: 'center', marginTop: '16px', marginBottom: '16px' }}>
            <Link to="/student-evaluation">
              <Button type="primary" icon={<BarChartOutlined />} size="large">
                查看完整能力评估报告
              </Button>
                    </Link>
          </div>
        </Card>
      </PermissionGuard>
    );
  };
  
  // 渲染格言卡片
  const renderMotivationalQuote = () => {
    // 随机选择一条格言
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    const quote = MOTIVATIONAL_QUOTES[randomIndex];
    
    return (
      <Card 
        style={{ 
          marginBottom: 24, 
          backgroundImage: 'linear-gradient(to right, #8e9eab, #eef2f3)',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }}
      >
        <Typography.Text 
          italic 
          style={{ 
            fontSize: 16, 
            display: 'block', 
            color: '#333',
            textAlign: 'center',
            padding: '12px 20px',
            fontWeight: 500
          }}
        >
          "{quote}"
        </Typography.Text>
      </Card>
    );
  };

  // 渲染快速访问工具栏
  const renderQuickAccessToolbar = () => {
    return (
      <Affix offsetTop={80} style={{ position: 'fixed', right: '20px', top: '80px', zIndex: 10 }}>
        <Card style={{ width: '60px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
          <Space direction="vertical" size="large" style={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="快速提问" placement="left">
              <Button type="text" shape="circle" icon={<QuestionCircleOutlined style={{ fontSize: '20px', color: '#1890ff' }} />} />
            </Tooltip>
            
            <Tooltip title="消息" placement="left">
              <Badge count={3} size="small">
                <Button type="text" shape="circle" icon={<MailOutlined style={{ fontSize: '20px', color: '#722ed1' }} />} />
              </Badge>
            </Tooltip>
            
            <Tooltip title="学习反馈" placement="left">
              <Button type="text" shape="circle" icon={<CommentOutlined style={{ fontSize: '20px', color: '#52c41a' }} />} />
            </Tooltip>
            
            <Tooltip title="设置" placement="left">
              <Button type="text" shape="circle" icon={<SettingOutlined style={{ fontSize: '20px', color: '#faad14' }} />} />
            </Tooltip>
            
            <Divider style={{ margin: '8px 0' }} />
            
            <Tooltip title="返回顶部" placement="left">
              <Button type="text" shape="circle" 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                icon={<RocketOutlined style={{ fontSize: '20px', color: '#ff4d4f' }} />} 
              />
            </Tooltip>
          </Space>
        </Card>
      </Affix>
    );
  };

  // 渲染等级与积分卡片
  const renderPointsSystem = () => {
    if (!pointsSystem) return null;
    
    const levelProgressPercent = (pointsSystem.currentPoints / pointsSystem.nextLevelPoints) * 100;
    
    return (
      <PermissionGuard
        requiredModule="STUDENT_POINTS_SYSTEM"
        showEmptyPlaceholder={true}
        componentName="学习积分"
      >
        <Card
          title={
            <Space>
              <TrophyOutlined />
              <span>我的积分与等级</span>
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={24} md={12}>
              <Statistic
                title="当前积分"
                value={pointsSystem.currentPoints}
                prefix={<FireOutlined style={{ color: '#ff4d4f' }} />}
                valueStyle={{ color: '#1890ff' }}
              />
              <Progress
                percent={levelProgressPercent}
                strokeColor={{
                  '0%': '#1890ff',
                  '100%': '#52c41a',
                }}
                format={() => `等级 ${pointsSystem.level}`}
              />
              <div style={{ fontSize: '12px', color: '#888', marginTop: 8 }}>
                距离下一等级还需 {pointsSystem.nextLevelPoints - pointsSystem.currentPoints} 积分
              </div>
            </Col>
            <Col xs={24} sm={24} md={12}>
              <Card size="small" title="积分排名" bordered={false}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title="排名"
                      value={pointsSystem.rank}
                      suffix={`/ ${pointsSystem.totalUsers}`}
                      valueStyle={{ fontSize: '20px' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="今日获得"
                      value={pointsSystem.pointsToday}
                      valueStyle={{ fontSize: '20px', color: '#52c41a' }}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </Card>
      </PermissionGuard>
    );
  };
  
  // 渲染每日挑战卡片
  const renderDailyChallenges = () => {
    return (
      <PermissionGuard
        requiredModule="STUDENT_CHALLENGES"
        showEmptyPlaceholder={true}
        componentName="每日挑战"
      >
        <Card 
          title={
            <Space>
              <GiftOutlined style={{ color: '#eb2f96' }} />
              <span>每日挑战</span>
            </Space>
          }
          extra={
            <Space>
              <Text>总进度:</Text>
              <Progress type="circle" percent={Math.round(dailyChallenges.reduce((sum, challenge) => sum + challenge.progress, 0) / dailyChallenges.length)} size={30} />
            </Space>
          }
          loading={loading}
        >
          <List
            dataSource={dailyChallenges}
            renderItem={challenge => (
              <List.Item
                key={challenge.id}
                actions={[
                  challenge.completed ? 
                    <Button type="text" icon={<CheckCircleOutlined />} disabled>已完成</Button> : 
                    <Button type="primary" ghost>继续</Button>
                  ]}
                >
                  <List.Item.Meta
                  avatar={
                    <Avatar 
                      icon={
                        challenge.type === 'study' ? <BookOutlined /> :
                        challenge.type === 'quiz' ? <FileOutlined /> :
                        challenge.type === 'reading' ? <ReadOutlined /> :
                        challenge.type === 'practice' ? <ThunderboltOutlined /> :
                        <TeamOutlined />
                      } 
                      style={{ backgroundColor: challenge.difficulty === 'easy' ? '#52c41a' :
                        challenge.difficulty === 'medium' ? '#faad14' : '#f5222d' }}
                    />
                  }
                  title={
                    <Space>
                      <Text strong>{challenge.title}</Text>
                      <Tag color="blue">+{challenge.pointsReward}积分</Tag>
                      <Tag color={challenge.difficulty === 'easy' ? '#52c41a' :
                        challenge.difficulty === 'medium' ? '#faad14' : '#f5222d'}>
                        {challenge.difficulty === 'easy' ? '简单' : 
                         challenge.difficulty === 'medium' ? '中等' : '困难'}
                      </Tag>
                      </Space>
                    }
                  description={
                    <div>
                      <div>{challenge.description}</div>
                      <Progress percent={challenge.progress} size="small" style={{ marginTop: 8 }} />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        截止时间: {new Date(challenge.expiresAt).toLocaleString()}
                      </Text>
                    </div>
                    }
                  />
                </List.Item>
              )}
            />
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Button type="primary" icon={<GiftOutlined />}>
              查看所有挑战
            </Button>
          </div>
          </Card>
      </PermissionGuard>
    );
  };

  // 渲染学习伙伴卡片
  const renderStudyPartners = () => {
    if (!studyPartners || studyPartners.length === 0) return null;
    
    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'online': return <Badge status="success" text="在线" />;
        case 'offline': return <Badge status="default" text="离线" />;
        case 'away': return <Badge status="warning" text="离开" />;
        default: return <Badge status="default" text="未知" />;
      }
    };
    
    const getMatchColor = (score: number) => {
      if (score >= 90) return '#52c41a';
      if (score >= 80) return '#1890ff';
      if (score >= 70) return '#faad14';
      return '#bfbfbf';
    };
    
    return (
      <Card 
        title={
          <Space>
            <TeamOutlined style={{ color: '#1890ff' }} />
            <span>学习伙伴</span>
          </Space>
        }
        extra={<Button type="link" size="small">查找更多</Button>}
        loading={loading}
      >
            <List
          dataSource={studyPartners}
          renderItem={partner => (
            <List.Item
              key={partner.id}
              actions={[
                <Button type="primary" size="small">交流</Button>,
                <Button size="small">组队学习</Button>
              ]}
            >
                  <List.Item.Meta
                avatar={
                  <div style={{ position: 'relative' }}>
                    <Avatar src={partner.avatar} size="large" />
                    <div style={{ position: 'absolute', right: -3, bottom: -3 }}>
                      {partner.onlineStatus === 'online' && <Badge status="success" />}
                      {partner.onlineStatus === 'away' && <Badge status="warning" />}
                    </div>
                  </div>
                }
                    title={
                      <Space>
                    <Text strong>{partner.name}</Text>
                    <Tag color="purple">Lv.{partner.level}</Tag>
                    <Tooltip title="匹配度是基于你们的学习习惯、课程选择和学习进度计算的相似度">
                      <Tag color={getMatchColor(partner.matchScore)}>
                        匹配度 {partner.matchScore}%
                      </Tag>
                    </Tooltip>
                      </Space>
                    }
                description={
                  <Space direction="vertical" size={1}>
                    <Text type="secondary">{partner.major}</Text>
                    <Text type="secondary">
                      共同课程: {partner.commonCourses.join(', ')}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {partner.onlineStatus === 'online' ? '当前在线' : `最后活跃: ${partner.lastActive}`}
                    </Text>
                  </Space>
                }
              />
                </List.Item>
              )}
            />
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Space>
            <Button type="primary" icon={<TeamOutlined />}>匹配学习伙伴</Button>
            <Button icon={<RocketOutlined />}>创建学习小组</Button>
          </Space>
            </div>
      </Card>
    );
  };

  // 渲染课程列表
  const renderCourseCards = () => {
    if (!courses || courses.length === 0) {
      return (
        <Empty
          description="暂无课程数据"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }
    
    return (
      <Row gutter={[16, 16]}>
        {courses.map((course, index) => (
          <Col xs={24} sm={12} md={12} lg={12} key={course.id || index}>
            <Card 
              hoverable
              style={{ height: '100%' }}
              cover={course.coverImage ? <img alt={course.title} src={course.coverImage} style={{ height: 120, objectFit: 'cover' }} /> : null}
              onClick={() => navigate(`/student/courses/${course.id}`)}
            >
              <Card.Meta 
                title={course.title} 
                description={
                  <>
                    <p>{course.description}</p>
                    <Space>
                      <Tag color="blue">{course.category}</Tag>
                      <Progress percent={course.progress || 0} size="small" style={{ width: 80 }} />
                      <span>{course.progress || 0}%</span>
                    </Space>
                  </>
                } 
              />
          </Card>
        </Col>
        ))}
      </Row>
    );
  };

  // 渲染学习进度统计仪表盘
  const renderProgressDashboard = () => {
    if (!progressStats) return null;
    
    return (
      <Card 
        title={
          <Space>
            <FundOutlined style={{ color: '#1890ff' }} />
            <span>学习进度统计</span>
          </Space>
        }
        loading={loading}
      >
        <Row gutter={[16, 24]}>
          <Col xs={24} md={8}>
            <Card bordered={false} className="inner-card">
              <Statistic 
                title={<Text strong>月度完成率</Text>}
                value={progressStats.monthlyCompletion}
                suffix="%"
                valueStyle={{ color: '#1890ff' }}
                prefix={<CalendarOutlined />}
              />
              <Progress 
                percent={progressStats.monthlyCompletion} 
                strokeColor={{
                  '0%': '#1890ff',
                  '100%': '#52c41a',
                }}
                status="active"
              />
              <Text type="secondary">
                比上个月{progressStats.lastWeekComparison > 0 ? '提高' : '下降'}了 
                <Text strong type={progressStats.lastWeekComparison > 0 ? 'success' : 'danger'}>
                  {Math.abs(progressStats.lastWeekComparison)}%
                </Text>
              </Text>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card bordered={false} className="inner-card">
              <Statistic 
                title={<Text strong>连续学习天数</Text>}
                value={progressStats.streakDays}
                valueStyle={{ color: '#fa541c' }}
                prefix={<FireFilled />}
                suffix="天"
              />
              <div style={{ marginTop: '8px' }}>
                <Badge color="#fa541c" text={
                  <Text>
                    已完成 <Text strong>{progressStats.totalCompletedTasks}</Text> 个学习任务
                  </Text>
                } />
              </div>
              <div>
                <Badge color="#52c41a" text={
                  <Text>
                    任务完成率 <Text strong>{progressStats.taskCompletionRate}%</Text>
                  </Text>
                } />
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card bordered={false} className="inner-card">
              <Statistic 
                title={<Text strong>学习稳定度</Text>}
              />
            </Card>
          </Col>
        </Row>
      </Card>
    );
  };

  // 渲染学习挑战赛卡片
  const renderCompetitions = () => {
    // 获取挑战赛状态标签
    const getStatusTag = (status: string) => {
      switch (status) {
        case 'active':
          return <Tag color="green">进行中</Tag>;
        case 'upcoming':
          return <Tag color="blue">即将开始</Tag>;
        case 'completed':
          return <Tag color="gray">已结束</Tag>;
        default:
          return null;
      }
    };
    
    // 获取分类颜色
    const getCategoryColor = (category: string) => {
      switch (category) {
        case '编程':
          return '#1890ff';
        case '语言':
          return '#52c41a';
        case '数学':
          return '#722ed1';
        case '科学':
          return '#fa541c';
        case '设计':
          return '#eb2f96';
        default:
          return '#1890ff';
      }
    };
    
    return (
      <PermissionGuard
        requiredModule="STUDENT_COMPETITIONS"
        showEmptyPlaceholder={true}
        componentName="学习挑战赛"
      >
        <Card 
          title={
            <Space>
              <TrophyFilled style={{ color: '#faad14' }} />
              <span>学习挑战赛</span>
            </Space>
          }
          extra={<Link to="/student/competitions">查看全部</Link>}
          loading={loading}
        >
            <List
            grid={{ gutter: 16, xs: 1, sm: 1, md: 1, lg: 1, xl: 3, xxl: 3 }}
            dataSource={competitions}
            renderItem={competition => (
              <List.Item key={competition.id}>
                <Card
                  hoverable
                  size="small"
                  style={{ height: '100%' }}
                  actions={[
                    competition.status === 'upcoming' 
                      ? <Button type="primary" size="small">预约报名</Button>
                      : competition.status === 'active'
                        ? <Button type="primary" size="small">继续挑战</Button>
                        : <Button size="small">查看结果</Button>
                  ]}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <Text strong style={{ fontSize: 16 }}>{competition.title}</Text>
                      {getStatusTag(competition.status)}
                    </div>
                    
                    <Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ marginBottom: 10 }}>
                      {competition.description}
                    </Paragraph>
                    
                    <Space direction="vertical" size={2} style={{ width: '100%' }}>
                      <Space>
                        <GlobalOutlined style={{ color: getCategoryColor(competition.category) }} />
                        <Text type="secondary">{competition.category}类</Text>
                      </Space>
                      
                      <Space>
                        <TeamOutlined />
                        <Text type="secondary">{competition.participants}人参与</Text>
                      </Space>
                      
                      <Space>
                        <CalendarOutlined />
                        <Text type="secondary">
                          {new Date(competition.startDate).toLocaleDateString()} - {new Date(competition.endDate).toLocaleDateString()}
                        </Text>
                      </Space>
                      
                      {competition.status === 'active' && competition.ranking && (
                        <Space>
                          <AimOutlined style={{ color: '#1890ff' }} />
                          <Text type="secondary">当前排名: <Text strong>{competition.ranking}</Text>/{competition.participants}</Text>
                        </Space>
                      )}
                      
                      <Space>
                        <GiftOutlined style={{ color: '#eb2f96' }} />
                        <Text type="secondary">奖励: {competition.prize}</Text>
                      </Space>
                      
                      {competition.status === 'active' && competition.progress !== undefined && (
                        <div style={{ marginTop: 8 }}>
                          <Space direction="vertical" style={{ width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Text type="secondary">进度</Text>
                              <Text strong>{competition.progress}%</Text>
                            </div>
                            <Progress percent={competition.progress} size="small" />
                          </Space>
                        </div>
                      )}
                    </Space>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
            <Space>
              <Button type="primary" icon={<TrophyFilled />}>
                创建学习挑战
              </Button>
              <Button icon={<TeamOutlined />}>
                邀请同学参赛
              </Button>
            </Space>
          </div>
        </Card>
      </PermissionGuard>
    );
  };

  // 渲染今日学习目标
  const renderTodayGoals = () => {
    if (!learningGoals || learningGoals.length === 0) return null;
    
    const getPriorityColor = (priority: string) => {
      switch (priority) {
        case 'high': return '#f5222d';
        case 'medium': return '#faad14';
        case 'low': return '#52c41a';
        default: return '#1890ff';
      }
    };
    
    return (
      <Card 
        title={
          <Space>
            <FlagOutlined style={{ color: '#52c41a' }} />
            <span>今日学习目标</span>
          </Space>
        }
        extra={<Button type="link" size="small" icon={<PlusOutlined />}>添加目标</Button>}
        loading={loading}
      >
        <List
          dataSource={learningGoals}
          renderItem={goal => (
                <List.Item
              key={goal.id}
                  actions={[
                <Button type="primary" size="small">开始</Button>,
                <Button size="small">详情</Button>
                  ]}
                >
                  <List.Item.Meta
                avatar={
                  <Avatar 
                    style={{ 
                      backgroundColor: getPriorityColor(goal.priority),
                      color: 'white'
                    }}
                    icon={<FlagOutlined />}
                  />
                }
                    title={
                      <Space>
                    <Text strong>{goal.title}</Text>
                    <Tag color={getPriorityColor(goal.priority)}>
                      {goal.priority === 'high' ? '紧急' : 
                       goal.priority === 'medium' ? '中等' : '一般'}
                    </Tag>
                      </Space>
                    }
                    description={
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Progress percent={goal.progress} size="small" style={{ width: '80%' }} />
                      <Text type="secondary">{goal.progress}%</Text>
                    </div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      截止日期: {new Date(goal.dueDate).toLocaleDateString()}
                    </Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text>今日完成目标: <Text strong type="success">2</Text>/<Text strong>5</Text></Text>
          <Button type="primary" icon={<FlagOutlined />}>查看所有目标</Button>
        </div>
      </Card>
    );
  };
  
  // 渲染成就卡片
  const renderAchievements = () => {
    if (!achievements || achievements.length === 0) return null;
    
    const getTypeText = (type: string) => {
      switch (type) {
        case 'daily': return '每日成就';
        case 'weekly': return '每周成就';
        case 'course': return '课程成就';
        case 'skill': return '技能成就';
        case 'special': return '特殊成就';
        default: return '成就';
      }
    };
    
    const getTypeColor = (type: string) => {
      switch (type) {
        case 'daily': return '#52c41a';
        case 'weekly': return '#1890ff';
        case 'course': return '#722ed1';
        case 'skill': return '#fa541c';
        case 'special': return '#eb2f96';
        default: return '#1890ff';
      }
    };
    
    return (
      <Card 
        title={
          <Space>
            <TrophyOutlined style={{ color: '#faad14' }} />
            <span>我的成就</span>
                      </Space>
        }
        extra={<Link to="/student/achievements"><Button type="link">查看全部</Button></Link>}
        loading={loading}
      >
        <List
          dataSource={achievements.slice(0, 3)}
          renderItem={achievement => (
            <List.Item key={achievement.id}>
              <List.Item.Meta
                avatar={
                  <Avatar 
                    style={{ 
                      backgroundColor: achievement.unlocked ? getTypeColor(achievement.type) : '#d9d9d9',
                      color: 'white'
                    }}
                    icon={achievement.icon}
                  />
                }
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space>
                      <Text strong>{achievement.title}</Text>
                      <Tag color={getTypeColor(achievement.type)}>
                        {getTypeText(achievement.type)}
                      </Tag>
                    </Space>
                    {achievement.unlocked && 
                      <Badge count="已解锁" style={{ backgroundColor: '#52c41a' }} />
                    }
                  </div>
                }
                description={
                  <div>
                    <Text type="secondary">{achievement.description}</Text>
                    {!achievement.unlocked && (
                      <Progress 
                        percent={achievement.progress} 
                        size="small" 
                        style={{ marginTop: 8 }} 
                      />
                    )}
                    {achievement.date && (
                      <div style={{ marginTop: 4 }}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          获得时间: {new Date(achievement.date).toLocaleDateString()}
                        </Text>
                      </div>
                    )}
                  </div>
                    }
                  />
                </List.Item>
              )}
        />
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text>解锁成就: <Text strong type="success">15</Text>/<Text strong>50</Text></Text>
          <Progress percent={30} size="small" style={{ width: '60%' }} />
        </div>
      </Card>
    );
  };

  // 添加错误展示组件
  const ErrorDisplay = () => {
    if (!error) return null;
    
    return (
      <Alert
        message="数据加载错误"
        description={error}
        type="error"
        showIcon
        closable
        onClose={() => setError(null)}
        style={{ marginBottom: 16 }}
      />
    );
  };

  return (
    <div className="student-dashboard">
      <div style={{ padding: '0 24px 24px' }}>
        {/* 错误信息展示 */}
        <ErrorDisplay />
        
        {/* 概览统计 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="已选课程"
                value={courses?.length || 0}
                prefix={<BookOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="待提交作业"
                value={assignments?.filter(a => a.status === 'pending').length || 0}
                prefix={<FileOutlined />}
                valueStyle={{ color: assignments?.filter(a => a.status === 'pending').length > 0 ? '#faad14' : '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="今日学习时间"
                value={studyTimeStats.today}
                suffix="分钟"
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="连续学习"
                value={studyTimeStats.streak}
                suffix="天"
                prefix={<FireOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>
        
        {/* 成就仪表盘 - 优化统计区域的展示方式 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Card 
              title={
                <Space>
                  <TrophyFilled style={{ color: '#faad14', fontSize: '20px' }} />
                  <Typography.Title level={4} style={{ margin: 0 }}>我的成就仪表盘</Typography.Title>
                </Space>
              }
              extra={<Link to="/student/achievements"><Button type="primary">查看所有成就</Button></Link>}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <Card bordered={false} style={{ background: '#f6ffed', borderRadius: '8px' }}>
                    <div className="statistic-wrapper"> {/* 使用div替代直接使用Statistic组件 */}
                      <Statistic
                        title={<Text strong>已解锁成就</Text>}
                        value={achievements.filter(a => a.unlocked).length}
                        suffix={`/ ${achievements.length}`}
                        valueStyle={{ color: '#52c41a' }}
                        prefix={<TrophyOutlined />}
                      />
                    </div>
                    <Progress 
                      percent={achievements.length > 0 ? Math.round((achievements.filter(a => a.unlocked).length / achievements.length) * 100) : 0}
                      status="active"
                      strokeColor={{
                        '0%': '#52c41a',
                        '100%': '#1890ff',
                      }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card bordered={false} style={{ background: '#e6f7ff', borderRadius: '8px' }}>
                    <div className="statistic-wrapper">
                      <Statistic
                        title={<Text strong>最近解锁</Text>}
                        value={achievements.filter(a => a.unlocked && a.date).length > 0 ? "有新成就" : "暂无新成就"}
                        valueStyle={{ color: '#1890ff' }}
                        prefix={<StarOutlined />}
                      />
                    </div>
                    <div style={{ marginTop: 8 }}>
                      {achievements.filter(a => a.unlocked && a.date)
                        .sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime())
                        .slice(0, 1)
                        .map(achievement => (
                          <Tag color="#1890ff" key={achievement.id} style={{ margin: '4px 0' }}>
                            {achievement.title}
                          </Tag>
                        ))}
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card bordered={false} style={{ background: '#fff7e6', borderRadius: '8px' }}>
                    <div className="statistic-wrapper">
                      <Statistic
                        title={<Text strong>成就积分</Text>}
                        value={pointsSystem?.currentPoints || 0}
                        valueStyle={{ color: '#fa8c16' }}
                        prefix={<CrownOutlined />}
                      />
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <Tag color="#fa8c16">
                        等级: {pointsSystem?.level || 1}
                      </Tag>
                      <Tag color="#fa8c16">
                        排名: {pointsSystem?.rank || '-'}/{pointsSystem?.totalUsers || '-'}
                      </Tag>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card bordered={false} style={{ background: '#f9f0ff', borderRadius: '8px' }}>
                    <div className="statistic-wrapper">
                      <Statistic
                        title={<Text strong>下一成就</Text>}
                        value={achievements.filter(a => !a.unlocked).length > 0 ? "努力中" : "全部完成"}
                        valueStyle={{ color: '#722ed1' }}
                        prefix={<RocketOutlined />}
                      />
                    </div>
                    <div style={{ marginTop: 8 }}>
                      {achievements.filter(a => !a.unlocked)
                        .sort((a, b) => b.progress - a.progress)
                        .slice(0, 1)
                        .map(achievement => (
                          <>
                            <Tag color="#722ed1" key={achievement.id} style={{ margin: '4px 0' }}>
                              {achievement.title}
                            </Tag>
                            <Progress 
                              percent={achievement.progress} 
                              size="small" 
                              status="active"
                              strokeColor="#722ed1"
                            />
                          </>
                        ))}
                    </div>
                  </Card>
                </Col>
              </Row>
              
              <Divider orientation="left">最近解锁的成就</Divider>
              
              <List
                grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }}
                dataSource={achievements.filter(a => a.unlocked)
                  .sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime())
                  .slice(0, 4)}
                renderItem={achievement => (
                  <List.Item key={achievement.id}>
                    <Card 
                      hoverable 
                      style={{ height: '100%' }}
                      actions={[
                        <Button type="link" onClick={() => navigate('/student/achievements')}>
                          详情
                        </Button>
                      ]}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          size={48}
                          style={{ 
                            backgroundColor: achievement.unlocked ? 
                              (achievement.type === 'special' ? '#eb2f96' : 
                               achievement.type === 'skill' ? '#fa541c' : 
                               achievement.type === 'course' ? '#722ed1' : 
                               achievement.type === 'weekly' ? '#1890ff' : 
                               '#52c41a') : '#d9d9d9',
                            color: 'white',
                            flexShrink: 0,
                            marginRight: 12
                          }}
                          icon={achievement.icon}
                        />
                        <div>
                          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{achievement.title}</div>
                          <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)' }}>
                            {achievement.description}
                          </div>
                          {achievement.date && (
                            <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)', marginTop: 4 }}>
                              获得于: {new Date(achievement.date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </List.Item>
                )}
                locale={{
                  emptyText: (
                    <Empty 
                      image={Empty.PRESENTED_IMAGE_SIMPLE} 
                      description="暂无已解锁的成就" 
                    />
                  )
                }}
              />
            </Card>
          </Col>
        </Row>
        
        {/* 当日格言 */}
        <Alert
          message={
            <Typography.Text strong style={{ fontSize: '16px' }}>
              今日格言
            </Typography.Text>
          }
          description={quote || todayMotivation || "在可计算的事物中珍视计算，在不可计算的体验中感受价值。"}
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Row gutter={[16, 16]}>
          {/* 左侧面板 */}
          <Col xs={24} md={16}>
            {/* 我的课程 */}
            <Card 
              title={
                <Space>
                  <BookOutlined />
                  <span>我的课程</span>
                </Space>
              }
              extra={<Link to="/student/courses">查看全部</Link>}
              style={{ marginBottom: 16 }}
              loading={loading}
            >
              {renderCourseCards()}
            </Card>
            
            {/* 学习效率分析 */}
            {renderEfficiencyAnalysis()}
            
            {/* 学习积分 */}
            {renderPointsSystem()}
          </Col>
          
          {/* 右侧面板 */}
          <Col xs={24} md={8}>
            {/* 待提交作业 */}
            <Card
              title={
                <Space>
                  <FileOutlined />
                  <span>待提交作业</span>
                </Space>
              }
              extra={<Link to="/student/assignments">查看全部</Link>}
              style={{ marginBottom: 16 }}
              loading={loading}
            >
                  <List
                    itemLayout="horizontal"
                dataSource={assignments?.filter(a => a.status === 'pending') || []}
                renderItem={item => (
                  <List.Item
                    key={item.id}
                    actions={[
                      <Button type="link" size="small" onClick={() => navigate(`/student/assignments/${item.id}`)}>
                        查看
                      </Button>
                    ]}
                  >
                        <List.Item.Meta
                      title={item.title}
                          description={
                        <Space>
                          <span>{item.courseName}</span>
                          <span>截止: {item.deadline}</span>
                          {getAssignmentStatusTag(item.status)}
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                locale={{
                  emptyText: <Empty description="暂无待提交作业" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                }}
                  />
                </Card>
            
            {/* 最新通知 */}
            <Card
              title={
                <Space>
                  <BellOutlined />
                  <span>最新通知</span>
                </Space>
              }
              extra={<Link to="/notifications">查看全部</Link>}
              style={{ marginBottom: 16 }}
              loading={loading}
            >
              <List
                itemLayout="horizontal"
                dataSource={notifications || []}
                renderItem={item => (
                  <List.Item key={item.id}>
                    <List.Item.Meta
                      avatar={<Avatar icon={<BellOutlined />} style={{ backgroundColor: item.read ? '#d9d9d9' : '#1890ff' }} />}
                      title={item.title}
                      description={
                        <>
                          <div>{item.content}</div>
                          <div style={{ fontSize: '12px', color: '#999' }}>{item.time}</div>
                        </>
                      }
                    />
                  </List.Item>
                )}
                locale={{
                  emptyText: <Empty description="暂无通知" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                }}
              />
            </Card>
            
            {/* 日程安排 */}
            <Card
              title={
                <Space>
                  <CalendarOutlined />
                  <span>日程安排</span>
                </Space>
              }
              style={{ marginBottom: 16 }}
              loading={loading}
            >
              <Calendar 
                fullscreen={false} 
                cellRender={dateCellRender} 
              />
            </Card>
        </Col>
      </Row>
      </div>
    </div>
  );
};

export default StudentDashboard; 