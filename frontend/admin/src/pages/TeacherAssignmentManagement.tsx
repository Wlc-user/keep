import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Table, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Upload, 
  message,
  Tooltip,
  Popconfirm,
  Typography,
  Row,
  Col,
  Statistic,
  Progress,
  Tabs,
  Alert,
  Radio,
  Switch,
  InputNumber,
  Dropdown,
  Menu,
  Modal as AntModal
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  UploadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileOutlined,
  BookOutlined,
  TeamOutlined,
  FormOutlined,
  ExportOutlined,
  DownOutlined,
  CheckOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  CopyOutlined,
  SendOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import type { RcFile, UploadProps } from 'antd/es/upload';
import type { UploadFile } from 'antd/es/upload/interface';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// 作业状态类型
type AssignmentStatus = 'draft' | 'published' | 'expired' | 'grading' | 'completed';

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
  submissionCount: number;
  totalStudents: number;
  gradedCount: number;
  createdAt: string;
  attachments?: string[];
  allowLateSubmission: boolean;
  latePenalty: number;
  allowResubmission: boolean;
  maxResubmissions: number;
  passingScore: number;
  visibleToStudents: boolean;
  gradingCriteria?: string;
  estimatedTime?: number;
  tags?: string[];
  groupAssignment: boolean;
  maxGroupSize?: number;
}

// 课程接口
interface Course {
  id: string;
  title: string;
  enrolledStudents: number;
}

// 模拟课程数据
const mockCourses: Course[] = [
  {
    id: '1',
    title: '人工智能导论',
    enrolledStudents: 45
  },
  {
    id: '2',
    title: '机器学习基础',
    enrolledStudents: 38
  },
  {
    id: '3',
    title: '深度学习实践',
    enrolledStudents: 30
  },
  {
    id: '4',
    title: '数据挖掘技术',
    enrolledStudents: 42
  }
];

