import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Space, 
  Button, 
  Upload, 
  message, 
  Form, 
  Input, 
  Divider, 
  Tag, 
  Steps, 
  Row, 
  Col,
  List,
  Avatar,
  Progress,
  Alert,
  Descriptions,
  Collapse,
  Badge
} from 'antd';
import { 
  UploadOutlined, 
  DownloadOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  FileOutlined,
  UserOutlined,
  CommentOutlined,
  StarOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Step } = Steps;
const { Panel } = Collapse;

// 作业状态类型
type AssignmentStatus = 'not_started' | 'in_progress' | 'submitted' | 'graded';

// 作业类型
type AssignmentType = 'essay' | 'quiz' | 'project' | 'code' | 'other';

// 作业接口
interface Assignment {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseName: string;
  type: AssignmentType;
  status: AssignmentStatus;
  startDate: string;
  endDate: string;
  totalPoints: number;
  attachments?: string[];
  submissionDate?: string;
  grade?: number;
  feedback?: string;
  teacherName?: string;
  submissionFiles?: string[];
  submissionText?: string;
}

// 模拟作业数据
const mockAssignment: Assignment = {
  id: '1',
  title: '人工智能导论期中作业',
  description: '完成一篇关于人工智能发展历史和现状的研究报告，字数不少于3000字。\n\n要求：\n1. 介绍人工智能的发展历史和主要里程碑\n2. 分析当前人工智能的主要应用领域\n3. 探讨人工智能技术面临的挑战和未来发展趋势\n4. 参考至少5篇学术文献，并按照规范格式引用',
  courseId: '1',
  courseName: '人工智能导论',
  type: 'essay',
  status: 'not_started',
  startDate: '2023-03-10',
  endDate: '2023-04-15',
  totalPoints: 100,
  attachments: ['作业要求.pdf', '参考资料.zip']
};

// 模拟已提交作业数据
const mockSubmittedAssignment: Assignment = {
  ...mockAssignment,
  status: 'submitted',
  submissionDate: '2023-04-10',
  submissionFiles: ['研究报告.pdf'],
  submissionText: '这是我的人工智能研究报告，主要探讨了人工智能的发展历史、现状和未来趋势。'
};

// 模拟已评分作业数据
const mockGradedAssignment: Assignment = {
  ...mockSubmittedAssignment,
  status: 'graded',
  grade: 85,
  feedback: '报告整体结构清晰，内容丰富，对人工智能的历史和现状分析到位。但在未来趋势的探讨部分稍显不足，可以更深入地分析技术发展方向。参考文献引用格式有些问题，请注意学术规范。',
  teacherName: '张教授'
};

interface AssignmentParams {
  assignmentId: string;
}

