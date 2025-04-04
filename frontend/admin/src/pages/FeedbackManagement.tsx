import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Tooltip,
  Select,
  Input,
  Statistic,
  Row,
  Col,
  Badge,
  DatePicker,
  Form,
  message,
  Divider,
  Progress,
  Alert,
  Tabs
} from 'antd';
import {
  CommentOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  SearchOutlined,
  UserOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  PieChartOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import * as feedbackService from '../services/feedbackService';
import { useAppContext } from '../contexts/AppContext';
import PageHeader from '../components/PageHeader';
import { Feedback, FeedbackQueryParams, FeedbackStatistics } from '../services/feedbackService';
import FeedbackStatisticsComponent from '../components/FeedbackStatistics';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Search } = Input;

// 状态标签颜色映射
const statusColors: Record<string, string> = {
  'Pending': 'orange',
  'InProgress': 'processing',
  'Resolved': 'success',
  'Closed': 'default'
};

// 状态图标映射
const statusIcons: Record<string, React.ReactNode> = {
  'Pending': <ClockCircleOutlined />,
  'InProgress': <SyncOutlined spin />,
  'Resolved': <CheckCircleOutlined />,
  'Closed': <CloseCircleOutlined />
};

// 反馈类型标签颜色映射
const typeColors: Record<string, string> = {
  'LearningQuestion': 'blue',
  'TechnicalIssue': 'volcano',
  'ContentError': 'red',
  'Suggestion': 'green',
  'Other': 'default'
};

// 优先级标签颜色映射
const priorityColors: Record<string, string> = {
  'Low': '#8c8c8c',
  'Normal': '#1890ff',
  'High': '#faad14',
  'Urgent': '#f5222d'
};

