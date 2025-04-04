import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Card, Tag, Typography, Modal, message, Tabs, Avatar, Image, Tooltip, Progress, Empty, Spin } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, UserOutlined, BookOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import courseService from '../services/courseService';
import axios from 'axios';
import { MOCK_COURSES } from '../services/courseService';
import { getPlaceholderImage, getUserAvatarPlaceholderImage, handleImageError } from '../utils/imageUtils';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  credits?: number;
  status: 'draft' | 'published' | 'archived';
  enrolledStudents?: number;
  progress?: number;
  coverImage?: string;
  teacherName?: string;
  teacherAvatar?: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  // 后端API字段
  price?: number;
  isFree?: boolean;
  isPublished?: boolean;
  level?: string; 
  imageUrl?: string;
  publishedAt?: string;
}

const CourseManagement: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // 加载课程数据
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      // 尝试不同的API路径获取课程数据
      console.log('尝试获取课程数据...');
      
      // 尝试方法1: 使用推荐的API路径
      let coursesData = null;
      
      try {
        // 先尝试 /api/courses 路径
        coursesData = await apiService.get('/api/courses');
        console.log('通过 /api/courses 获取数据成功');
      } catch (error) {
        console.log('/api/courses 路径不可用，尝试其他路径');
        
        // 尝试方法2: 使用课程服务的路径
        try {
          coursesData = await courseService.getCourses();
          console.log('通过 courseService 获取数据成功');
        } catch (serviceError) {
          console.log('courseService 获取失败，尝试其他路径');
          
          // 尝试方法3: 使用其他可能的路径
          try {
            coursesData = await apiService.get('/courses');
            console.log('通过 /courses 获取数据成功');
          } catch (altPathError) {
            console.log('所有API路径尝试失败');
            throw new Error('无法从任何API路径获取课程数据');
          }
        }
      }
      
      // 处理获取到的数据
      if (coursesData) {
        if (Array.isArray(coursesData)) {
          // 处理API返回的数组数据
          const formattedCourses = coursesData.map(formatCourseData);
          setCourses(formattedCourses);
        } else if (coursesData.items && Array.isArray(coursesData.items)) {
          // 处理包装在items字段中的数据格式
          const formattedCourses = coursesData.items.map(formatCourseData);
          setCourses(formattedCourses);
        } else {
          // 数据格式不符合预期
          console.warn('API返回的数据格式不符合预期');
          useOnlinePlaceholderData();
        }
      } else {
        console.warn('未能获取到课程数据');
        useOnlinePlaceholderData();
      }
    } catch (error) {
      console.error('获取课程数据失败:', error);
      
      // 判断错误类型
      if (axios.isCancel(error)) {
        console.log('请求被取消，这通常是由于页面切换导致的');
      } else if (axios.isAxiosError(error)) {
        if (error.response) {
          console.log(`服务器返回错误: ${error.response.status}`);
        } else if (error.request) {
          console.log('无法连接到服务器，请检查网络');
        }
      }
      
      message.info('已切换到模拟数据模式');
      // 使用在线占位图数据
      useOnlinePlaceholderData();
    } finally {
      setLoading(false);
    }
  };

  // 格式化课程数据
  const formatCourseData = (item: any): Course => ({
    id: item.id?.toString() || '',
    title: item.title || '',
    description: item.description || '',
    category: item.category || '',
    status: item.isPublished ? 'published' : 'draft',
    enrolledStudents: item.enrollmentCount || 0,
    progress: 0,
    coverImage: item.imageUrl || '',
    teacherName: item.teacherName || '', 
    teacherAvatar: item.teacherAvatar || '',
    level: item.level || '',
    price: item.price || 0,
    isFree: item.isFree || false,
    createdAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '',
    publishedAt: item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : '',
  });

  // 使用在线占位图数据
  const useOnlinePlaceholderData = () => {
    const mockCourses = useMockData();
    setCourses(mockCourses);
    message.info('已加载模拟课程数据');
  };

  // 使用模拟数据的备用方法
  const useMockData = () => {
    const MOCK_COURSES_PLACEHOLDER = [
      {
        id: "course-1",
        title: "Web前端开发基础",
        description: "HTML、CSS和JavaScript基础入门教程",
        category: "前端开发",
        credits: 3,
        status: 'published',
        enrolledStudents: 42,
        progress: 100,
        coverImage: "https://via.placeholder.com/800x400/007bff/ffffff?text=Web前端开发基础",
        teacherName: "李明",
        teacherAvatar: "https://via.placeholder.com/100x100/28a745/ffffff?text=李",
        startDate: "2025-02-15",
        endDate: "2025-06-15",
        createdAt: "2025-01-15"
      },
      {
        id: "course-2",
        title: "React高级教程",
        description: "React Hooks、Context API和性能优化",
        category: "前端开发",
        credits: 4,
        status: 'published',
        enrolledStudents: 36,
        progress: 85,
        coverImage: "https://via.placeholder.com/800x400/fd7e14/ffffff?text=React高级教程",
        teacherName: "张伟",
        teacherAvatar: "https://via.placeholder.com/100x100/dc3545/ffffff?text=张",
        startDate: "2025-03-01",
        endDate: "2025-07-01",
        createdAt: "2025-02-01"
      },
      {
        id: "course-3",
        title: "Node.js服务器开发",
        description: "Express、MongoDB和RESTful API",
        category: "后端开发",
        credits: 4,
        status: 'published',
        enrolledStudents: 28,
        progress: 60,
        coverImage: "https://via.placeholder.com/800x400/20c997/ffffff?text=Node.js服务器开发",
        teacherName: "王芳",
        teacherAvatar: "https://via.placeholder.com/100x100/6f42c1/ffffff?text=王",
        startDate: "2025-03-15",
        endDate: "2025-07-15",
        createdAt: "2025-02-15"
      },
      {
        id: "course-4",
        title: "Python数据分析",
        description: "NumPy、Pandas和数据可视化",
        category: "数据科学",
        credits: 5,
        status: 'published',
        enrolledStudents: 45,
        progress: 75,
        coverImage: "https://via.placeholder.com/800x400/6610f2/ffffff?text=Python数据分析",
        teacherName: "刘强",
        teacherAvatar: "https://via.placeholder.com/100x100/fd7e14/ffffff?text=刘",
        startDate: "2025-04-01",
        endDate: "2025-08-01",
        createdAt: "2025-03-01"
      },
      {
        id: "course-5",
        title: "移动应用开发",
        description: "React Native和Flutter框架",
        category: "移动开发",
        credits: 4,
        status: 'draft',
        enrolledStudents: 0,
        progress: 30,
        coverImage: "https://via.placeholder.com/800x400/e83e8c/ffffff?text=移动应用开发",
        teacherName: "赵静",
        teacherAvatar: "https://via.placeholder.com/100x100/20c997/ffffff?text=赵",
        startDate: "2025-05-01",
        endDate: "2025-09-01",
        createdAt: "2025-04-01"
      },
      {
        id: "course-6",
        title: "云服务与DevOps",
        description: "AWS、Docker和CI/CD管道",
        category: "云计算",
        credits: 5,
        status: 'archived',
        enrolledStudents: 32,
        progress: 100,
        coverImage: "https://via.placeholder.com/800x400/17a2b8/ffffff?text=云服务与DevOps",
        teacherName: "陈明",
        teacherAvatar: "https://via.placeholder.com/100x100/ffc107/ffffff?text=陈",
        startDate: "2024-12-01",
        endDate: "2025-04-01",
        createdAt: "2024-11-01"
      }
    ];

    try {
      console.log('优先使用在线占位图...');
      return MOCK_COURSES_PLACEHOLDER;
    } catch (error) {
      console.warn('在线占位图加载失败，尝试使用本地MOCK_COURSES');
      return MOCK_COURSES;
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleAddCourse = () => {
    navigate('/courses/new');
  };

  const handleEditCourse = (courseId: string) => {
    navigate(`/courses/${courseId}/edit`);
  };

  const handleViewCourse = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  const handleDeleteCourse = (courseId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '您确定要删除这门课程吗？此操作不可撤销。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await apiService.delete(`/api/courses/${courseId}`);
          setCourses(courses.filter(course => course.id !== courseId));
          message.success('课程已删除');
        } catch (error) {
          console.error('删除课程失败:', error);
          message.error('删除课程失败，请稍后重试');
        }
      }
    });
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.title.toLowerCase().includes(searchText.toLowerCase()) ||
      (course.description && course.description.toLowerCase().includes(searchText.toLowerCase())) ||
      (course.category && course.category.toLowerCase().includes(searchText.toLowerCase())) ||
      (course.teacherName && course.teacherName.toLowerCase().includes(searchText.toLowerCase()));
    
    if (activeTab === 'all') {
      return matchesSearch;
    }
    
    return matchesSearch && course.status === activeTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'green';
      case 'draft': return 'gold';
      case 'archived': return 'gray';
      default: return 'blue';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return '已发布';
      case 'draft': return '草稿';
      case 'archived': return '已归档';
      default: return status;
    }
  };

  const columns = [
    {
      title: '课程封面',
      dataIndex: 'coverImage',
      key: 'coverImage',
      render: (coverImage: string, record: Course) => (
        <Image 
          src={coverImage || getPlaceholderImage(150, 100, record.title)}
          alt={record.title} 
          style={{ width: 150, height: 100, objectFit: 'cover' }} 
          onError={(e) => handleImageError(e, getPlaceholderImage(150, 100, record.title))}
          fallback={getPlaceholderImage(150, 100, record.title)}
        />
      )
    },
    {
      title: '课程',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Course) => (
        <Space>
          <div>
            <Link to={`/courses/${record.id}`}>{text}</Link>
            <div>
              <Text type="secondary">{record.category || '未分类'}</Text>
            </div>
          </div>
        </Space>
      )
    },
    {
      title: '教师',
      dataIndex: 'teacherName',
      key: 'teacherName',
      render: (teacherName: string, record: Course) => (
        <Space>
          <Avatar 
            src={record.teacherAvatar} 
            size="small"
            onError={(e) => handleImageError(e, getUserAvatarPlaceholderImage(record.id, teacherName))}
          >
            {teacherName?.charAt(0)}
          </Avatar>
          {teacherName}
        </Space>
      )
    },
    {
      title: '学分/级别',
      key: 'credits',
      render: (_, record: Course) => (
        <span>
          {record.credits ? `${record.credits}学分` : ''} 
          {record.level ? <Tag color="blue">{record.level}</Tag> : ''}
        </span>
      ),
      sorter: (a: Course, b: Course) => (a.credits || 0) - (b.credits || 0),
    },
    {
      title: '学生数',
      dataIndex: 'enrolledStudents',
      key: 'enrolledStudents',
      render: (val: number | undefined) => val || 0,
      sorter: (a: Course, b: Course) => (a.enrolledStudents || 0) - (b.enrolledStudents || 0),
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number | undefined) => (
        <Progress percent={progress || 0} size="small" status={(progress || 0) === 100 ? 'success' : 'active'} />
      ),
      sorter: (a: Course, b: Course) => (a.progress || 0) - (b.progress || 0),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '日期信息',
      key: 'dates',
      render: (_, record: Course) => {
        if (record.startDate && record.endDate) {
          return <span>{record.startDate} - {record.endDate}</span>;
        } else if (record.publishedAt) {
          return <span>发布于: {record.publishedAt}</span>;
        } else if (record.createdAt) {
          return <span>创建于: {record.createdAt}</span>;
        }
        return <span>-</span>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Course) => (
        <Space size="middle">
          <Tooltip title="查看详情">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handleViewCourse(record.id)} 
            />
          </Tooltip>
          <Tooltip title="编辑课程">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEditCourse(record.id)} 
            />
          </Tooltip>
          <Tooltip title="删除课程">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => handleDeleteCourse(record.id)} 
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="course-management">
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={2}>课程管理</Title>
          <Space>
            <Input
              placeholder="搜索课程..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => handleSearch(e.target.value)}
              style={{ width: 200 }}
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleAddCourse}
            >
              添加课程
            </Button>
          </Space>
        </div>

        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane tab="全部课程" key="all" />
          <TabPane tab="已发布" key="published" />
          <TabPane tab="草稿" key="draft" />
          <TabPane tab="已归档" key="archived" />
        </Tabs>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <Spin size="large" tip="加载课程数据..." />
          </div>
        ) : filteredCourses.length > 0 ? (
          <Table
            columns={columns}
            dataSource={filteredCourses}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        ) : (
          <Empty 
            description={
              searchText ? "没有找到匹配的课程" : "暂无课程数据"
            }
            style={{ margin: '40px 0' }}
          />
        )}
      </Card>
    </div>
  );
};

export default CourseManagement; 