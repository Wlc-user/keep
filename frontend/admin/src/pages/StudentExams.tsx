import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Tabs, 
  List, 
  Typography, 
  Tag, 
  Button, 
  Space, 
  Badge, 
  Progress, 
  Empty, 
  Modal,
  Skeleton,
  Divider,
  Alert,
  Result,
  Avatar,
  Descriptions
} from 'antd';
import { 
  CalendarOutlined, 
  FileTextOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  RightOutlined,
  TrophyOutlined,
  BarChartOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useAppContext } from '../contexts/AppContext';
import { Exam, ExamSubmission } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { confirm } = Modal;

// 模拟考试数据
const mockAvailableExams: Exam[] = [
  {
    id: '1',
    title: '计算机网络期中考试',
    description: '本次考试涵盖计算机网络基本概念和网络层协议',
    courseId: 'course1',
    courseName: '计算机网络',
    creatorId: 'teacher1',
    creatorName: '李老师',
    status: 'published',
    duration: 90,
    startTime: moment().add(2, 'days').format(),
    endTime: moment().add(2, 'days').add(90, 'minutes').format(),
    totalScore: 100,
    passingScore: 60,
    questions: [],
    isRandomOrder: true,
    allowedRetries: 0,
    visibleToStudents: true
  },
  {
    id: '4',
    title: '算法分析基础测验',
    description: '检验学生对基本算法分析方法的掌握程度',
    courseId: 'course4',
    courseName: '算法分析',
    creatorId: 'teacher2',
    creatorName: '张老师',
    status: 'active',
    duration: 60,
    startTime: moment().format(),
    endTime: moment().add(60, 'minutes').format(),
    totalScore: 50,
    passingScore: 30,
    questions: [],
    isRandomOrder: true,
    allowedRetries: 0,
    visibleToStudents: true
  }
];

// 模拟已完成考试数据
const mockCompletedExams: ExamSubmission[] = [
  {
    id: 's1',
    examId: '2',
    studentId: 'student1',
    studentName: '张三',
    startTime: moment().subtract(5, 'days').format(),
    endTime: moment().subtract(5, 'days').add(110, 'minutes').format(),
    status: 'graded',
    answers: [],
    score: 85,
    graderId: 'teacher1',
    graderName: '李老师',
    gradingTime: moment().subtract(3, 'days').format(),
    gradingComments: '整体表现良好，对操作系统核心概念理解到位。'
  },
  {
    id: 's2',
    examId: '3',
    studentId: 'student1',
    studentName: '张三',
    startTime: moment().subtract(10, 'days').format(),
    endTime: moment().subtract(10, 'days').add(115, 'minutes').format(),
    status: 'graded',
    answers: [],
    score: 72,
    graderId: 'teacher2',
    graderName: '张老师',
    gradingTime: moment().subtract(8, 'days').format()
  }
];

// 模拟考试详情数据
const mockExamDetails: Record<string, Exam> = {
  '2': {
    id: '2',
    title: '操作系统期末考试',
    description: '本次考试内容包括进程管理、内存管理和文件系统',
    courseId: 'course2',
    courseName: '操作系统',
    creatorId: 'teacher1',
    creatorName: '李老师',
    status: 'ended',
    duration: 120,
    startTime: moment().subtract(5, 'days').format(),
    endTime: moment().subtract(5, 'days').add(120, 'minutes').format(),
    totalScore: 100,
    passingScore: 60,
    questions: [],
    isRandomOrder: true,
    allowedRetries: 0,
    visibleToStudents: true
  },
  '3': {
    id: '3',
    title: '数据结构期末考试',
    description: '考察各类数据结构的实现原理和应用场景',
    courseId: 'course3',
    courseName: '数据结构',
    creatorId: 'teacher2',
    creatorName: '张老师',
    status: 'ended',
    duration: 120,
    startTime: moment().subtract(10, 'days').format(),
    endTime: moment().subtract(10, 'days').add(120, 'minutes').format(),
    totalScore: 100,
    passingScore: 60,
    questions: [],
    isRandomOrder: false,
    allowedRetries: 1,
    visibleToStudents: true
  }
};

