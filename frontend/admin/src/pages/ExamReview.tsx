import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Card, 
  Typography, 
  Tag, 
  Space, 
  Modal, 
  Form, 
  Input, 
  message,
  Tooltip,
  Badge,
  Descriptions,
  Avatar,
  Drawer
} from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  EyeOutlined,
  UserOutlined,
  FileTextOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { Exam, ExamStatus } from '../contexts/AppContext';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// 模拟待审核考试数据
const mockPendingExams: Exam[] = [
  {
    id: '2',
    title: '操作系统期末考试',
    description: '本次考试内容包括进程管理、内存管理和文件系统',
    courseId: 'course2',
    courseName: '操作系统',
    creatorId: 'teacher1',
    creatorName: '李老师',
    status: 'pending_review',
    duration: 120,
    startTime: '2023-12-15T09:00:00Z',
    endTime: '2023-12-15T11:00:00Z',
    totalScore: 100,
    passingScore: 60,
    questions: [
      {
        id: 'q1',
        content: '操作系统的主要功能是什么？',
        type: 'multiple_choice',
        options: [
          '资源管理',
          '进程管理',
          '设备管理',
          '文件管理'
        ],
        correctAnswer: ['资源管理', '进程管理', '设备管理', '文件管理'],
        score: 10,
        difficulty: 'medium'
      },
      {
        id: 'q2',
        content: '什么是死锁？',
        type: 'essay',
        score: 15,
        difficulty: 'hard'
      }
    ],
    isRandomOrder: true,
    allowedRetries: 0,
    visibleToStudents: false
  },
  {
    id: '6',
    title: '数据库原理期中测试',
    description: '考察SQL语句和数据库设计基础',
    courseId: 'course6',
    courseName: '数据库原理',
    creatorId: 'teacher3',
    creatorName: '陈老师',
    status: 'pending_review',
    duration: 90,
    startTime: '2023-12-10T10:00:00Z',
    endTime: '2023-12-10T11:30:00Z',
    totalScore: 100,
    passingScore: 60,
    questions: [
      {
        id: 'q1',
        content: '以下哪个是SQL的DML语句？',
        type: 'single_choice',
        options: [
          'CREATE TABLE',
          'INSERT INTO',
          'CREATE INDEX',
          'GRANT'
        ],
        correctAnswer: 'INSERT INTO',
        score: 5,
        difficulty: 'easy'
      }
    ],
    isRandomOrder: false,
    allowedRetries: 1,
    visibleToStudents: false
  }
];