// 模拟作业数据
const mockAssignments: Assignment[] = [
  {
    id: '1',
    title: '人工智能发展历史研究',
    description: '完成一篇关于人工智能发展历史和现状的研究报告，字数不少于3000字。',
    courseId: '1',
    courseName: '人工智能导论',
    type: 'essay',
    status: 'published',
    startDate: '2023-03-10',
    endDate: '2023-04-15',
    totalPoints: 100,
    submissionCount: 30,
    totalStudents: 45,
    gradedCount: 20,
    createdAt: '2023-03-05',
    attachments: ['作业要求.pdf', '参考资料.zip'],
    allowLateSubmission: false,
    latePenalty: 10,
    allowResubmission: false,
    maxResubmissions: 1,
    passingScore: 60,
    visibleToStudents: true,
    gradingCriteria: '根据研究报告的质量和深度评分',
    estimatedTime: 60,
    tags: ['重要', '期中'],
    groupAssignment: false,
    maxGroupSize: 4
  },
  {
    id: '2',
    title: '机器学习算法实现',
    description: '实现三种基本的机器学习算法，并在给定数据集上进行测试和评估。',
    courseId: '2',
    courseName: '机器学习基础',
    type: 'code',
    status: 'published',
    startDate: '2023-03-15',
    endDate: '2023-04-20',
    totalPoints: 100,
    submissionCount: 25,
    totalStudents: 38,
    gradedCount: 15,
    createdAt: '2023-03-08',
    attachments: ['算法说明.pdf', '测试数据集.zip'],
    allowLateSubmission: false,
    latePenalty: 10,
    allowResubmission: false,
    maxResubmissions: 1,
    passingScore: 60,
    visibleToStudents: true,
    gradingCriteria: '根据算法实现的质量和测试结果评分',
    estimatedTime: 60,
    tags: ['重要', '期中'],
    groupAssignment: false,
    maxGroupSize: 4
  },
  {
    id: '3',
    title: '神经网络模型设计',
    description: '设计一个神经网络模型解决图像分类问题，并提交代码和报告。',
    courseId: '3',
    courseName: '深度学习实践',
    type: 'project',
    status: 'draft',
    startDate: '2023-04-01',
    endDate: '2023-05-15',
    totalPoints: 100,
    submissionCount: 0,
    totalStudents: 30,
    gradedCount: 0,
    createdAt: '2023-03-20',
    attachments: [],
    allowLateSubmission: false,
    latePenalty: 10,
    allowResubmission: false,
    maxResubmissions: 1,
    passingScore: 60,
    visibleToStudents: true,
    gradingCriteria: '根据模型设计、实现和评估结果评分',
    estimatedTime: 60,
    tags: ['重要', '期末'],
    groupAssignment: false,
    maxGroupSize: 4
  },
  {
    id: '4',
    title: '数据挖掘期中测验',
    description: '完成数据挖掘相关概念和算法的在线测验。',
    courseId: '4',
    courseName: '数据挖掘技术',
    type: 'quiz',
    status: 'completed',
    startDate: '2023-03-20',
    endDate: '2023-03-20',
    totalPoints: 50,
    submissionCount: 40,
    totalStudents: 42,
    gradedCount: 40,
    createdAt: '2023-03-15',
    attachments: [],
    allowLateSubmission: false,
    latePenalty: 10,
    allowResubmission: false,
    maxResubmissions: 1,
    passingScore: 60,
    visibleToStudents: true,
    gradingCriteria: '根据测验结果评分',
    estimatedTime: 60,
    tags: ['重要', '期中'],
    groupAssignment: false,
    maxGroupSize: 4
  },
  {
    id: '5',
    title: '关联规则挖掘实验',
    description: '使用Apriori算法进行关联规则挖掘，并撰写实验报告。',
    courseId: '4',
    courseName: '数据挖掘技术',
    type: 'project',
    status: 'grading',
    startDate: '2023-03-25',
    endDate: '2023-04-10',
    totalPoints: 100,
    submissionCount: 38,
    totalStudents: 42,
    gradedCount: 20,
    createdAt: '2023-03-18',
    attachments: ['实验指导.pdf'],
    allowLateSubmission: false,
    latePenalty: 10,
    allowResubmission: false,
    maxResubmissions: 1,
    passingScore: 60,
    visibleToStudents: true,
    gradingCriteria: '根据实验报告的质量和结果评分',
    estimatedTime: 60,
    tags: ['重要', '期末'],
    groupAssignment: false,
    maxGroupSize: 4
  }
];

