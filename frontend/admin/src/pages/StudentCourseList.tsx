import React, { useState, useEffect } from 'react';
import { 
  Card, 
  List, 
  Button, 
  Tag, 
  Space, 
  Input, 
  Select, 
  Tabs, 
  Progress, 
  Avatar, 
  Typography, 
  Empty, 
  Divider,
  Row,
  Col,
  Statistic,
  Rate,
  Badge,
  Tooltip
} from 'antd';
import { 
  BookOutlined, 
  SearchOutlined, 
  FilterOutlined, 
  PlayCircleOutlined, 
  ClockCircleOutlined,
  UserOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  StarOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import apiService from '../services/api';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

// 课程状态类型
type CourseStatus = 'not_started' | 'in_progress' | 'completed';

// 课程接口
interface Course {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  teacher: {
    id: string;
    name: string;
    avatar: string;
  };
  category: string;
  startDate: string;
  endDate: string;
  schedule: string;
  progress: number;
  status: CourseStatus;
  rating: number;
  studentCount: number;
  price: number;
  isFree: boolean;
  isEnrolled: boolean;
  lastStudyTime?: string;
}

// 模拟已选课程数据
const mockEnrolledCourses: Course[] = [
  {
    id: '1',
    title: '人工智能导论',
    description: '本课程介绍人工智能的基本概念、发展历史、核心技术和应用领域。',
    coverImage: 'https://via.placeholder.com/300x150?text=AI+Introduction',
    teacher: {
      id: '1',
      name: '张教授',
      avatar: '',
    },
    category: '计算机科学',
    startDate: '2023-03-01',
    endDate: '2023-06-30',
    schedule: '每周三 14:00-15:30',
    progress: 60,
    status: 'in_progress',
    rating: 4.5,
    studentCount: 45,
    price: 0,
    isFree: true,
    isEnrolled: true,
    lastStudyTime: '2023-03-12'
  },
  {
    id: '2',
    title: '机器学习基础',
    description: '本课程介绍机器学习的基本原理、常用算法和实践应用。',
    coverImage: 'https://via.placeholder.com/300x150?text=Machine+Learning',
    teacher: {
      id: '2',
      name: '李博士',
      avatar: '',
    },
    category: '计算机科学',
    startDate: '2023-03-02',
    endDate: '2023-07-01',
    schedule: '每周四 10:00-11:30',
    progress: 75,
    status: 'in_progress',
    rating: 4.8,
    studentCount: 38,
    price: 0,
    isFree: true,
    isEnrolled: true,
    lastStudyTime: '2023-03-11'
  },
  {
    id: '3',
    title: '深度学习实践',
    description: '本课程介绍深度学习的核心概念、常用模型和实际应用案例。',
    coverImage: 'https://via.placeholder.com/300x150?text=Deep+Learning',
    teacher: {
      id: '3',
      name: '王讲师',
      avatar: '',
    },
    category: '计算机科学',
    startDate: '2023-03-03',
    endDate: '2023-07-02',
    schedule: '每周五 15:30-17:00',
    progress: 40,
    status: 'in_progress',
    rating: 4.2,
    studentCount: 30,
    price: 0,
    isFree: true,
    isEnrolled: true,
    lastStudyTime: '2023-03-10'
  },
  {
    id: '4',
    title: '数据挖掘技术',
    description: '本课程介绍数据挖掘的基本概念、常用技术和实际应用。',
    coverImage: 'https://via.placeholder.com/300x150?text=Data+Mining',
    teacher: {
      id: '4',
      name: '赵老师',
      avatar: '',
    },
    category: '数据科学',
    startDate: '2023-03-06',
    endDate: '2023-07-05',
    schedule: '每周一 09:00-10:30',
    progress: 90,
    status: 'in_progress',
    rating: 4.6,
    studentCount: 42,
    price: 0,
    isFree: true,
    isEnrolled: true,
    lastStudyTime: '2023-03-13'
  }
];

// 模拟可选课程数据
const mockAvailableCourses: Course[] = [
  {
    id: '5',
    title: '计算机视觉',
    description: '本课程介绍计算机视觉的基本原理、算法和应用。',
    coverImage: 'https://via.placeholder.com/300x150?text=Computer+Vision',
    teacher: {
      id: '1',
      name: '张教授',
      avatar: '',
    },
    category: '计算机科学',
    startDate: '2023-04-01',
    endDate: '2023-07-30',
    schedule: '每周二 13:30-15:00',
    progress: 0,
    status: 'not_started',
    rating: 4.7,
    studentCount: 35,
    price: 0,
    isFree: true,
    isEnrolled: false
  },
  {
    id: '6',
    title: '自然语言处理',
    description: '本课程介绍自然语言处理的基本概念、算法和应用。',
    coverImage: 'https://via.placeholder.com/300x150?text=NLP',
    teacher: {
      id: '2',
      name: '李博士',
      avatar: '',
    },
    category: '人工智能',
    startDate: '2023-04-03',
    endDate: '2023-08-01',
    schedule: '每周三 09:00-10:30',
    progress: 0,
    status: 'not_started',
    rating: 4.9,
    studentCount: 40,
    price: 199,
    isFree: false,
    isEnrolled: false
  },
  {
    id: '7',
    title: '大数据分析',
    description: '本课程介绍大数据分析的基本概念、技术和应用。',
    coverImage: 'https://via.placeholder.com/300x150?text=Big+Data',
    teacher: {
      id: '3',
      name: '王讲师',
      avatar: '',
    },
    category: '数据科学',
    startDate: '2023-04-05',
    endDate: '2023-08-04',
    schedule: '每周五 13:30-15:00',
    progress: 0,
    status: 'not_started',
    rating: 4.5,
    studentCount: 38,
    price: 149,
    isFree: false,
    isEnrolled: false
  },
  {
    id: '8',
    title: '云计算与分布式系统',
    description: '本课程介绍云计算和分布式系统的基本概念、架构和应用。',
    coverImage: 'https://via.placeholder.com/300x150?text=Cloud+Computing',
    teacher: {
      id: '4',
      name: '赵老师',
      avatar: '',
    },
    category: '计算机科学',
    startDate: '2023-04-10',
    endDate: '2023-08-09',
    schedule: '每周一 15:30-17:00',
    progress: 0,
    status: 'not_started',
    rating: 4.4,
    studentCount: 32,
    price: 0,
    isFree: true,
    isEnrolled: false
  }
];

// 课程分类
const courseCategories = [
  '全部',
  '计算机科学',
  '数据科学',
  '人工智能',
  '软件工程',
  '网络安全',
  '云计算',
  '大数据',
  '物联网'
];

const StudentCourseList: React.FC = () => {
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [activeTab, setActiveTab] = useState('1');
  const [error, setError] = useState<string | null>(null);

  // 获取课程数据
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    // 调用课程列表API
    apiService.courses.getAll(1, 10)
      .then((response: any) => {
        console.log('课程列表响应:', response);
        
        if (response && response.items) {
          // 处理响应数据，区分已选课程和可选课程
          const enrolled: Course[] = [];
          const available: Course[] = [];
          
          response.items.forEach((course: any) => {
            const courseData: Course = {
              id: course.id,
              title: course.title,
              description: course.description || '',
              coverImage: course.coverImage || 'https://via.placeholder.com/300x150?text=Course',
              teacher: {
                id: course.teacherId || '',
                name: course.teacherName || '未知教师',
                avatar: course.teacherAvatar || '',
              },
              category: course.categoryName || '未分类',
              startDate: course.startDate || '',
              endDate: course.endDate || '',
              schedule: course.schedule || '',
              progress: course.progress || 0,
              status: course.status || 'not_started',
              rating: course.rating || 0,
              studentCount: course.studentCount || 0,
              price: course.price || 0,
              isFree: course.isFree || false,
              isEnrolled: course.isEnrolled || false
            };
            
            if (courseData.isEnrolled) {
              enrolled.push(courseData);
            } else {
              available.push(courseData);
            }
          });
          
          setEnrolledCourses(enrolled);
          setAvailableCourses(available);
        } else {
          // 如果API响应格式不正确，使用模拟数据
          console.warn('API响应格式不正确，使用模拟数据');
          setEnrolledCourses(mockEnrolledCourses);
          setAvailableCourses(mockAvailableCourses);
        }
      })
      .catch((error) => {
        console.error('获取课程列表错误:', error);
        setError('获取课程列表失败，使用模拟数据');
        // 出错时使用模拟数据
        setEnrolledCourses(mockEnrolledCourses);
        setAvailableCourses(mockAvailableCourses);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchKeyword(value);
  };

  // 处理分类筛选
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  // 处理选课
  const handleEnroll = (courseId: string) => {
    // 模拟API请求
    const course = availableCourses.find(c => c.id === courseId);
    if (course) {
      if (course.isFree) {
        // 免费课程直接选课
        const updatedCourse = { ...course, isEnrolled: true, status: 'not_started' as CourseStatus };
        setEnrolledCourses([...enrolledCourses, updatedCourse]);
        setAvailableCourses(availableCourses.filter(c => c.id !== courseId));
      } else {
        // 付费课程跳转到支付页面
        // 这里只是模拟
        alert(`即将跳转到支付页面，课程价格：${course.price}元`);
      }
    }
  };

  // 处理继续学习
  const handleContinueLearning = (courseId: string) => {
    // 跳转到课程学习页面
    // 这里只是模拟
    alert(`继续学习课程：${courseId}`);
  };

  // 获取课程状态标签
  const getCourseStatusTag = (status: CourseStatus) => {
    switch (status) {
      case 'not_started':
        return <Tag color="default">未开始</Tag>;
      case 'in_progress':
        return <Tag color="processing">学习中</Tag>;
      case 'completed':
        return <Tag color="success">已完成</Tag>;
      default:
        return null;
    }
  };

  // 过滤课程
  const getFilteredCourses = (courses: Course[]) => {
    return courses.filter(course => {
      const matchKeyword = course.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchKeyword.toLowerCase());
      const matchCategory = selectedCategory === '全部' || course.category === selectedCategory;
      return matchKeyword && matchCategory;
    });
  };

  // 获取统计数据
  const getStatistics = () => {
    return {
      total: enrolledCourses.length,
      inProgress: enrolledCourses.filter(c => c.status === 'in_progress').length,
      completed: enrolledCourses.filter(c => c.status === 'completed').length,
      notStarted: enrolledCourses.filter(c => c.status === 'not_started').length
    };
  };

  const stats = getStatistics();

  return (
    <div>
      <Title level={2}>我的课程</Title>
      <Text type="secondary">浏览和管理您的课程</Text>
      
      <Row gutter={16} style={{ marginTop: 24, marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic 
              title="总课程数" 
              value={stats.total} 
              prefix={<BookOutlined />} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="学习中" 
              value={stats.inProgress} 
              prefix={<ClockCircleOutlined />} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="已完成" 
              value={stats.completed} 
              prefix={<CheckCircleOutlined />} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="未开始" 
              value={stats.notStarted} 
              prefix={<BookOutlined />} 
            />
          </Card>
        </Col>
      </Row>
      
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={[
          {
            key: "1",
            label: "我的课程",
            children: (
              <div>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                  <Space>
                    <Select 
                      defaultValue="全部" 
                      style={{ width: 120 }} 
                      onChange={handleCategoryChange}
                    >
                      {courseCategories.map(category => (
                        <Option key={category} value={category}>{category}</Option>
                      ))}
                    </Select>
                  </Space>
                  <Search 
                    placeholder="搜索课程" 
                    onSearch={handleSearch} 
                    style={{ width: 250 }} 
                  />
                </div>
                
                <List
                  grid={{ gutter: 16, column: 2 }}
                  dataSource={getFilteredCourses(enrolledCourses)}
                  loading={loading}
                  renderItem={course => (
                    <List.Item>
                      <Card
                        hoverable
                        cover={
                          <img 
                            alt={course.title} 
                            src={course.coverImage} 
                            style={{ height: 150, objectFit: 'cover' }}
                          />
                        }
                        actions={[
                          <Button 
                            type="primary" 
                            icon={<PlayCircleOutlined />}
                            onClick={() => handleContinueLearning(course.id)}
                          >
                            继续学习
                          </Button>,
                          <Link to={`/student/courses/${course.id}`}>
                            <Button>查看详情</Button>
                          </Link>
                        ]}
                      >
                        <Card.Meta
                          title={
                            <Space>
                              <Link to={`/student/courses/${course.id}`}>{course.title}</Link>
                              {getCourseStatusTag(course.status)}
                            </Space>
                          }
                          description={
                            <Space direction="vertical" style={{ width: '100%' }}>
                              <Text ellipsis style={{ width: '100%' }}>{course.description}</Text>
                              <Space>
                                <Avatar size="small" icon={<UserOutlined />} src={course.teacher.avatar} />
                                <Text>{course.teacher.name}</Text>
                              </Space>
                              <Progress percent={course.progress} size="small" />
                              <Text type="secondary">最近学习: {course.lastStudyTime || '暂无记录'}</Text>
                            </Space>
                          }
                        />
                      </Card>
                    </List.Item>
                  )}
                  locale={{
                    emptyText: <Empty description="暂无课程" />
                  }}
                />
              </div>
            )
          },
          {
            key: "2",
            label: "课程中心",
            children: (
              <div>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                  <Space>
                    <Select 
                      defaultValue="全部" 
                      style={{ width: 120 }} 
                      onChange={handleCategoryChange}
                    >
                      {courseCategories.map(category => (
                        <Option key={category} value={category}>{category}</Option>
                      ))}
                    </Select>
                  </Space>
                  <Search 
                    placeholder="搜索课程" 
                    onSearch={handleSearch} 
                    style={{ width: 250 }} 
                  />
                </div>
                
                <List
                  grid={{ gutter: 16, column: 2 }}
                  dataSource={getFilteredCourses(availableCourses)}
                  loading={loading}
                  renderItem={course => (
                    <List.Item>
                      <Card
                        hoverable
                        cover={
                          <img 
                            alt={course.title} 
                            src={course.coverImage} 
                            style={{ height: 150, objectFit: 'cover' }}
                          />
                        }
                        actions={[
                          <Button 
                            type="primary"
                            onClick={() => handleEnroll(course.id)}
                          >
                            {course.isFree ? '免费选课' : `￥${course.price} 购买`}
                          </Button>,
                          <Link to={`/student/courses/${course.id}`}>
                            <Button>查看详情</Button>
                          </Link>
                        ]}
                      >
                        <Card.Meta
                          title={
                            <Space>
                              <Link to={`/student/courses/${course.id}`}>{course.title}</Link>
                              {course.isFree ? <Tag color="green">免费</Tag> : <Tag color="blue">付费</Tag>}
                            </Space>
                          }
                          description={
                            <Space direction="vertical" style={{ width: '100%' }}>
                              <Text ellipsis style={{ width: '100%' }}>{course.description}</Text>
                              <Space>
                                <Avatar size="small" icon={<UserOutlined />} src={course.teacher.avatar} />
                                <Text>{course.teacher.name}</Text>
                              </Space>
                              <Space>
                                <Rate disabled defaultValue={course.rating} style={{ fontSize: 12 }} />
                                <Text type="secondary">({course.rating})</Text>
                              </Space>
                              <Text type="secondary">学生数: {course.studentCount}</Text>
                              <Text type="secondary">开课时间: {course.startDate}</Text>
                            </Space>
                          }
                        />
                      </Card>
                    </List.Item>
                  )}
                  locale={{
                    emptyText: <Empty description="暂无课程" />
                  }}
                />
              </div>
            )
          }
        ]}
      />
    </div>
  );
};

export default StudentCourseList; 