const ExamReview: React.FC = () => {
  const { user } = useAppContext();
  const navigate = useNavigate();
  
  const [pendingExams, setPendingExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewVisible, setReviewVisible] = useState(false);
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [form] = Form.useForm();
  
  // 加载待审核考试数据
  useEffect(() => {
    // 在实际应用中，这里会从API获取数据
    setLoading(true);
    
    // 模拟API请求延迟
    setTimeout(() => {
      setPendingExams(mockPendingExams);
      setLoading(false);
    }, 1000);
  }, []);
  
  // 查看考试详情
  const handleViewExam = (exam: Exam) => {
    setCurrentExam(exam);
    setDrawerVisible(true);
  };
  
  // 打开审核模态框
  const handleOpenReview = (exam: Exam) => {
    setCurrentExam(exam);
    form.resetFields();
    setReviewVisible(true);
  };
  
  // 审核通过
  const handleApprove = () => {
    form.validateFields().then(values => {
      if (currentExam) {
        // 更新考试状态
        const updatedExams = pendingExams.filter(exam => exam.id !== currentExam.id);
        
        // 将审核通过的考试添加到已批准列表（在实际应用中应通过API更新）
        const approvedExam: Exam = {
          ...currentExam,
          status: 'approved',
          reviewerId: user?.id,
          reviewerName: user?.name,
          reviewTime: new Date().toISOString(),
          reviewComment: values.comment
        };
        
        // 更新状态
        setPendingExams(updatedExams);
        setReviewVisible(false);
        message.success('考试审核已通过');
      }
    });
  };
  
  // 审核拒绝
  const handleReject = () => {
    form.validateFields().then(values => {
      if (currentExam && values.comment) {
        // 更新考试状态（在实际应用中应通过API更新）
        const updatedExams = pendingExams.map(exam => 
          exam.id === currentExam.id
            ? { 
                ...exam, 
                status: 'draft', 
                reviewerId: user?.id,
                reviewerName: user?.name,
                reviewTime: new Date().toISOString(),
                reviewComment: values.comment
              }
            : exam
        );
        
        setPendingExams(updatedExams);
        setReviewVisible(false);
        message.success('考试审核已拒绝，已退回为草稿状态');
      } else {
        message.error('拒绝时必须提供审核意见');
      }
    });
  };
  
  // 表格列定义
  const columns = [
    {
      title: '考试名称',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Exam) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.courseName}</Text>
        </Space>
      )
    },
    {
      title: '创建人',
      dataIndex: 'creatorName',
      key: 'creatorName',
      render: (text: string) => (
        <Space>
          <Avatar icon={<UserOutlined />} size="small" />
          <Text>{text}</Text>
        </Space>
      )
    },
    {
      title: '考试时间',
      key: 'examTime',
      render: (text: string, record: Exam) => (
        <Space direction="vertical" size={0}>
          <Text>{moment(record.startTime).format('YYYY-MM-DD HH:mm')}</Text>
          <Text type="secondary">
            持续: {record.duration} 分钟
          </Text>
        </Space>
      )
    },
    {
      title: '题目数量',
      key: 'questionCount',
      render: (text: string, record: Exam) => (
        <Badge count={record.questions?.length || 0} showZero style={{ backgroundColor: '#52c41a' }} />
      )
    },
    {
      title: '分值',
      dataIndex: 'totalScore',
      key: 'totalScore',
      render: (score: number, record: Exam) => (
        <Space direction="vertical" size={0}>
          <Text>{score}分</Text>
          <Text type="secondary">及格: {record.passingScore}分</Text>
        </Space>
      )
    },
    {
      title: '提交时间',
      key: 'submitTime',
      render: () => (
        <Text>{moment().subtract(Math.floor(Math.random() * 24), 'hours').format('YYYY-MM-DD HH:mm')}</Text>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (text: string, record: Exam) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button 
              icon={<EyeOutlined />} 
              size="small" 
              onClick={() => handleViewExam(record)}
            />
          </Tooltip>
          
          <Tooltip title="审核">
            <Button 
              type="primary"
              size="small" 
              onClick={() => handleOpenReview(record)}
            >
              审核
            </Button>
          </Tooltip>
        </Space>
      )
    }
  ];
  
  // 渲染题目类型
  const renderQuestionType = (type: string) => {
    const typeMap: Record<string, string> = {
      'multiple_choice': '多选题',
      'single_choice': '单选题',
      'true_false': '判断题',
      'fill_blank': '填空题',
      'short_answer': '简答题',
      'essay': '论述题'
    };
    
    return typeMap[type] || type;
  };
  
  return (
    <div className="exam-review">
      <Card 
        title={
          <Space>
            <Badge count={pendingExams.length} style={{ backgroundColor: '#faad14' }} />
            <Text strong>待审核考试</Text>
          </Space>
        }
        className="pending-exams-card" 
        style={{ marginBottom: 16 }}
      >
        <Table 
          dataSource={pendingExams} 
          columns={columns} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
          loading={loading}
        />
      </Card>
      
      {/* 审核模态框 */}
      <Modal
        title="考试审核"
        open={reviewVisible}
        onCancel={() => setReviewVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setReviewVisible(false)}>
            取消
          </Button>,
          <Button 
            key="reject" 
            danger 
            icon={<CloseCircleOutlined />}
            onClick={handleReject}
          >
            拒绝
          </Button>,
          <Button 
            key="approve" 
            type="primary" 
            icon={<CheckCircleOutlined />}
            onClick={handleApprove}
          >
            通过
          </Button>
        ]}
        width={600}
      >
        {currentExam && (
          <>
            <Descriptions bordered size="small" column={1} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="考试名称">{currentExam.title}</Descriptions.Item>
              <Descriptions.Item label="课程">{currentExam.courseName}</Descriptions.Item>
              <Descriptions.Item label="创建人">{currentExam.creatorName}</Descriptions.Item>
              <Descriptions.Item label="考试时长">{currentExam.duration} 分钟</Descriptions.Item>
              <Descriptions.Item label="考试时间">
                {moment(currentExam.startTime).format('YYYY-MM-DD HH:mm')} - 
                {moment(currentExam.endTime).format('HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="总分">{currentExam.totalScore} 分</Descriptions.Item>
              <Descriptions.Item label="及格分数">{currentExam.passingScore} 分</Descriptions.Item>
              <Descriptions.Item label="随机顺序">{currentExam.isRandomOrder ? '是' : '否'}</Descriptions.Item>
              <Descriptions.Item label="允许重试次数">{currentExam.allowedRetries} 次</Descriptions.Item>
            </Descriptions>
            
            <Form form={form} layout="vertical">
              <Form.Item
                name="comment"
                label="审核意见"
                rules={[{ required: true, message: '请输入审核意见' }]}
              >
                <TextArea rows={4} placeholder="请输入审核意见..." />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
      
      {/* 考试详情抽屉 */}
      <Drawer
        title="考试详情"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={600}
      >
        {currentExam && (
          <div className="exam-detail">
            <Title level={4}>{currentExam.title}</Title>
            <Paragraph type="secondary">{currentExam.description}</Paragraph>
            
            <Descriptions bordered column={1} size="small" style={{ marginBottom: 24 }}>
              <Descriptions.Item label="课程">{currentExam.courseName}</Descriptions.Item>
              <Descriptions.Item label="创建人">{currentExam.creatorName}</Descriptions.Item>
              <Descriptions.Item label="考试时长">{currentExam.duration} 分钟</Descriptions.Item>
              <Descriptions.Item label="考试时间">
                {moment(currentExam.startTime).format('YYYY-MM-DD HH:mm')} - 
                {moment(currentExam.endTime).format('HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="总分">{currentExam.totalScore} 分</Descriptions.Item>
              <Descriptions.Item label="及格分数">{currentExam.passingScore} 分</Descriptions.Item>
              <Descriptions.Item label="随机顺序">{currentExam.isRandomOrder ? '是' : '否'}</Descriptions.Item>
              <Descriptions.Item label="允许重试次数">{currentExam.allowedRetries} 次</Descriptions.Item>
            </Descriptions>
            
            <Title level={5} style={{ marginTop: 16 }}>题目列表</Title>
            {currentExam.questions && currentExam.questions.length > 0 ? (
              currentExam.questions.map((question, index) => (
                <Card key={question.id} size="small" style={{ marginBottom: 16 }}>
                  <Space align="start">
                    <div>
                      <Badge count={index + 1} style={{ backgroundColor: '#1890ff' }} />
                    </div>
                    <div>
                      <Paragraph strong>{question.content}</Paragraph>
                      <Space>
                        <Tag color="blue">{renderQuestionType(question.type)}</Tag>
                        <Tag color="green">{question.score}分</Tag>
                        <Tag color={
                          question.difficulty === 'easy' ? 'green' : 
                          question.difficulty === 'medium' ? 'orange' : 'red'
                        }>
                          {
                            question.difficulty === 'easy' ? '简单' : 
                            question.difficulty === 'medium' ? '中等' : '困难'
                          }
                        </Tag>
                      </Space>
                      
                      {question.options && (
                        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                          {question.options.map((option, i) => (
                            <li key={i}>
                              {option}
                              {Array.isArray(question.correctAnswer) 
                                ? question.correctAnswer.includes(option) && ' ✓'
                                : question.correctAnswer === option && ' ✓'
                              }
                            </li>
                          ))}
                        </ul>
                      )}
                      
                      {!question.options && question.correctAnswer && (
                        <div style={{ marginTop: 8 }}>
                          <Text type="secondary">参考答案: </Text>
                          <Text>{
                            Array.isArray(question.correctAnswer) 
                              ? question.correctAnswer.join(', ')
                              : question.correctAnswer
                          }</Text>
                        </div>
                      )}
                    </div>
                  </Space>
                </Card>
              ))
            ) : (
              <Text type="secondary">没有题目</Text>
            )}
            
            <div style={{ marginTop: 24, textAlign: 'right' }}>
              <Button 
                type="primary" 
                onClick={() => {
                  setDrawerVisible(false);
                  handleOpenReview(currentExam);
                }}
              >
                进行审核
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default ExamReview; 