const StudentExams: React.FC = () => {
  const { user } = useAppContext();
  const navigate = useNavigate();
  
  const [availableExams, setAvailableExams] = useState<Exam[]>([]);
  const [completedExams, setCompletedExams] = useState<ExamSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [examDetailsVisible, setExamDetailsVisible] = useState(false);
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [currentSubmission, setCurrentSubmission] = useState<ExamSubmission | null>(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  
  // 加载考试数据
  useEffect(() => {
    // 在实际应用中，这里会从API获取数据
    setLoading(true);
    
    // 模拟API请求延迟
    setTimeout(() => {
      setAvailableExams(mockAvailableExams);
      setCompletedExams(mockCompletedExams);
      setLoading(false);
    }, 1000);
  }, []);
  
  // 查看考试结果详情
  const viewExamResult = (submission: ExamSubmission) => {
    setCurrentSubmission(submission);
    setCurrentExam(mockExamDetails[submission.examId]);
    setExamDetailsVisible(true);
  };
  
  // 开始考试
  const startExam = (exam: Exam) => {
    // 检查是否在考试时间内
    const now = moment();
    const startTime = moment(exam.startTime);
    const endTime = moment(exam.endTime);
    
    if (now.isBefore(startTime)) {
      Modal.info({
        title: '考试未开始',
        content: `该考试将于 ${startTime.format('YYYY-MM-DD HH:mm')} 开始，请届时参加。`
      });
      return;
    }
    
    if (now.isAfter(endTime)) {
      Modal.error({
        title: '考试已结束',
        content: `该考试已于 ${endTime.format('YYYY-MM-DD HH:mm')} 结束，无法参加。`
      });
      return;
    }
    
    // 确认开始考试
    confirm({
      title: '确认开始考试',
      icon: <ExclamationCircleOutlined />,
      content: `您即将开始"${exam.title}"考试，考试时间为${exam.duration}分钟。开始后将无法中断，请确保在安静的环境中完成考试。`,
      okText: '开始考试',
      cancelText: '取消',
      onOk() {
        // 实际应用中应该导航到考试页面
        navigate(`/exam-take/${exam.id}`);
      }
    });
  };
  
  // 根据考试状态获取标签颜色
  const getStatusColor = (exam: Exam) => {
    const now = moment();
    const startTime = moment(exam.startTime);
    const endTime = moment(exam.endTime);
    
    if (now.isBefore(startTime)) {
      return 'default';
    } else if (now.isAfter(startTime) && now.isBefore(endTime)) {
      return 'error';
    } else {
      return 'default';
    }
  };
  
  // 根据考试状态获取标签文本
  const getStatusText = (exam: Exam) => {
    const now = moment();
    const startTime = moment(exam.startTime);
    const endTime = moment(exam.endTime);
    
    if (now.isBefore(startTime)) {
      return '即将开始';
    } else if (now.isAfter(startTime) && now.isBefore(endTime)) {
      return '进行中';
    } else {
      return '已结束';
    }
  };
  
  // 渲染即将到来的考试
  const renderUpcomingExams = () => {
    const upcomingExams = availableExams.filter(exam => 
      moment().isBefore(moment(exam.endTime))
    );
    
    if (upcomingExams.length === 0) {
      return <Empty description="没有即将到来的考试" />;
    }
    
    return (
      <List
        itemLayout="vertical"
        dataSource={upcomingExams}
        renderItem={exam => {
          const now = moment();
          const startTime = moment(exam.startTime);
          const endTime = moment(exam.endTime);
          const isActive = now.isAfter(startTime) && now.isBefore(endTime);
          
          return (
            <List.Item
              actions={[
                <div key="time">
                  <ClockCircleOutlined /> 时长: {exam.duration}分钟
                </div>,
                <div key="score">
                  <TrophyOutlined /> 总分: {exam.totalScore}分
                </div>,
                <div key="passing">
                  <CheckCircleOutlined /> 及格分: {exam.passingScore}分
                </div>
              ]}
              extra={
                <Button 
                  type="primary" 
                  size="large"
                  disabled={!isActive}
                  onClick={() => startExam(exam)}
                >
                  {isActive ? '开始考试' : '查看详情'}
                </Button>
              }
            >
              <List.Item.Meta
                title={
                  <Space>
                    <Text strong style={{ fontSize: '16px' }}>{exam.title}</Text>
                    <Tag color={getStatusColor(exam)}>{getStatusText(exam)}</Tag>
                  </Space>
                }
                description={
                  <Space direction="vertical" size={0}>
                    <Text>{exam.description}</Text>
                    <Text type="secondary">
                      课程: {exam.courseName} | 教师: {exam.creatorName}
                    </Text>
                    <Text type="secondary">
                      考试时间: {moment(exam.startTime).format('YYYY-MM-DD HH:mm')} - {moment(exam.endTime).format('HH:mm')}
                    </Text>
                  </Space>
                }
              />
              
              {isActive && (
                <Alert 
                  message="考试正在进行中" 
                  description={`考试将于 ${moment(exam.endTime).format('HH:mm')} 结束，请尽快完成。`} 
                  type="warning" 
                  showIcon 
                  style={{ marginTop: 16 }}
                />
              )}
            </List.Item>
          );
        }}
      />
    );
  };
  
  // 渲染已完成的考试
  const renderCompletedExams = () => {
    if (completedExams.length === 0) {
      return <Empty description="没有已完成的考试" />;
    }
    
    return (
      <List
        itemLayout="vertical"
        dataSource={completedExams}
        renderItem={submission => {
          const scorePercent = (submission.score || 0) / (mockExamDetails[submission.examId]?.totalScore || 100) * 100;
          const isPassed = (submission.score || 0) >= (mockExamDetails[submission.examId]?.passingScore || 60);
          
          return (
            <List.Item
              actions={[
                <div key="submit-time">
                  <CalendarOutlined /> 提交时间: {moment(submission.endTime).format('YYYY-MM-DD HH:mm')}
                </div>,
                <div key="graded-by">
                  <UserOutlined /> 评分人: {submission.graderName || '自动评分'}
                </div>
              ]}
              extra={
                <Button 
                  type="primary" 
                  ghost
                  onClick={() => viewExamResult(submission)}
                >
                  查看详情
                </Button>
              }
            >
              <List.Item.Meta
                title={
                  <Space>
                    <Text strong style={{ fontSize: '16px' }}>{mockExamDetails[submission.examId]?.title}</Text>
                    <Tag color={isPassed ? 'success' : 'error'}>
                      {isPassed ? '已通过' : '未通过'}
                    </Tag>
                  </Space>
                }
                description={
                  <Space direction="vertical" size={0}>
                    <Text type="secondary">
                      课程: {mockExamDetails[submission.examId]?.courseName}
                    </Text>
                    <div style={{ marginTop: 8 }}>
                      <Space align="center" style={{ width: '100%' }}>
                        <Progress 
                          type="circle" 
                          percent={scorePercent} 
                          size={60}
                          format={() => <Text strong>{submission.score}</Text>}
                          status={isPassed ? 'success' : 'exception'}
                        />
                        <div>
                          <Text strong style={{ fontSize: '16px' }}>{submission.score} / {mockExamDetails[submission.examId]?.totalScore}分</Text>
                          <br />
                          <Text type="secondary">
                            及格线: {mockExamDetails[submission.examId]?.passingScore}分
                          </Text>
                        </div>
                      </Space>
                    </div>
                  </Space>
                }
              />
            </List.Item>
          );
        }}
      />
    );
  };
  
  // 定义Tabs的items数组
  const tabItems = [
    {
      key: 'upcoming',
      label: (
        <span>
          <ClockCircleOutlined />
          即将到来的考试
          <Badge 
            count={availableExams.filter(exam => moment().isBefore(moment(exam.endTime))).length} 
            style={{ marginLeft: 8 }} 
          />
        </span>
      ),
      children: loading ? <Skeleton active /> : renderUpcomingExams()
    },
    {
      key: 'completed',
      label: (
        <span>
          <CheckCircleOutlined />
          已完成的考试
          <Badge 
            count={completedExams.length} 
            style={{ marginLeft: 8 }} 
          />
        </span>
      ),
      children: loading ? <Skeleton active /> : renderCompletedExams()
    }
  ];
  
  return (
    <div className="student-exams">
      <Card variant="bordered">
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={tabItems}
          tabBarExtraContent={
            <Button 
              icon={<BarChartOutlined />}
              onClick={() => navigate('/student/exam-analytics')}
            >
              考试分析
            </Button>
          }
        />
      </Card>
      
      {/* 考试结果详情模态框 */}
      <Modal
        title="考试结果详情"
        open={examDetailsVisible}
        onCancel={() => setExamDetailsVisible(false)}
        footer={[
          <Button key="close" onClick={() => setExamDetailsVisible(false)}>
            关闭
          </Button>,
          <Button 
            key="analysis" 
            type="primary"
            onClick={() => {
              setExamDetailsVisible(false);
              navigate(`/student/exam-analysis/${currentSubmission?.id}`);
            }}
          >
            查看详细分析
          </Button>
        ]}
        width={700}
      >
        {currentExam && currentSubmission && (
          <div className="exam-result-details">
            <Result
              status={currentSubmission.score! >= currentExam.passingScore ? "success" : "error"}
              title={currentSubmission.score! >= currentExam.passingScore ? "考试通过" : "考试未通过"}
              subTitle={
                <Space direction="vertical">
                  <Text>您的得分: {currentSubmission.score} / {currentExam.totalScore}分</Text>
                  <Text type="secondary">及格分数: {currentExam.passingScore}分</Text>
                </Space>
              }
            />
            
            <Divider />
            
            <Descriptions title="考试信息" bordered column={1}>
              <Descriptions.Item label="考试名称">{currentExam.title}</Descriptions.Item>
              <Descriptions.Item label="考试描述">{currentExam.description}</Descriptions.Item>
              <Descriptions.Item label="课程">{currentExam.courseName}</Descriptions.Item>
              <Descriptions.Item label="教师">{currentExam.creatorName}</Descriptions.Item>
              <Descriptions.Item label="考试时间">
                {moment(currentExam.startTime).format('YYYY-MM-DD HH:mm')} - 
                {moment(currentExam.endTime).format('HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="您的提交时间">
                {moment(currentSubmission.endTime).format('YYYY-MM-DD HH:mm')}
              </Descriptions.Item>
              {currentSubmission.gradingComments && (
                <Descriptions.Item label="教师评语">
                  {currentSubmission.gradingComments}
                </Descriptions.Item>
              )}
            </Descriptions>
            
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Space size="large">
                <div>
                  <Paragraph>总题数</Paragraph>
                  <Title level={3}>{currentExam.questions.length || 'N/A'}</Title>
                </div>
                <div>
                  <Paragraph>正确率</Paragraph>
                  <Title level={3}>{Math.round((currentSubmission.score! / currentExam.totalScore) * 100)}%</Title>
                </div>
                <div>
                  <Paragraph>用时</Paragraph>
                  <Title level={3}>
                    {moment(currentSubmission.endTime).diff(moment(currentSubmission.startTime), 'minutes')}分钟
                  </Title>
                </div>
              </Space>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentExams; 