const TeacherAssignmentManagement: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [batchLoading, setBatchLoading] = useState<boolean>(false);

  // 获取作业和课程列表
  useEffect(() => {
    setLoading(true);
    // 模拟API请求
    setTimeout(() => {
      setAssignments(mockAssignments);
      setCourses(mockCourses);
      setLoading(false);
    }, 1000);
  }, []);

  // 获取作业统计数据
  const getStatistics = () => {
    return {
      total: assignments.length,
      published: assignments.filter(a => a.status === 'published').length,
      draft: assignments.filter(a => a.status === 'draft').length,
      grading: assignments.filter(a => a.status === 'grading').length,
      completed: assignments.filter(a => a.status === 'completed').length,
      submissions: assignments.reduce((acc, a) => acc + a.submissionCount, 0)
    };
  };

  // 打开创建/编辑作业模态框
  const showModal = (assignment?: Assignment) => {
    setEditingAssignment(assignment || null);
    
    if (assignment) {
      form.setFieldsValue({
        ...assignment,
        dateRange: [dayjs(assignment.startDate), dayjs(assignment.endDate)]
      });
      
      // 设置附件
      if (assignment.attachments && assignment.attachments.length > 0) {
        setFileList(assignment.attachments.map((file, index) => ({
          uid: `-${index}`,
          name: file,
          status: 'done',
          url: `#${file}`, // 模拟URL
        })));
      } else {
        setFileList([]);
      }
    } else {
      form.resetFields();
      setFileList([]);
    }
    
    setModalVisible(true);
  };

  // 关闭模态框
  const handleCancel = () => {
    setModalVisible(false);
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);
      
      // 处理日期范围
      const [startDate, endDate] = values.dateRange;
      
      // 获取课程名称
      const course = courses.find(c => c.id === values.courseId);
      
      // 构建作业对象
      const assignmentData = {
        ...values,
        courseName: course ? course.title : '',
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        attachments: fileList.map(file => file.name),
        totalStudents: course ? course.enrolledStudents : 0,
        submissionCount: editingAssignment ? editingAssignment.submissionCount : 0,
        gradedCount: editingAssignment ? editingAssignment.gradedCount : 0
      };
      
      // 模拟API请求
      setTimeout(() => {
        if (editingAssignment) {
          // 更新作业
          const updatedAssignments = assignments.map(a => 
            a.id === editingAssignment.id ? { ...a, ...assignmentData } : a
          );
          setAssignments(updatedAssignments);
          message.success('作业更新成功');
        } else {
          // 创建作业
          const newAssignment: Assignment = {
            id: `${Date.now()}`,
            ...assignmentData,
            createdAt: new Date().toISOString().split('T')[0],
            submissionCount: 0,
            gradedCount: 0,
            allowLateSubmission: false,
            latePenalty: 10,
            allowResubmission: false,
            maxResubmissions: 1,
            passingScore: 60,
            visibleToStudents: true,
            groupAssignment: false,
            maxGroupSize: 4,
            estimatedTime: 60
          };
          setAssignments([...assignments, newAssignment]);
          message.success('作业创建成功');
        }
        
        setConfirmLoading(false);
        setModalVisible(false);
      }, 1000);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 删除作业
  const handleDelete = (id: string) => {
    setLoading(true);
    // 模拟API请求
    setTimeout(() => {
      const updatedAssignments = assignments.filter(a => a.id !== id);
      setAssignments(updatedAssignments);
      setLoading(false);
      message.success('作业删除成功');
    }, 1000);
  };

  // 更改作业状态
  const handleStatusChange = (id: string, status: AssignmentStatus) => {
    const updatedAssignments = assignments.map(a => 
      a.id === id ? { ...a, status } : a
    );
    setAssignments(updatedAssignments);
    message.success(`作业状态已更改为${status === 'published' ? '已发布' : status === 'draft' ? '草稿' : status}`);
  };

  // 处理上传变化
  const handleUploadChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  // 获取状态标签
  const getStatusTag = (status: AssignmentStatus) => {
    switch (status) {
      case 'published':
        return <Tag color="success">已发布</Tag>;
      case 'draft':
        return <Tag color="warning">草稿</Tag>;
      case 'expired':
        return <Tag color="error">已截止</Tag>;
      case 'grading':
        return <Tag color="processing">批改中</Tag>;
      case 'completed':
        return <Tag color="default">已完成</Tag>;
      default:
        return null;
    }
  };

  // 获取类型标签
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

  // 过滤作业
  const getFilteredAssignments = () => {
    let filtered = assignments;
    
    // 按状态过滤
    if (activeTab !== 'all') {
      filtered = filtered.filter(a => a.status === activeTab);
    }
    
    // 按搜索文本过滤
    if (searchText) {
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(searchText.toLowerCase()) ||
        a.courseName.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    return filtered;
  };

  const stats = getStatistics();

  // 批量操作处理函数
  const handleBatchDelete = () => {
    AntModal.confirm({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个作业吗？此操作不可恢复。`,
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        setBatchLoading(true);
        // 模拟API调用
        setTimeout(() => {
          const newAssignments = assignments.filter(
            item => !selectedRowKeys.includes(item.id)
          );
          setAssignments(newAssignments);
          setSelectedRowKeys([]);
          setBatchLoading(false);
          message.success(`成功删除 ${selectedRowKeys.length} 个作业`);
        }, 1000);
      }
    });
  };
  
  const handleBatchPublish = () => {
    AntModal.confirm({
      title: '确认发布',
      content: `确定要发布选中的 ${selectedRowKeys.length} 个作业吗？发布后学生将可以查看这些作业。`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        setBatchLoading(true);
        // 模拟API调用
        setTimeout(() => {
          const newAssignments = assignments.map(item => {
            if (selectedRowKeys.includes(item.id)) {
              return { ...item, status: 'published', visibleToStudents: true };
            }
            return item;
          });
          setAssignments(newAssignments);
          setSelectedRowKeys([]);
          setBatchLoading(false);
          message.success(`成功发布 ${selectedRowKeys.length} 个作业`);
        }, 1000);
      }
    });
  };
  
  const handleBatchExport = (type: 'excel' | 'pdf') => {
    setBatchLoading(true);
    // 模拟导出操作
    setTimeout(() => {
      setBatchLoading(false);
      message.success(`已成功导出 ${selectedRowKeys.length} 个作业为 ${type.toUpperCase()} 格式`);
    }, 1500);
  };
  
  const handleBatchCopy = () => {
    AntModal.confirm({
      title: '确认复制',
      content: `确定要复制选中的 ${selectedRowKeys.length} 个作业吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        setBatchLoading(true);
        // 模拟API调用
        setTimeout(() => {
          const copiedAssignments = assignments
            .filter(item => selectedRowKeys.includes(item.id))
            .map(item => ({
              ...item,
              id: `copy-${item.id}-${Date.now()}`,
              title: `${item.title} (副本)`,
              status: 'draft',
              submissionCount: 0,
              gradedCount: 0,
              createdAt: new Date().toISOString().split('T')[0]
            }));
          
          setAssignments([...assignments, ...copiedAssignments]);
          setSelectedRowKeys([]);
          setBatchLoading(false);
          message.success(`成功复制 ${selectedRowKeys.length} 个作业`);
        }, 1000);
      }
    });
  };
  
  const handleBatchSendReminder = () => {
    AntModal.confirm({
      title: '发送提醒',
      content: `确定要向未提交选中作业的学生发送提醒吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        setBatchLoading(true);
        // 模拟API调用
        setTimeout(() => {
          setBatchLoading(false);
          message.success('提醒已发送');
        }, 1000);
      }
    });
  };
  
  // 添加批量评分功能
  const [batchGradeModalVisible, setBatchGradeModalVisible] = useState(false);
  const [batchGradeForm] = Form.useForm();
  
  const handleBatchGrade = () => {
    // 检查选中的作业是否都是已提交状态
    const submittedAssignments = assignments.filter(
      item => selectedRowKeys.includes(item.id) && item.status === 'grading'
    );
    
    if (submittedAssignments.length === 0) {
      message.warning('请选择至少一个待评分的作业');
      return;
    }
    
    if (submittedAssignments.length < selectedRowKeys.length) {
      message.warning('只有待评分状态的作业可以批量评分');
    }
    
    // 打开批量评分对话框
    setBatchGradeModalVisible(true);
  };
  
  const handleBatchGradeSubmit = () => {
    batchGradeForm.validateFields().then(values => {
      setBatchLoading(true);
      
      // 模拟API调用
      setTimeout(() => {
        const { score, feedback } = values;
        
        // 更新作业状态
        const newAssignments = assignments.map(item => {
          if (selectedRowKeys.includes(item.id) && item.status === 'grading') {
            return { 
              ...item, 
              status: 'completed',
              passingScore: score >= item.passingScore,
              feedback
            };
          }
          return item;
        });
        
        setAssignments(newAssignments);
        setBatchGradeModalVisible(false);
        setBatchLoading(false);
        setSelectedRowKeys([]);
        message.success('批量评分成功');
      }, 1000);
    });
  };
  
  // 批量操作菜单
  const batchMenu = (
    <Menu>
      <Menu.Item key="publish" icon={<CheckOutlined />} onClick={handleBatchPublish}>
        批量发布
      </Menu.Item>
      <Menu.Item key="grade" icon={<EditOutlined />} onClick={handleBatchGrade}>
        批量评分
      </Menu.Item>
      <Menu.Item key="copy" icon={<CopyOutlined />} onClick={handleBatchCopy}>
        批量复制
      </Menu.Item>
      <Menu.Item key="reminder" icon={<SendOutlined />} onClick={handleBatchSendReminder}>
        发送提醒
      </Menu.Item>
      <Menu.Divider />
      <Menu.SubMenu key="export" icon={<ExportOutlined />} title="导出选中">
        <Menu.Item key="exportExcel" icon={<FileExcelOutlined />} onClick={() => handleBatchExport('excel')}>
          导出为Excel
        </Menu.Item>
        <Menu.Item key="exportPdf" icon={<FilePdfOutlined />} onClick={() => handleBatchExport('pdf')}>
          导出为PDF
        </Menu.Item>
      </Menu.SubMenu>
      <Menu.Divider />
      <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={handleBatchDelete}>
        批量删除
      </Menu.Item>
    </Menu>
  );
  
  // 表格行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    }
  };

  return (
    <div>
      <Title level={2}>作业管理</Title>
      <Text type="secondary">创建、发布和管理课程作业</Text>
      
      <Row gutter={16} style={{ marginTop: 24, marginBottom: 24 }}>
        <Col span={4}>
          <Card>
            <Statistic 
              title="总作业数" 
              value={stats.total} 
              prefix={<FormOutlined />} 
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic 
              title="已发布" 
              value={stats.published} 
              prefix={<CheckCircleOutlined />} 
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic 
              title="草稿" 
              value={stats.draft} 
              prefix={<EditOutlined />} 
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic 
              title="批改中" 
              value={stats.grading} 
              prefix={<ClockCircleOutlined />} 
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic 
              title="已完成" 
              value={stats.completed} 
              prefix={<CheckCircleOutlined />} 
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic 
              title="提交数" 
              value={stats.submissions} 
              prefix={<FileOutlined />} 
            />
          </Card>
        </Col>
      </Row>
      
      <Card
        title="作业列表"
        extra={
          <Space>
            <Input.Search
              placeholder="搜索作业"
              allowClear
              onSearch={value => setSearchText(value)}
              style={{ width: 250 }}
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={showModal}
            >
              创建作业
            </Button>
            <Dropdown overlay={batchMenu} disabled={selectedRowKeys.length === 0}>
              <Button>
                批量操作 <DownOutlined />
              </Button>
            </Dropdown>
          </Space>
        }
        tabList={[
          {
            key: 'all',
            tab: '全部',
          },
          {
            key: 'published',
            tab: '已发布',
          },
          {
            key: 'draft',
            tab: '草稿',
          },
          {
            key: 'grading',
            tab: '批改中',
          },
          {
            key: 'completed',
            tab: '已完成',
          },
        ]}
        activeTabKey={activeTab}
        onTabChange={key => setActiveTab(key as AssignmentStatus | 'all')}
      >
        <Table 
          columns={[
            {
              title: '作业名称',
              dataIndex: 'title',
              key: 'title',
              render: (text: string, record: Assignment) => (
                <Link to={`/teacher/assignments/${record.id}`}>{text}</Link>
              ),
            },
            {
              title: '课程',
              dataIndex: 'courseName',
              key: 'courseName',
            },
            {
              title: '类型',
              dataIndex: 'type',
              key: 'type',
              render: (type: AssignmentType) => getTypeTag(type),
            },
            {
              title: '开始日期',
              dataIndex: 'startDate',
              key: 'startDate',
            },
            {
              title: '截止日期',
              dataIndex: 'endDate',
              key: 'endDate',
            },
            {
              title: '提交情况',
              key: 'submission',
              render: (_, record: Assignment) => (
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text>{record.submissionCount} / {record.totalStudents}</Text>
                  <Progress 
                    percent={Math.round(record.submissionCount / record.totalStudents * 100)} 
                    size="small" 
                  />
                </Space>
              ),
            },
            {
              title: '批改进度',
              key: 'grading',
              render: (_, record: Assignment) => (
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text>{record.gradedCount} / {record.submissionCount}</Text>
                  <Progress 
                    percent={record.submissionCount > 0 ? Math.round(record.gradedCount / record.submissionCount * 100) : 0} 
                    size="small" 
                  />
                </Space>
              ),
            },
            {
              title: '状态',
              dataIndex: 'status',
              key: 'status',
              render: (status: AssignmentStatus) => getStatusTag(status),
            },
            {
              title: '操作',
              key: 'action',
              render: (_, record: Assignment) => (
                <Space size="middle">
                  <Tooltip title="查看">
                    <Button 
                      type="text" 
                      icon={<EyeOutlined />} 
                      onClick={() => navigate(`/teacher/assignments/${record.id}`)}
                    />
                  </Tooltip>
                  <Tooltip title="编辑">
                    <Button 
                      type="text" 
                      icon={<EditOutlined />} 
                      onClick={() => showModal(record)}
                    />
                  </Tooltip>
                  {record.status === 'draft' && (
                    <Tooltip title="发布">
                      <Button 
                        type="text" 
                        icon={<CheckCircleOutlined />} 
                        onClick={() => handleStatusChange(record.id, 'published')}
                      />
                    </Tooltip>
                  )}
                  <Tooltip title="删除">
                    <Popconfirm
                      title="确定要删除这个作业吗?"
                      onConfirm={() => handleDelete(record.id)}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button 
                        type="text" 
                        danger 
                        icon={<DeleteOutlined />} 
                      />
                    </Popconfirm>
                  </Tooltip>
                </Space>
              ),
            },
          ]} 
          dataSource={getFilteredAssignments()} 
          rowKey="id" 
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `共 ${total} 个作业`
          }}
          rowSelection={rowSelection}
        />
      </Card>
      
      <Modal
        title={editingAssignment ? '编辑作业' : '创建作业'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        confirmLoading={confirmLoading}
        width={800}
        style={{ top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'draft',
            type: 'essay',
            totalPoints: 100,
            allowLateSubmission: false,
            latePenalty: 10,
            allowResubmission: false,
            maxResubmissions: 1,
            passingScore: 60,
            visibleToStudents: true,
            groupAssignment: false,
            maxGroupSize: 4,
            estimatedTime: 60
          }}
        >
          <Tabs 
            defaultActiveKey="basic"
            items={[
              {
                key: 'basic',
                label: '基本信息',
                children: (
                  <>
                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item
                          name="title"
                          label="作业名称"
                          rules={[{ required: true, message: '请输入作业名称' }]}
                        >
                          <Input placeholder="请输入作业名称" />
                        </Form.Item>
                      </Col>
                    </Row>
                    
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="courseId"
                          label="所属课程"
                          rules={[{ required: true, message: '请选择所属课程' }]}
                        >
                          <Select placeholder="请选择所属课程">
                            {courses.map(course => (
                              <Option key={course.id} value={course.id}>{course.title}</Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="type"
                          label="作业类型"
                          rules={[{ required: true, message: '请选择作业类型' }]}
                        >
                          <Select>
                            <Option value="essay">论文</Option>
                            <Option value="quiz">测验</Option>
                            <Option value="project">项目</Option>
                            <Option value="code">代码</Option>
                            <Option value="other">其他</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                    
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="dateRange"
                          label="作业时间"
                          rules={[{ required: true, message: '请选择作业开始和截止时间' }]}
                        >
                          <RangePicker style={{ width: '100%' }} showTime />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="totalPoints"
                          label="总分"
                          rules={[{ required: true, message: '请输入作业总分' }]}
                        >
                          <InputNumber min={0} max={100} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                    </Row>
                    
                    <Form.Item
                      name="description"
                      label="作业描述"
                      rules={[{ required: true, message: '请输入作业描述' }]}
                    >
                      <TextArea rows={4} placeholder="请输入作业描述" />
                    </Form.Item>
                    
                    <Form.Item
                      name="tags"
                      label="标签"
                    >
                      <Select mode="tags" placeholder="添加标签" style={{ width: '100%' }}>
                        <Option value="重要">重要</Option>
                        <Option value="期中">期中</Option>
                        <Option value="期末">期末</Option>
                        <Option value="加分">加分</Option>
                      </Select>
                    </Form.Item>
                  </>
                )
              },
              {
                key: 'advanced',
                label: '高级设置',
                children: (
                  <>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="passingScore"
                          label="及格分数"
                          tooltip="学生需要达到的最低分数"
                        >
                          <InputNumber min={0} max={100} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="estimatedTime"
                          label="预计完成时间(分钟)"
                          tooltip="学生完成此作业的预计时间"
                        >
                          <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                    </Row>
                    
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="allowLateSubmission"
                          valuePropName="checked"
                          label="允许迟交"
                        >
                          <Switch />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="latePenalty"
                          label="迟交扣分百分比"
                          tooltip="迟交作业将扣除的分数百分比"
                          dependencies={['allowLateSubmission']}
                        >
                          <InputNumber 
                            min={0} 
                            max={100} 
                            style={{ width: '100%' }} 
                            disabled={!form.getFieldValue('allowLateSubmission')}
                            formatter={value => `${value}%`}
                            parser={value => value ? value.replace('%', '') : ''}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="allowResubmission"
                          valuePropName="checked"
                          label="允许重新提交"
                        >
                          <Switch />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="maxResubmissions"
                          label="最大重新提交次数"
                          dependencies={['allowResubmission']}
                        >
                          <InputNumber 
                            min={1} 
                            max={10} 
                            style={{ width: '100%' }} 
                            disabled={!form.getFieldValue('allowResubmission')}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="groupAssignment"
                          valuePropName="checked"
                          label="小组作业"
                          tooltip="学生可以组队完成此作业"
                        >
                          <Switch />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="maxGroupSize"
                          label="最大小组人数"
                          dependencies={['groupAssignment']}
                        >
                          <InputNumber 
                            min={2} 
                            max={10} 
                            style={{ width: '100%' }} 
                            disabled={!form.getFieldValue('groupAssignment')}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    
                    <Form.Item
                      name="gradingCriteria"
                      label="评分标准"
                      tooltip="详细说明如何评分此作业"
                    >
                      <TextArea rows={4} placeholder="请输入评分标准" />
                    </Form.Item>
                  </>
                )
              },
              {
                key: 'files',
                label: '附件',
                children: (
                  <>
                    <Form.Item
                      label="附件"
                      name="attachments"
                    >
                      <Upload
                        name="file"
                        action="/api/upload"
                        multiple
                        beforeUpload={() => false}
                      >
                        <Button icon={<UploadOutlined />}>上传附件</Button>
                      </Upload>
                    </Form.Item>
                    
                    <Alert 
                      message="提示" 
                      description="上传的附件将作为作业要求或参考资料提供给学生。支持文档、图片、视频等多种格式。" 
                      type="info" 
                      showIcon 
                      style={{ marginTop: 16 }}
                    />
                  </>
                )
              },
              {
                key: 'publish',
                label: '发布设置',
                children: (
                  <>
                    <Form.Item
                      name="visibleToStudents"
                      valuePropName="checked"
                      label="对学生可见"
                      tooltip="设置作业是否对学生可见"
                    >
                      <Switch />
                    </Form.Item>
                    
                    <Form.Item
                      name="status"
                      label="作业状态"
                      rules={[{ required: true, message: '请选择作业状态' }]}
                    >
                      <Radio.Group>
                        <Radio value="draft">草稿</Radio>
                        <Radio value="published">发布</Radio>
                      </Radio.Group>
                    </Form.Item>
                    
                    <Alert 
                      message="注意" 
                      description="作业发布后，学生将能够查看作业内容并提交答案。请确保所有信息正确无误。" 
                      type="warning" 
                      showIcon 
                    />
                  </>
                )
              },
            ]}
          />
        </Form>
      </Modal>
      
      {/* 批量评分对话框 */}
      <Modal
        title="批量评分"
        open={batchGradeModalVisible}
        onOk={handleBatchGradeSubmit}
        onCancel={() => setBatchGradeModalVisible(false)}
        confirmLoading={batchLoading}
      >
        <Form form={batchGradeForm} layout="vertical">
          <Form.Item
            name="score"
            label="分数"
            rules={[{ required: true, message: '请输入分数' }]}
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="feedback"
            label="评语"
          >
            <Input.TextArea rows={4} placeholder="请输入评语" />
          </Form.Item>
          <Alert
            message="注意"
            description="此操作将为所有选中的待评分作业设置相同的分数和评语。"
            type="warning"
            showIcon
            style={{ marginBottom: 0 }}
          />
        </Form>
      </Modal>
    </div>
  );
};

export default TeacherAssignmentManagement; 