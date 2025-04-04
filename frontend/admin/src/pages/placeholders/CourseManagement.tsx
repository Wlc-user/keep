import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Card, Tag, Typography, Modal, message, Tabs, Avatar, Image, Tooltip, Progress } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, UserOutlined, BookOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  credits: number;
  status: 'draft' | 'published' | 'archived';
  enrolledStudents: number;
  progress: number;
  coverImage?: string;
  teacherName: string;
  teacherAvatar?: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

const CourseManagement: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // 模拟加载课程数据
  useEffect(() => {
    setTimeout(() => {
      const mockCourses: Course[] = Array(25).fill(0).map((_, index) => {
        const status = index % 3 === 0 ? 'draft' : (index % 5 === 0 ? 'archived' : 'published');
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 30 - Math.floor(Math.random() * 30));
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + 60 + Math.floor(Math.random() * 60));
        
        const categories = ['计算机科学', '数学', '物理', '化学', '文学', '历史', '艺术', '音乐'];
        
        return {
          id: `course-${index + 1}`,
          title: `${categories[index % categories.length]}课程 ${index + 1}`,
          description: `这是${categories[index % categories.length]}课程的详细描述，内容涵盖了该领域的基础知识和实践应用。`,
          category: categories[index % categories.length],
          credits: 2 + Math.floor(Math.random() * 4),
          status: status,
          enrolledStudents: Math.floor(Math.random() * 80),
          progress: Math.floor(Math.random() * 100),
          coverImage: index % 4 === 0 ? undefined : `/assets/courses/course${(index % 6) + 1}.jpg`,
          teacherName: `教师 ${Math.floor(index / 3) + 1}`,
          teacherAvatar: index % 7 === 0 ? undefined : `/assets/avatar/teacher${(index % 5) + 1}.png`,
          startDate: startDate.toLocaleDateString(),
          endDate: endDate.toLocaleDateString(),
          createdAt: new Date(today.getTime() - (Math.random() * 90 * 24 * 60 * 60 * 1000)).toLocaleDateString()
        };
      });
      setCourses(mockCourses);
      setLoading(false);
    }, 1000);
  }, []);

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
      onOk: () => {
        setCourses(courses.filter(course => course.id !== courseId));
        message.success('课程已删除');
      }
    });
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.title.toLowerCase().includes(searchText.toLowerCase()) ||
      course.description.toLowerCase().includes(searchText.toLowerCase()) ||
      course.category.toLowerCase().includes(searchText.toLowerCase()) ||
      course.teacherName.toLowerCase().includes(searchText.toLowerCase());
    
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
      title: '课程',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Course) => (
        <Space>
          {record.coverImage ? (
            <Avatar shape="square" size={40} src={record.coverImage} />
          ) : (
            <Avatar shape="square" size={40} icon={<BookOutlined />} />
          )}
          <div>
            <Link to={`/courses/${record.id}`}>{text}</Link>
            <div>
              <Text type="secondary">{record.category}</Text>
            </div>
          </div>
        </Space>
      )
    },
    {
      title: '授课教师',
      dataIndex: 'teacherName',
      key: 'teacherName',
      render: (text: string, record: Course) => (
        <Space>
          <Avatar src={record.teacherAvatar} icon={<UserOutlined />} />
          {text}
        </Space>
      )
    },
    {
      title: '学分',
      dataIndex: 'credits',
      key: 'credits',
      sorter: (a: Course, b: Course) => a.credits - b.credits,
    },
    {
      title: '学生数',
      dataIndex: 'enrolledStudents',
      key: 'enrolledStudents',
      sorter: (a: Course, b: Course) => a.enrolledStudents - b.enrolledStudents,
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => (
        <Progress percent={progress} size="small" status={progress === 100 ? 'success' : 'active'} />
      ),
      sorter: (a: Course, b: Course) => a.progress - b.progress,
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
      title: '起止日期',
      key: 'dates',
      render: (_, record: Course) => (
        <span>{record.startDate} - {record.endDate}</span>
      ),
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

        <Table
          columns={columns}
          dataSource={filteredCourses}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default CourseManagement; 