const FeedbackManagement: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppContext();
  const isStudent = user?.role === 'student';
  const isMyFeedback = location.pathname === '/my-feedback';
  const isStatistics = location.pathname === '/feedback/statistics';
  
  // 统计/列表视图切换
  const [activeTab, setActiveTab] = useState<string>(isStatistics ? 'statistics' : 'list');

  // 状态
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [types, setTypes] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<FeedbackStatistics | null>(null);

  // 查询条件
  const [queryParams, setQueryParams] = useState<FeedbackQueryParams>({
    page: 1,
    pageSize: 10,
    sortBy: 'createdAt',
    descending: true
  });

  // 添加引用来跟踪组件挂载状态
  const isMounted = useRef(true);
  
  useEffect(() => {
    // 初始化加载
    if (isStatistics && !isStudent) {
      loadStatistics();
    } else {
      loadFeedbackTypes();
      loadFeedbackStatuses();
      loadFeedbacks();
    }
    
    // 组件卸载时清理
    return () => {
      isMounted.current = false;
      feedbackService.cleanupFeedbackRequests();
    };
  }, [isStatistics, isMyFeedback]);

  // 加载反馈类型
  const loadFeedbackTypes = async () => {
    try {
      const types = await feedbackService.getFeedbackTypes();
      if (isMounted.current) {
        // 转换为前端需要的格式
        const typeOptions = types.map(type => ({
          value: type,
          label: type
        }));
        setTypes(typeOptions);
      }
    } catch (error) {
      if (isMounted.current) {
        if (error instanceof Error && error.name !== 'CanceledError') {
          message.error('加载反馈类型失败');
          console.error(error);
        } else {
          console.log('反馈类型请求已取消');
        }
      }
    }
  };

  // 加载反馈状态
  const loadFeedbackStatuses = async () => {
    try {
      const statuses = await feedbackService.getFeedbackStatuses();
      if (isMounted.current) {
        // 转换为前端需要的格式
        const statusOptions = statuses.map(status => ({
          value: status,
          label: status
        }));
        setStatuses(statusOptions);
      }
    } catch (error) {
      if (isMounted.current) {
        if (error instanceof Error && error.name !== 'CanceledError') {
          message.error('加载反馈状态失败');
          console.error(error);
        } else {
          console.log('反馈状态请求已取消');
        }
      }
    }
  };

  // 加载统计数据
  const loadStatistics = async () => {
    setLoading(true);
    try {
      const stats = await feedbackService.getFeedbackStatistics();
      if (isMounted.current) {
        setStatistics(stats);
      }
    } catch (error) {
      if (isMounted.current) {
        if (error instanceof Error && error.name !== 'CanceledError') {
          message.error('加载统计数据失败');
          console.error(error);
        } else {
          console.log('统计数据请求已取消');
        }
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  // 加载反馈列表
  const loadFeedbacks = async () => {
    setLoading(true);
    try {
      // 如果是学生查看自己的反馈，调整查询参数
      const params = { ...queryParams };
      
      // 获取反馈列表
      const response = await feedbackService.getFeedbacks(params);
      
      if (isMounted.current) {
        setFeedbacks(response.items || []);
        setPagination({
          current: response.currentPage || 1,
          pageSize: response.pageSize || 10,
          total: response.totalCount || 0
        });
      }
    } catch (error) {
      if (isMounted.current) {
        if (error instanceof Error && error.name !== 'CanceledError') {
          message.error('加载反馈列表失败');
          console.error(error);
        } else {
          console.log('反馈列表请求已取消');
        }
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const handleSearch = () => {
    setQueryParams({ ...queryParams, page: 1 });
    loadFeedbacks();
  };

  // 设置状态过滤
  const handleStatusChange = (value: string | undefined) => {
    setQueryParams({ ...queryParams, status: value, page: 1 });
    loadFeedbacks();
  };

  // 设置类型过滤
  const handleTypeChange = (value: string | undefined) => {
    setQueryParams({ ...queryParams, type: value, page: 1 });
    loadFeedbacks();
  };

  // 设置排序
  const handleSortChange = (value: string) => {
    const [sortBy, order] = value.split('-');
    setQueryParams({ 
      ...queryParams, 
      sortBy, 
      descending: order === 'desc',
      page: 1 
    });
    loadFeedbacks();
  };

  // 跳转到详情页
  const goToDetail = (id: number) => {
    navigate(`/feedback/${id}`);
  };

  // 获取反馈类型标签
  const getFeedbackTypeTag = (type: string) => {
    const typeText = {
      'LearningQuestion': '学习问题',
      'TechnicalIssue': '技术问题',
      'ContentError': '内容错误',
      'Suggestion': '功能建议',
      'Other': '其他'
    }[type] || type;

    return (
      <Tag color={typeColors[type] || 'default'}>
        {typeText}
      </Tag>
    );
  };

  // 获取状态标签
  const getStatusTag = (status: string) => {
    const statusText = {
      'Pending': '待处理',
      'InProgress': '处理中',
      'Resolved': '已解决',
      'Closed': '已关闭'
    }[status] || status;

    return (
      <Tag icon={statusIcons[status]} color={statusColors[status] || 'default'}>
        {statusText}
      </Tag>
    );
  };

  // 处理标签页切换
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    if (key === 'statistics' && !isStudent) {
      navigate('/feedback/statistics');
    } else if (key === 'list') {
      navigate(isStudent ? '/my-feedback' : '/feedback');
    }
  };

  // 获取反馈表格列配置
  const getFeedbackColumns = () => {
    const columns = [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        width: 80,
      },
      {
        title: '标题',
        dataIndex: 'title',
        key: 'title',
        render: (text: string) => <Text strong>{text}</Text>,
      },
      {
        title: '类型',
        dataIndex: 'feedbackType',
        key: 'feedbackType',
        render: (type: string) => getFeedbackTypeTag(type),
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (status: string) => getStatusTag(status),
      },
      {
        title: '优先级',
        dataIndex: 'priority',
        key: 'priority',
        render: (priority: string) => (
          <Tag color={priorityColors[priority]}>
            {priority}
          </Tag>
        ),
      }
    ];

    // 学生视图不显示提交人
    if (!isStudent) {
      columns.push({
        title: '提交人',
        dataIndex: 'studentName',
        key: 'studentName',
        render: (text: string) => <span><UserOutlined /> {text}</span>,
        width: 120,
      });
    }

    columns.push(
      {
        title: '提交时间',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (date: string) => new Date(date).toLocaleString(),
        width: 160,
      },
      {
        title: '操作',
        key: 'action',
        render: (_, record: Feedback) => (
          <Button type="link" onClick={(e) => {
            e.stopPropagation();
            navigate(`/feedback/${record.id}`);
          }}>
            查看详情
          </Button>
        ),
        width: 100,
      }
    );

    return columns;
  };

  // 渲染页面标题
  const renderPageTitle = () => {
    if (isStudent) {
      return (
        <PageHeader
          title="我的反馈"
          subtitle="查看我提交的反馈及其处理进度"
          icon={<CommentOutlined />}
        />
      );
    } else {
      return (
        <PageHeader
          title="反馈管理"
          subtitle="管理学生的反馈，并提供及时回复"
          icon={<CommentOutlined />}
        />
      );
    }
  };

  // 渲染页面内容
  return (
    <div className="feedback-management-page">
      {renderPageTitle()}

      {/* 教师和管理员可以切换统计视图和列表视图 */}
      {!isStudent && (
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane 
            tab={<span><CommentOutlined />反馈列表</span>}
            key="list"
          >
            <Card>
              <Space style={{ marginBottom: 16 }} size="middle" wrap>
                <Select
                  placeholder="反馈状态"
                  style={{ width: 150 }}
                  allowClear
                  onChange={handleStatusChange}
                >
                  {statuses.map(status => (
                    <Option key={status.value} value={status.value}>{status.label}</Option>
                  ))}
                </Select>
                
                <Select
                  placeholder="反馈类型"
                  style={{ width: 150 }}
                  allowClear
                  onChange={handleTypeChange}
                >
                  {types.map(type => (
                    <Option key={type.value} value={type.value}>{type.label}</Option>
                  ))}
                </Select>
                
                <Select
                  placeholder="排序方式"
                  style={{ width: 150 }}
                  defaultValue="createdAt-desc"
                  onChange={handleSortChange}
                >
                  <Option value="createdAt-desc">创建时间（降序）</Option>
                  <Option value="createdAt-asc">创建时间（升序）</Option>
                  <Option value="priority-desc">优先级（降序）</Option>
                  <Option value="status-asc">状态（升序）</Option>
                </Select>
                
                <Search
                  placeholder="搜索反馈标题或内容"
                  style={{ width: 250 }}
                  onSearch={value => {
                    setQueryParams({ ...queryParams, search: value, page: 1 });
                    loadFeedbacks();
                  }}
                  allowClear
                />
                
                {isStudent && (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/create-feedback')}
                  >
                    提交反馈
                  </Button>
                )}
              </Space>
              
              <Table
                columns={getFeedbackColumns()}
                dataSource={feedbacks}
                rowKey="id"
                loading={loading}
                pagination={{
                  current: pagination.current,
                  pageSize: pagination.pageSize,
                  total: pagination.total,
                  onChange: (page, pageSize) => {
                    setPagination({ ...pagination, current: page, pageSize: pageSize || 10 });
                    setQueryParams({ ...queryParams, page, pageSize: pageSize || 10 });
                    loadFeedbacks();
                  }
                }}
                onRow={(record) => ({
                  onClick: () => {
                    // 点击整行跳转到详情页
                    if (isStudent) {
                      navigate(`/feedback/${record.id}`);
                    } else {
                      navigate(`/feedback/${record.id}`);
                    }
                  },
                  style: { cursor: 'pointer' }
                })}
              />
            </Card>
          </TabPane>
          
          <TabPane 
            tab={<span><PieChartOutlined />统计分析</span>}
            key="statistics"
          >
            <FeedbackStatisticsComponent />
          </TabPane>
        </Tabs>
      )}
      
      {/* 学生只有列表视图 */}
      {isStudent && (
        <Card>
          <Space style={{ marginBottom: 16 }} size="middle" wrap>
            <Select
              placeholder="反馈状态"
              style={{ width: 150 }}
              allowClear
              onChange={handleStatusChange}
            >
              {statuses.map(status => (
                <Option key={status.value} value={status.value}>{status.label}</Option>
              ))}
            </Select>
            
            <Select
              placeholder="反馈类型"
              style={{ width: 150 }}
              allowClear
              onChange={handleTypeChange}
            >
              {types.map(type => (
                <Option key={type.value} value={type.value}>{type.label}</Option>
              ))}
            </Select>
            
            <Select
              placeholder="排序方式"
              style={{ width: 150 }}
              defaultValue="createdAt-desc"
              onChange={handleSortChange}
            >
              <Option value="createdAt-desc">创建时间（降序）</Option>
              <Option value="createdAt-asc">创建时间（升序）</Option>
              <Option value="priority-desc">优先级（降序）</Option>
              <Option value="status-asc">状态（升序）</Option>
            </Select>
            
            <Search
              placeholder="搜索反馈标题或内容"
              style={{ width: 250 }}
              onSearch={value => {
                setQueryParams({ ...queryParams, search: value, page: 1 });
                loadFeedbacks();
              }}
              allowClear
            />
            
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/create-feedback')}
            >
              提交反馈
            </Button>
          </Space>
          
          <Table
            columns={getFeedbackColumns()}
            dataSource={feedbacks}
            rowKey="id"
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              onChange: (page, pageSize) => {
                setPagination({ ...pagination, current: page, pageSize: pageSize || 10 });
                setQueryParams({ ...queryParams, page, pageSize: pageSize || 10 });
                loadFeedbacks();
              }
            }}
            onRow={(record) => ({
              onClick: () => navigate(`/feedback/${record.id}`),
              style: { cursor: 'pointer' }
            })}
          />
        </Card>
      )}
    </div>
  );
};

export default FeedbackManagement; 