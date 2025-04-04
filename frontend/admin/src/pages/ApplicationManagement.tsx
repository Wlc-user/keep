import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Tag, Modal, Form, Space, Card, message, Tooltip, Tabs, Timeline, Typography, Descriptions, Badge } from 'antd';
import { 
  SearchOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  EyeOutlined,
  UserOutlined,
  BookOutlined,
  FileOutlined,
  CommentOutlined,
  ClockCircleOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons';
import PageHeader from '../components/PageHeader';
import apiService from '../services/api';

const { Option } = Select;
const { TabPane } = Tabs;
const { Text } = Typography;
const { TextArea } = Input;

// 申请状态枚举
enum ApplicationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

// 申请类型枚举
enum ApplicationType {
  TEACHER = 'teacher',
  COURSE = 'course',
  MATERIAL = 'material',
  ENROLLMENT = 'enrollment',  // 课程注册申请
  EXTENSION = 'extension',    // 作业延期申请
  CERTIFICATE = 'certificate', // 证书申请
  LEAVE = 'leave',            // 请假申请
  TRANSFER = 'transfer'       // 转班/转专业申请
}

// 申请优先级枚举
enum ApplicationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// 申请信息接口
interface Application {
  id: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  type: ApplicationType;
  title: string;
  content: string;
  status: ApplicationStatus;
  priority: ApplicationPriority;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;          // 截止日期
  reviewedAt?: string;
  reviewedBy?: string;
  reviewComment?: string;
  attachments?: string[];
  metadata?: Record<string, any>;
  approvalSteps?: ApprovalStep[]; // 多级审批步骤
}

// 审批步骤接口
interface ApprovalStep {
  id: string;
  stepName: string;
  approverRole: string;
  approverId?: string;
  approverName?: string;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  timestamp?: string;
}

// 模拟数据
const mockApplications: Application[] = [
  {
    id: '1',
    applicantId: 'T001',
    applicantName: '张教授',
    applicantEmail: 'zhang@example.com',
    type: ApplicationType.TEACHER,
    title: '教师资格申请',
    content: '本人拥有多年教学经验，希望能在平台上开设计算机科学相关课程。',
    status: ApplicationStatus.PENDING,
    priority: ApplicationPriority.MEDIUM,
    createdAt: '2023-03-10 09:15:30',
    updatedAt: '2023-03-10 09:15:30',
    metadata: {
      department: '计算机科学',
      title: '教授',
      experience: '10年'
    }
  },
  {
    id: '2',
    applicantId: 'T002',
    applicantName: '李博士',
    applicantEmail: 'li@example.com',
    type: ApplicationType.COURSE,
    title: '新课程发布申请',
    content: '申请发布《Python数据分析》课程，面向大二以上学生。',
    status: ApplicationStatus.APPROVED,
    createdAt: '2023-03-08 14:22:45',
    updatedAt: '2023-03-09 10:30:15',
    reviewedAt: '2023-03-09 10:30:15',
    reviewedBy: 'Admin',
    reviewComment: '课程内容丰富，符合平台要求，同意发布。',
    metadata: {
      courseName: 'Python数据分析',
      targetGrade: '大二以上',
      duration: '12周',
      lessons: 24
    }
  },
  {
    id: '3',
    applicantId: 'T003',
    applicantName: '王讲师',
    applicantEmail: 'wang@example.com',
    type: ApplicationType.TEACHER,
    title: '教师资格申请',
    content: '申请成为平台讲师，专注于人工智能领域的教学。',
    status: ApplicationStatus.REJECTED,
    createdAt: '2023-03-05 16:38:12',
    updatedAt: '2023-03-06 11:20:45',
    reviewedAt: '2023-03-06 11:20:45',
    reviewedBy: 'Admin',
    reviewComment: '教学经验不足，建议积累更多实践经验后再申请。',
    metadata: {
      department: '人工智能',
      title: '讲师',
      experience: '2年'
    }
  },
  {
    id: '4',
    applicantId: 'T004',
    applicantName: '赵老师',
    applicantEmail: 'zhao@example.com',
    type: ApplicationType.MATERIAL,
    title: '学习资料上传申请',
    content: '申请上传《Web前端开发实战》系列教程，包含视频和文档资料。',
    status: ApplicationStatus.APPROVED,
    createdAt: '2023-03-07 11:05:28',
    updatedAt: '2023-03-08 09:45:10',
    reviewedAt: '2023-03-08 09:45:10',
    reviewedBy: 'Admin',
    reviewComment: '资料质量高，同意上传。',
    metadata: {
      materialType: '视频+文档',
      fileCount: 15,
      totalSize: '2.5GB'
    }
  },
  {
    id: '5',
    applicantId: 'T005',
    applicantName: '钱教授',
    applicantEmail: 'qian@example.com',
    type: ApplicationType.COURSE,
    title: '新课程发布申请',
    content: '申请发布《网络安全基础》课程，面向所有专业学生。',
    status: ApplicationStatus.PENDING,
    createdAt: '2023-03-09 15:47:36',
    updatedAt: '2023-03-09 15:47:36',
    metadata: {
      courseName: '网络安全基础',
      targetGrade: '不限',
      duration: '8周',
      lessons: 16
    }
  },
  {
    id: '6',
    applicantId: 'S001',
    applicantName: '陈同学',
    applicantEmail: 'chen@student.com',
    type: ApplicationType.ENROLLMENT,
    title: '《高级数据结构》课程报名申请',
    content: '希望能够学习该课程，已经完成了基础数据结构和算法课程的学习。',
    status: ApplicationStatus.PENDING,
    priority: ApplicationPriority.MEDIUM,
    createdAt: '2023-03-12 10:25:36',
    updatedAt: '2023-03-12 10:25:36',
    dueDate: '2023-03-20 23:59:59',
    metadata: {
      studentId: 'S001',
      grade: '大三',
      major: '计算机科学',
      prerequisiteCourses: ['基础数据结构', '算法基础'],
      reason: '希望进一步提升算法能力'
    },
    approvalSteps: [
      {
        id: 'step1',
        stepName: '系统审核',
        approverRole: 'system',
        status: 'approved',
        comment: '学生资格审核通过',
        timestamp: '2023-03-12 10:26:00'
      },
      {
        id: 'step2',
        stepName: '课程老师审核',
        approverRole: 'teacher',
        status: 'pending'
      }
    ]
  },
  {
    id: '7',
    applicantId: 'S002',
    applicantName: '林同学',
    applicantEmail: 'lin@student.com',
    type: ApplicationType.EXTENSION,
    title: '《人工智能》课程作业延期申请',
    content: '因为生病住院，无法按时完成作业，希望能延期提交。',
    status: ApplicationStatus.APPROVED,
    priority: ApplicationPriority.HIGH,
    createdAt: '2023-03-11 16:45:22',
    updatedAt: '2023-03-12 09:10:45',
    reviewedAt: '2023-03-12 09:10:45',
    reviewedBy: '王教授',
    reviewComment: '已批准延期，请于3月25日前提交。',
    dueDate: '2023-03-14 23:59:59',
    metadata: {
      courseId: 'C105',
      courseName: '人工智能',
      assignmentId: 'A1052',
      assignmentTitle: '机器学习模型设计',
      originalDeadline: '2023-03-15 23:59:59',
      requestedDeadline: '2023-03-25 23:59:59',
      reason: '生病住院',
      attachments: ['医院证明.pdf']
    }
  },
  {
    id: '8',
    applicantId: 'S003',
    applicantName: '吴同学',
    applicantEmail: 'wu@student.com',
    type: ApplicationType.CERTIFICATE,
    title: '《Web全栈开发》课程证书申请',
    content: '已完成所有课程要求，申请获取课程证书。',
    status: ApplicationStatus.PENDING,
    priority: ApplicationPriority.LOW,
    createdAt: '2023-03-13 14:22:18',
    updatedAt: '2023-03-13 14:22:18',
    metadata: {
      courseId: 'C205',
      courseName: 'Web全栈开发',
      completionDate: '2023-03-10',
      finalGrade: 92,
      projectUrl: 'https://github.com/student/web-project'
    }
  },
  {
    id: '9',
    applicantId: 'S004',
    applicantName: '赵同学',
    applicantEmail: 'zhao@student.com',
    type: ApplicationType.LEAVE,
    title: '请假申请',
    content: '因家庭原因需请假一周，将错过《数据库系统》课程。',
    status: ApplicationStatus.REJECTED,
    priority: ApplicationPriority.URGENT,
    createdAt: '2023-03-10 09:05:12',
    updatedAt: '2023-03-10 15:30:40',
    reviewedAt: '2023-03-10 15:30:40',
    reviewedBy: '系统管理员',
    reviewComment: '请假时间过长，且该课程不允许缺勤。建议与授课老师单独沟通解决方案。',
    dueDate: '2023-03-11 23:59:59',
    metadata: {
      startDate: '2023-03-13',
      endDate: '2023-03-20',
      courseIds: ['C301'],
      reason: '家庭紧急情况'
    }
  },
  {
    id: '10',
    applicantId: 'S005',
    applicantName: '孙同学',
    applicantEmail: 'sun@student.com',
    type: ApplicationType.TRANSFER,
    title: '转班申请',
    content: '希望从《Python编程》A班转到B班，因为工作时间冲突。',
    status: ApplicationStatus.APPROVED,
    priority: ApplicationPriority.MEDIUM,
    createdAt: '2023-03-09 11:48:35',
    updatedAt: '2023-03-09 16:25:10',
    reviewedAt: '2023-03-09 16:25:10',
    reviewedBy: '刘老师',
    reviewComment: '已批准转班申请，请在下周一直接去B班上课。',
    metadata: {
      courseId: 'C105',
      courseName: 'Python编程',
      currentClass: 'A班 (周一下午2-4点)',
      targetClass: 'B班 (周三晚上7-9点)',
      reason: '工作时间冲突'
    }
  }
];

const ApplicationManagement: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [viewingApplication, setViewingApplication] = useState<Application | null>(null);
  const [reviewingApplication, setReviewingApplication] = useState<Application | null>(null);
  const [reviewForm] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<ApplicationType | ''>('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | ''>('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  // 获取申请数据
  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 尝试从API获取数据
      // const response = await apiService.applications.getAll();
      // setApplications(response.data);
      
      // 由于API可能未实现，使用模拟数据
      setTimeout(() => {
        setApplications(mockApplications);
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error('获取申请数据失败:', err);
      setError('获取申请数据失败，使用模拟数据');
      
      // 使用模拟数据作为后备
      setTimeout(() => {
        setApplications(mockApplications);
        setLoading(false);
      }, 1000);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // 处理查看申请详情
  const handleViewApplication = (application: Application) => {
    setViewingApplication(application);
    setDetailModalVisible(true);
  };

  // 处理审核申请
  const handleReviewApplication = (application: Application) => {
    setReviewingApplication(application);
    reviewForm.resetFields();
    setReviewModalVisible(true);
  };

  // 处理审核表单提交
  const handleReviewSubmit = async () => {
    try {
      const values = await reviewForm.validateFields();
      if (!reviewingApplication) return;
      
      const { status, comment } = values;
      
      setLoading(true);
      
      try {
        // 尝试调用API
        // await apiService.applications.review(reviewingApplication.id, status, comment);
        
        // 模拟API调用成功
        const updatedApplications = applications.map(item => {
          if (item.id === reviewingApplication.id) {
            return {
              ...item,
              status,
              reviewComment: comment,
              reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
              reviewedBy: 'Admin',
              updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
            };
          }
          return item;
        });
        
        setApplications(updatedApplications);
        message.success(`申请${status === ApplicationStatus.APPROVED ? '通过' : '拒绝'}成功`);
        setReviewModalVisible(false);
      } catch (err) {
        console.error('审核申请失败:', err);
        message.error('审核申请失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    } catch (err) {
      console.error('表单验证失败:', err);
    }
  };

  // 获取状态标签
  const getStatusTag = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.APPROVED:
        return <Tag color="success">已通过</Tag>;
      case ApplicationStatus.REJECTED:
        return <Tag color="error">已拒绝</Tag>;
      case ApplicationStatus.PENDING:
        return <Tag color="processing">待审核</Tag>;
      default:
        return null;
    }
  };

  // 获取类型标签
  const getTypeTag = (type: ApplicationType) => {
    switch (type) {
      case ApplicationType.TEACHER:
        return <Tag color="blue">教师申请</Tag>;
      case ApplicationType.COURSE:
        return <Tag color="green">课程申请</Tag>;
      case ApplicationType.MATERIAL:
        return <Tag color="purple">资料申请</Tag>;
      case ApplicationType.ENROLLMENT:
        return <Tag color="cyan">课程报名</Tag>;
      case ApplicationType.EXTENSION:
        return <Tag color="orange">延期申请</Tag>;
      case ApplicationType.CERTIFICATE:
        return <Tag color="gold">证书申请</Tag>;
      case ApplicationType.LEAVE:
        return <Tag color="magenta">请假申请</Tag>;
      case ApplicationType.TRANSFER:
        return <Tag color="lime">转班申请</Tag>;
      default:
        return <Tag>未知类型</Tag>;
    }
  };

  // 获取类型图标
  const getTypeIcon = (type: ApplicationType) => {
    switch (type) {
      case ApplicationType.TEACHER:
        return <UserOutlined style={{ color: '#1890ff' }} />;
      case ApplicationType.COURSE:
        return <BookOutlined style={{ color: '#52c41a' }} />;
      case ApplicationType.MATERIAL:
        return <FileOutlined style={{ color: '#722ed1' }} />;
      case ApplicationType.ENROLLMENT:
        return <BookOutlined style={{ color: '#13c2c2' }} />;
      case ApplicationType.EXTENSION:
        return <ClockCircleOutlined style={{ color: '#fa8c16' }} />;
      case ApplicationType.CERTIFICATE:
        return <FileOutlined style={{ color: '#faad14' }} />;
      case ApplicationType.LEAVE:
        return <ClockCircleOutlined style={{ color: '#eb2f96' }} />;
      case ApplicationType.TRANSFER:
        return <UserOutlined style={{ color: '#a0d911' }} />;
      default:
        return <FileOutlined />;
    }
  };

  // 过滤申请数据
  const getFilteredApplications = () => {
    let filtered = applications;
    
    // 根据标签页过滤
    if (activeTab !== 'all') {
      filtered = filtered.filter(app => app.status === activeTab);
    }
    
    // 根据搜索文本过滤
    if (searchText) {
      filtered = filtered.filter(app => 
        app.applicantName.includes(searchText) || 
        app.title.includes(searchText) || 
        app.content.includes(searchText)
      );
    }
    
    // 根据类型过滤
    if (typeFilter) {
      filtered = filtered.filter(app => app.type === typeFilter);
    }
    
    // 根据状态过滤
    if (statusFilter) {
      filtered = filtered.filter(app => app.status === statusFilter);
    }
    
    return filtered;
  };

  // 表格列定义
  const columns = [
    {
      title: '申请类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: ApplicationType) => getTypeTag(type)
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: '申请人',
      dataIndex: 'applicantName',
      key: 'applicantName'
    },
    {
      title: '申请时间',
      dataIndex: 'createdAt',
      key: 'createdAt'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: ApplicationStatus) => getStatusTag(status)
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Application) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handleViewApplication(record)}
            />
          </Tooltip>
          {record.status === ApplicationStatus.PENDING && (
            <>
              <Tooltip title="通过">
                <Button 
                  type="text" 
                  icon={<CheckCircleOutlined />} 
                  style={{ color: '#52c41a' }}
                  onClick={() => handleReviewApplication(record)}
                />
              </Tooltip>
              <Tooltip title="拒绝">
                <Button 
                  type="text" 
                  icon={<CloseCircleOutlined />} 
                  danger
                  onClick={() => handleReviewApplication(record)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      )
    }
  ];

  // 渲染申请详情
  const renderApplicationDetail = (application: Application) => {
    return (
      <div>
        <div style={{ display: 'flex', marginBottom: 24, alignItems: 'center' }}>
          <div style={{ marginRight: 16 }}>
            {getTypeIcon(application.type)}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ marginBottom: 8 }}>{application.title}</h2>
            <div>
              {getTypeTag(application.type)}
              {getStatusTag(application.status)}
            </div>
          </div>
        </div>

        <Descriptions title="基本信息" bordered column={2} style={{ marginBottom: 24 }}>
          <Descriptions.Item label="申请人">{application.applicantName}</Descriptions.Item>
          <Descriptions.Item label="申请人邮箱">{application.applicantEmail}</Descriptions.Item>
          <Descriptions.Item label="申请时间">{application.createdAt}</Descriptions.Item>
          <Descriptions.Item label="最后更新">{application.updatedAt}</Descriptions.Item>
          {application.reviewedAt && (
            <Descriptions.Item label="审核时间">{application.reviewedAt}</Descriptions.Item>
          )}
          {application.reviewedBy && (
            <Descriptions.Item label="审核人">{application.reviewedBy}</Descriptions.Item>
          )}
        </Descriptions>

        <Card title="申请内容" style={{ marginBottom: 24 }}>
          <div style={{ whiteSpace: 'pre-wrap' }}>{application.content}</div>
        </Card>

        {application.metadata && (
          <Card title="附加信息" style={{ marginBottom: 24 }}>
            <Descriptions bordered column={2}>
              {Object.entries(application.metadata).map(([key, value]) => (
                <Descriptions.Item key={key} label={key}>{value}</Descriptions.Item>
              ))}
            </Descriptions>
          </Card>
        )}

        {application.reviewComment && (
          <Card title="审核意见" style={{ marginBottom: 24 }}>
            <div style={{ whiteSpace: 'pre-wrap' }}>{application.reviewComment}</div>
          </Card>
        )}

        <Timeline style={{ marginTop: 24 }}>
          <Timeline.Item color="blue">
            <p>
              <Text strong>{application.applicantName}</Text> 提交了申请
              <Text type="secondary" style={{ marginLeft: 8 }}>{application.createdAt}</Text>
            </p>
          </Timeline.Item>
          {application.status !== ApplicationStatus.PENDING && (
            <Timeline.Item 
              color={application.status === ApplicationStatus.APPROVED ? 'green' : 'red'}
              dot={application.status === ApplicationStatus.APPROVED ? <CheckOutlined /> : <CloseOutlined />}
            >
              <p>
                <Text strong>{application.reviewedBy}</Text> 
                {application.status === ApplicationStatus.APPROVED ? ' 通过了申请' : ' 拒绝了申请'}
                <Text type="secondary" style={{ marginLeft: 8 }}>{application.reviewedAt}</Text>
              </p>
              {application.reviewComment && (
                <p style={{ color: '#666' }}>"{application.reviewComment}"</p>
              )}
            </Timeline.Item>
          )}
        </Timeline>
      </div>
    );
  };

  return (
    <div>
      <PageHeader 
        title="申请审核" 
        subtitle="管理系统中的各类申请" 
      />

      {error && (
        <Card style={{ marginBottom: 16, backgroundColor: '#fff2f0' }}>
          <div style={{ color: '#f5222d' }}>{error}</div>
        </Card>
      )}

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        tabBarExtraContent={
          <Badge count={applications.filter(app => app.status === ApplicationStatus.PENDING).length} style={{ marginRight: 16 }}>
            <span>待审核</span>
          </Badge>
        }
        items={[
          {
            key: 'all',
            label: '全部申请'
          },
          {
            key: ApplicationStatus.PENDING,
            label: '待审核'
          },
          {
            key: ApplicationStatus.APPROVED,
            label: '已通过'
          },
          {
            key: ApplicationStatus.REJECTED,
            label: '已拒绝'
          }
        ]}
      />

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="搜索申请"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 200 }}
            prefix={<SearchOutlined />}
          />
          <Select
            placeholder="类型筛选"
            style={{ width: 150 }}
            value={typeFilter}
            onChange={value => setTypeFilter(value)}
            allowClear
          >
            <Option value={ApplicationType.TEACHER}>教师申请</Option>
            <Option value={ApplicationType.COURSE}>课程发布</Option>
            <Option value={ApplicationType.MATERIAL}>素材上传</Option>
          </Select>
          <Select
            placeholder="状态筛选"
            style={{ width: 120 }}
            value={statusFilter}
            onChange={value => setStatusFilter(value)}
            allowClear
          >
            <Option value={ApplicationStatus.PENDING}>待审核</Option>
            <Option value={ApplicationStatus.APPROVED}>已通过</Option>
            <Option value={ApplicationStatus.REJECTED}>已拒绝</Option>
          </Select>
        </Space>
      </Card>

      <Card>
        <Table 
          dataSource={getFilteredApplications()} 
          columns={columns} 
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showTotal: total => `共 ${total} 条记录`
          }}
        />
      </Card>

      {/* 申请详情模态框 */}
      <Modal
        title="申请详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
          viewingApplication?.status === ApplicationStatus.PENDING && (
            <Button 
              key="review" 
              type="primary" 
              onClick={() => {
                setDetailModalVisible(false);
                if (viewingApplication) {
                  handleReviewApplication(viewingApplication);
                }
              }}
            >
              审核
            </Button>
          )
        ].filter(Boolean)}
        width={800}
      >
        {viewingApplication && renderApplicationDetail(viewingApplication)}
      </Modal>

      {/* 审核申请模态框 */}
      <Modal
        title="审核申请"
        open={reviewModalVisible}
        onCancel={() => setReviewModalVisible(false)}
        onOk={handleReviewSubmit}
        okText="提交"
        cancelText="取消"
        width={600}
      >
        {reviewingApplication && (
          <Form 
            form={reviewForm} 
            layout="vertical"
            initialValues={{ status: ApplicationStatus.APPROVED }}
          >
            <div style={{ marginBottom: 16 }}>
              <h3>{reviewingApplication.title}</h3>
              <p>申请人: {reviewingApplication.applicantName}</p>
              <p>申请类型: {getTypeTag(reviewingApplication.type)}</p>
            </div>
            
            <Form.Item
              name="status"
              label="审核结果"
              rules={[{ required: true, message: '请选择审核结果' }]}
            >
              <Select>
                <Option value={ApplicationStatus.APPROVED}>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} /> 通过
                </Option>
                <Option value={ApplicationStatus.REJECTED}>
                  <CloseCircleOutlined style={{ color: '#f5222d' }} /> 拒绝
                </Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="comment"
              label="审核意见"
              rules={[{ required: true, message: '请输入审核意见' }]}
            >
              <TextArea rows={4} placeholder="请输入审核意见" />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default ApplicationManagement; 