const StudentAssignmentSubmission: React.FC = () => {
  const { assignmentId } = useParams<AssignmentParams>();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // 获取作业数据
  useEffect(() => {
    setLoading(true);
    // 模拟API请求
    setTimeout(() => {
      // 根据不同状态展示不同数据，这里仅作演示
      const status = Math.floor(Math.random() * 3); // 0: not_started, 1: submitted, 2: graded
      if (status === 0) {
        setAssignment(mockAssignment);
      } else if (status === 1) {
        setAssignment(mockSubmittedAssignment);
      } else {
        setAssignment(mockGradedAssignment);
      }
      setLoading(false);
    }, 1000);
  }, [assignmentId]);

  // 处理文件上传变化
  const handleUploadChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  // 处理作业提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      
      // 模拟API请求
      setTimeout(() => {
        // 更新作业状态
        if (assignment) {
          setAssignment({
            ...assignment,
            status: 'submitted',
            submissionDate: new Date().toISOString().split('T')[0],
            submissionText: values.submissionText,
            submissionFiles: fileList.map(file => file.name)
          });
        }
        
        setSubmitting(false);
        message.success('作业提交成功');
      }, 1500);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 处理下载附件
  const handleDownload = (fileName: string) => {
    message.success(`开始下载: ${fileName}`);
    // 这里应该触发文件下载
  };

  // 获取作业状态步骤
  const getAssignmentSteps = () => {
    const steps = [
      {
        title: '未开始',
        status: 'finish' // 当前显示页面时，至少是已经查看了作业
      },
      {
        title: '进行中',
        status: assignment?.status === 'not_started' ? 'process' : 'finish'
      },
      {
        title: '已提交',
        status: assignment?.status === 'submitted' || assignment?.status === 'graded' ? 'finish' : 'wait'
      },
      {
        title: '已评分',
        status: assignment?.status === 'graded' ? 'finish' : 'wait'
      }
    ];
    
    return steps;
  };

  // 获取截止日期状态
  const getDeadlineStatus = () => {
    if (!assignment) return null;
    
    const now = new Date();
    const deadline = new Date(assignment.endDate);
    const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return <Tag color="error">已截止</Tag>;
    } else if (diffDays === 0) {
      return <Tag color="warning">今日截止</Tag>;
    } else if (diffDays <= 3) {
      return <Tag color="warning">还剩 {diffDays} 天</Tag>;
    } else {
      return <Tag color="success">还剩 {diffDays} 天</Tag>;
    }
  };

  // 获取作业类型标签
  const getTypeTag = (type: AssignmentType) => {
    switch (type) {
      case 'essay':
        return <Tag color="blue">论文</Tag>;
      case 'quiz':
        return <Tag color="green">测验</Tag>;
      case 'project':
        return <Tag color="purple">项目</Tag>;
      case 'code':
        return <Tag color="magenta">代码</Tag>;
      case 'other':
        return <Tag color="default">其他</Tag>;
      default:
        return null;
    }
  };

  // 获取作业状态标签
  const getStatusTag = (status: AssignmentStatus) => {
    switch (status) {
      case 'not_started':
        return <Tag color="default">未开始</Tag>;
      case 'in_progress':
        return <Tag color="processing">进行中</Tag>;
      case 'submitted':
        return <Tag color="success">已提交</Tag>;
      case 'graded':
        return <Tag color="blue">已评分</Tag>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card loading={true}>
        <div style={{ height: 400 }}></div>
      </Card>
    );
  }

  if (!assignment) {
    return (
      <Card>
        <Alert
          message="作业不存在"
          description="无法找到该作业，请返回作业列表查看其他作业。"
          type="error"
          showIcon
          action={
            <Button type="primary" onClick={() => navigate('/student/dashboard')}>
              返回仪表盘
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <div>
      <Button 
        type="link" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/student/dashboard')}
        style={{ marginBottom: 16, padding: 0 }}
      >
        返回仪表盘
      </Button>
      
      <Card>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Row>
            <Col span={16}>
              <Title level={2}>{assignment.title}</Title>
              <Space>
                <Link to={`/student/courses/${assignment.courseId}`}>
                  {assignment.courseName}
                </Link>
                {getTypeTag(assignment.type)}
                {getStatusTag(assignment.status)}
                {getDeadlineStatus()}
              </Space>
            </Col>
            <Col span={8} style={{ textAlign: 'right' }}>
              {assignment.status === 'graded' && (
                <div>
                  <Title level={1} style={{ color: '#52c41a' }}>
                    {assignment.grade} <Text type="secondary" style={{ fontSize: '16px' }}>/ {assignment.totalPoints}</Text>
                  </Title>
                  <Progress 
                    percent={Math.round((assignment.grade || 0) / assignment.totalPoints * 100)} 
                    status="success" 
                    style={{ marginBottom: 16 }}
                  />
                </div>
              )}
            </Col>
          </Row>
          
          <Divider />
          
          <Steps current={getAssignmentSteps().findIndex(step => step.status === 'process')} items={getAssignmentSteps()} />
          
          <Divider />
          
          <Row gutter={24}>
            <Col span={16}>
              <Card title="作业详情" variant="borderless">
                <Paragraph style={{ whiteSpace: 'pre-line' }}>
                  {assignment.description}
                </Paragraph>
                
                {assignment.attachments && assignment.attachments.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <Title level={5}>附件</Title>
                    <List
                      itemLayout="horizontal"
                      dataSource={assignment.attachments}
                      renderItem={item => (
                        <List.Item
                          actions={[
                            <Button 
                              type="link" 
                              icon={<DownloadOutlined />} 
                              onClick={() => handleDownload(item)}
                            >
                              下载
                            </Button>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={<Avatar icon={<FileOutlined />} />}
                            title={item}
                          />
                        </List.Item>
                      )}
                    />
                  </div>
                )}
                
                {assignment.status === 'submitted' && (
                  <div style={{ marginTop: 24 }}>
                    <Alert
                      message="作业已提交"
                      description={`您已于 ${assignment.submissionDate} 提交了作业，请等待教师批改。`}
                      type="success"
                      showIcon
                    />
                  </div>
                )}
                
                {assignment.status === 'graded' && (
                  <div style={{ marginTop: 24 }}>
                    <Title level={5}>教师评语</Title>
                    <Card>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Space>
                          <Avatar icon={<UserOutlined />} />
                          <Text strong>{assignment.teacherName}</Text>
                        </Space>
                        <Paragraph>{assignment.feedback}</Paragraph>
                        <div>
                          <Text type="secondary">评分: </Text>
                          <Text strong>{assignment.grade}</Text>
                          <Text type="secondary"> / {assignment.totalPoints}</Text>
                        </div>
                      </Space>
                    </Card>
                  </div>
                )}
              </Card>
              
              {(assignment.status === 'not_started' || assignment.status === 'in_progress') && (
                <Card title="提交作业" variant="borderless" style={{ marginTop: 16 }}>
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                  >
                    <Form.Item
                      name="submissionText"
                      label="作业内容"
                      rules={[{ required: true, message: '请输入作业内容' }]}
                    >
                      <TextArea rows={6} placeholder="请输入您的作业内容..." />
                    </Form.Item>
                    
                    <Form.Item
                      name="submissionFiles"
                      label="上传文件"
                    >
                      <Upload
                        fileList={fileList}
                        onChange={handleUploadChange}
                        multiple
                      >
                        <Button icon={<UploadOutlined />}>选择文件</Button>
                      </Upload>
                    </Form.Item>
                    
                    <Form.Item>
                      <Button 
                        type="primary" 
                        htmlType="submit" 
                        loading={submitting}
                      >
                        提交作业
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>
              )}
              
              {(assignment.status === 'submitted' || assignment.status === 'graded') && (
                <Card title="我的提交" variant="borderless" style={{ marginTop: 16 }}>
                  <Descriptions bordered column={1}>
                    <Descriptions.Item label="提交时间">{assignment.submissionDate}</Descriptions.Item>
                    <Descriptions.Item label="提交内容">{assignment.submissionText}</Descriptions.Item>
                  </Descriptions>
                  
                  {assignment.submissionFiles && assignment.submissionFiles.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                      <Title level={5}>提交的文件</Title>
                      <List
                        itemLayout="horizontal"
                        dataSource={assignment.submissionFiles}
                        renderItem={item => (
                          <List.Item>
                            <List.Item.Meta
                              avatar={<Avatar icon={<FileOutlined />} />}
                              title={item}
                            />
                          </List.Item>
                        )}
                      />
                    </div>
                  )}
                </Card>
              )}
            </Col>
            
            <Col span={8}>
              <Card title="作业信息" variant="borderless">
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="课程">{assignment.courseName}</Descriptions.Item>
                  <Descriptions.Item label="类型">{assignment.type}</Descriptions.Item>
                  <Descriptions.Item label="开始日期">{assignment.startDate}</Descriptions.Item>
                  <Descriptions.Item label="截止日期">{assignment.endDate}</Descriptions.Item>
                  <Descriptions.Item label="总分">{assignment.totalPoints}</Descriptions.Item>
                  <Descriptions.Item label="状态">
                    {getStatusTag(assignment.status)}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
              
              <Card title="提交指南" variant="borderless" style={{ marginTop: 16 }}>
                <Collapse defaultActiveKey={['1']}>
                  <Panel header="如何获得高分" key="1">
                    <ul>
                      <li>仔细阅读作业要求，确保覆盖所有要点</li>
                      <li>提供充分的论据和例子支持您的观点</li>
                      <li>注意文档格式和引用规范</li>
                      <li>提前完成，留出时间检查和修改</li>
                    </ul>
                  </Panel>
                  <Panel header="常见问题" key="2">
                    <ul>
                      <li><strong>Q: 可以提交多个文件吗？</strong><br />A: 可以，您可以上传多个文件。</li>
                      <li><strong>Q: 提交后可以修改吗？</strong><br />A: 在截止日期前，您可以重新提交。</li>
                      <li><strong>Q: 什么时候能看到评分？</strong><br />A: 教师批改后，您将收到通知。</li>
                    </ul>
                  </Panel>
                </Collapse>
              </Card>
            </Col>
          </Row>
        </Space>
      </Card>
    </div>
  );
};

export default StudentAssignmentSubmission; 