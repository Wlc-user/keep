import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Card, 
  Tabs, 
  Typography, 
  Space, 
  Button, 
  List, 
  Avatar, 
  Tag, 
  Progress, 
  Collapse, 
  Row, 
  Col,
  Statistic,
  Divider,
  Empty,
  message
} from 'antd';
import { 
  BookOutlined, 
  TeamOutlined, 
  VideoCameraOutlined, 
  FileOutlined,
  PlayCircleOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import courseService, { CourseDetail, StudentInfo, StudentsResponse } from '../services/courseService';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

// 模拟课程数据
const mockCourseData: CourseDetail = {
  id: '1',
  title: '人工智能导论',
  description: '本课程介绍人工智能的基本概念、发展历史、核心技术和应用领域，帮助学生建立对人工智能的整体认识。',
  teacher: {
    id: '1',
    name: '张教授',
    title: '教授',
    department: '计算机科学',
    avatar: ''
  },
  startDate: '2023-02-15',
  endDate: '2023-06-30',
  schedule: '每周三 14:00-15:30',
  location: '线上直播 + 录播',
  enrolledStudents: 45,
  progress: 60,
  chapters: [
    {
      id: '1',
      title: '第1章 人工智能概述',
      description: '介绍人工智能的定义、历史发展和基本概念',
      sections: [
        {
          id: '1-1',
          title: '1.1 人工智能的定义与范畴',
          type: 'video',
          duration: 45,
          completed: true
        },
        {
          id: '1-2',
          title: '1.2 人工智能的发展历史',
          type: 'video',
          duration: 50,
          completed: true
        },
        {
          id: '1-3',
          title: '1.3 人工智能的应用领域',
          type: 'video',
          duration: 40,
          completed: true
        },
        {
          id: '1-4',
          title: '第1章测验',
          type: 'quiz',
          duration: 30,
          completed: true
        }
      ]
    },
    {
      id: '2',
      title: '第2章 机器学习基础',
      description: '介绍机器学习的基本概念、分类和常见算法',
      sections: [
        {
          id: '2-1',
          title: '2.1 机器学习概述',
          type: 'video',
          duration: 45,
          completed: true
        },
        {
          id: '2-2',
          title: '2.2 监督学习',
          type: 'video',
          duration: 55,
          completed: true
        },
        {
          id: '2-3',
          title: '2.3 无监督学习',
          type: 'video',
          duration: 50,
          completed: true
        },
        {
          id: '2-4',
          title: '2.4 强化学习',
          type: 'video',
          duration: 45,
          completed: false
        },
        {
          id: '2-5',
          title: '第2章测验',
          type: 'quiz',
          duration: 30,
          completed: false
        }
      ]
    },
    {
      id: '3',
      title: '第3章 神经网络',
      description: '介绍神经网络的基本结构、工作原理和常见模型',
      sections: [
        {
          id: '3-1',
          title: '3.1 神经元模型',
          type: 'video',
          duration: 40,
          completed: false
        },
        {
          id: '3-2',
          title: '3.2 前馈神经网络',
          type: 'video',
          duration: 50,
          completed: false
        },
        {
          id: '3-3',
          title: '3.3 反向传播算法',
          type: 'video',
          duration: 55,
          completed: false
        },
        {
          id: '3-4',
          title: '3.4 深度神经网络',
          type: 'video',
          duration: 60,
          completed: false
        },
        {
          id: '3-5',
          title: '第3章测验',
          type: 'quiz',
          duration: 30,
          completed: false
        }
      ]
    }
  ],
  assignments: [
    {
      id: '1',
      title: '人工智能导论期中作业',
      description: '完成一篇关于人工智能发展历史和现状的研究报告',
      deadline: '2023-04-15',
      status: 'active'
    },
    {
      id: '2',
      title: '机器学习算法实现',
      description: '实现并比较三种不同的分类算法',
      deadline: '2023-05-20',
      status: 'pending'
    }
  ],
  materials: [
    {
      id: '1',
      title: '人工智能导论教材',
      type: 'pdf',
      size: '15MB'
    },
    {
      id: '2',
      title: '机器学习算法参考资料',
      type: 'pdf',
      size: '8MB'
    },
    {
      id: '3',
      title: '神经网络编程示例',
      type: 'zip',
      size: '22MB'
    }
  ],
  announcements: [
    {
      id: '1',
      title: '关于期中考试安排',
      content: '期中考试将于4月20日进行，考试范围包括第1-3章内容，请同学们做好复习准备。',
      date: '2023-03-25'
    },
    {
      id: '2',
      title: '第2章作业提交提醒',
      content: '请大家注意第2章的作业截止日期为下周五，请按时提交。',
      date: '2023-03-18'
    }
  ]
};

// 模拟学生列表
const mockStudents: StudentInfo[] = Array(45).fill(0).map((_, index) => ({
  id: `${index + 1}`,
  name: `学生${index + 1}`,
  avatar: '',
  progress: Math.floor(Math.random() * 100),
  lastActive: `2023-03-${10 + Math.floor(Math.random() * 15)}`
}));

interface CourseDetailViewProps {
  userRole?: 'teacher' | 'student';
}

const CourseDetailView: React.FC<CourseDetailViewProps> = ({ userRole: propUserRole }) => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<CourseDetail>(mockCourseData);
  const [students, setStudents] = useState<StudentInfo[]>(mockStudents);
  const [activeTab, setActiveTab] = useState('1');
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<'teacher' | 'student'>(propUserRole || 'teacher'); // 使用props传入的角色或默认为教师角色

  // 获取课程数据
  useEffect(() => {
    if (!courseId) return;
    
    setLoading(true);
    
    // 获取课程详情
    courseService.getCourseDetail(courseId)
      .then((data) => {
        console.log('课程详情:', data);
        setCourse(data);
      })
      .catch((error) => {
        console.error('获取课程详情失败:', error);
        message.error('获取课程详情失败，使用模拟数据');
      })
      .finally(() => {
        setLoading(false);
      });
    
    // 如果是教师角色，获取学生列表
    if (userRole === 'teacher') {
      courseService.getStudentsByCourse(courseId)
        .then((data) => {
          console.log('学生列表:', data);
          if (data && data.items) {
            setStudents(data.items);
          }
        })
        .catch((error) => {
          console.error('获取学生列表失败:', error);
        });
    }
    
    // 从localStorage获取用户信息，判断角色
    const userStr = localStorage.getItem('user');
    if (userStr && !propUserRole) {
      try {
        const userData = JSON.parse(userStr);
        if (userData.role === 'student') {
          setUserRole('student');
        } else {
          setUserRole('teacher');
        }
      } catch (error) {
        console.error('解析用户数据失败', error);
      }
    }
  }, [courseId, userRole, propUserRole]);

  // 计算课程完成进度
  const calculateProgress = () => {
    const totalSections = course.chapters.reduce((acc, chapter) => acc + chapter.sections.length, 0);
    const completedSections = course.chapters.reduce((acc, chapter) => 
      acc + chapter.sections.filter(section => section.completed).length, 0);
    
    return Math.floor((completedSections / totalSections) * 100);
  };

  // 获取章节完成状态
  const getChapterProgress = (chapter: any) => {
    const totalSections = chapter.sections.length;
    const completedSections = chapter.sections.filter((section: any) => section.completed).length;
    
    return Math.floor((completedSections / totalSections) * 100);
  };

  // 处理开始学习
  const handleStartLearning = (sectionId: string) => {
    message.success(`开始学习: ${sectionId}`);
    // 这里应该跳转到学习页面或打开视频播放器
  };

  // 处理下载资料
  const handleDownloadMaterial = (materialId: string) => {
    message.success(`下载资料: ${materialId}`);
    // 这里应该触发文件下载
  };

  // 构建Tabs项
  const getTabItems = () => {
    const items = [
      {
        key: "1",
        label: "课程内容",
        children: (
          <Collapse defaultActiveKey={['1']}>
            {course.chapters.map(chapter => (
              <Panel 
                key={chapter.id} 
                header={
                  <Space>
                    <Text strong>{chapter.title}</Text>
                    <Progress percent={getChapterProgress(chapter)} size="small" style={{ width: 120 }} />
                  </Space>
                }
              >
                <Paragraph>{chapter.description}</Paragraph>
                <List
                  itemLayout="horizontal"
                  dataSource={chapter.sections}
                  renderItem={section => (
                    <List.Item
                      actions={[
                        section.completed ? (
                          <Tag color="success" icon={<CheckCircleOutlined />}>已完成</Tag>
                        ) : (
                          <Button 
                            type="primary" 
                            size="small" 
                            icon={<PlayCircleOutlined />}
                            onClick={() => handleStartLearning(section.id)}
                          >
                            {section.type === 'video' ? '观看视频' : '开始测验'}
                          </Button>
                        )
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          section.type === 'video' ? 
                            <Avatar icon={<PlayCircleOutlined />} /> : 
                            <Avatar icon={<FileOutlined />} />
                        }
                        title={section.title}
                        description={`${section.type === 'video' ? '视频' : '测验'} · ${section.duration}分钟`}
                      />
                    </List.Item>
                  )}
                />
              </Panel>
            ))}
          </Collapse>
        )
      },
      {
        key: "2",
        label: "作业",
        children: (
          course.assignments.length > 0 ? (
            <List
              itemLayout="vertical"
              dataSource={course.assignments}
              renderItem={assignment => (
                <Card style={{ marginBottom: 16 }}>
                  <List.Item
                    actions={[
                      userRole === 'student' ? (
                        <Button type="primary">提交作业</Button>
                      ) : (
                        <Button type="primary">查看提交</Button>
                      )
                    ]}
                  >
                    <List.Item.Meta
                      title={assignment.title}
                      description={`截止日期: ${assignment.deadline}`}
                    />
                    <Paragraph>{assignment.description}</Paragraph>
                  </List.Item>
                </Card>
              )}
            />
          ) : (
            <Empty description="暂无作业" />
          )
        )
      },
      {
        key: "3",
        label: "资料",
        children: (
          <List
            itemLayout="horizontal"
            dataSource={course.materials}
            renderItem={material => (
              <List.Item
                actions={[
                  <Button 
                    type="primary" 
                    icon={<DownloadOutlined />}
                    onClick={() => handleDownloadMaterial(material.id)}
                  >
                    下载
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar icon={<FileOutlined />} />}
                  title={material.title}
                  description={`${material.type.toUpperCase()} · ${material.size}`}
                />
              </List.Item>
            )}
          />
        )
      },
      {
        key: "4",
        label: "公告",
        children: (
          course.announcements.map(announcement => (
            <Card key={announcement.id} style={{ marginBottom: 16 }}>
              <Title level={4}>{announcement.title}</Title>
              <Text type="secondary">{announcement.date}</Text>
              <Paragraph style={{ marginTop: 16 }}>{announcement.content}</Paragraph>
            </Card>
          ))
        )
      }
    ];
    
    // 如果是教师角色，添加学生标签页
    if (userRole === 'teacher') {
      items.push({
        key: "5",
        label: "学生",
        children: (
          <List
            itemLayout="horizontal"
            dataSource={students}
            pagination={{
              onChange: page => {
                console.log(page);
              },
              pageSize: 10,
            }}
            renderItem={student => (
              <List.Item
                actions={[
                  <Button>查看详情</Button>
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} src={student.avatar} />}
                  title={student.name}
                  description={
                    <Space direction="vertical">
                      <Text>进度: {student.progress}%</Text>
                      <Text>最近活动: {student.lastActive}</Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )
      });
    }
    
    return items;
  };

  return (
    <div>
      <Card loading={loading}>
        <Row gutter={[16, 16]}>
          <Col span={16}>
            <Title level={2}>{course.title}</Title>
            <Space align="center">
              <Avatar icon={<UserOutlined />} src={course.teacher.avatar} />
              <Text strong>{course.teacher.name}</Text>
              <Text type="secondary">{course.teacher.title}</Text>
            </Space>
            <Paragraph style={{ marginTop: 16 }}>{course.description}</Paragraph>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic 
                title="课程进度" 
                value={calculateProgress()} 
                suffix="%" 
                prefix={<Progress type="circle" percent={calculateProgress()} size={80} />}
              />
              <Divider />
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text><ClockCircleOutlined /> 开课时间: {course.startDate}</Text>
                <Text><ClockCircleOutlined /> 结课时间: {course.endDate}</Text>
                <Text><ClockCircleOutlined /> 上课时间: {course.schedule}</Text>
                <Text><TeamOutlined /> 学生人数: {course.enrolledStudents}</Text>
              </Space>
              {userRole === 'student' && (
                <Button 
                  type="primary" 
                  icon={<PlayCircleOutlined />} 
                  style={{ marginTop: 16, width: '100%' }}
                >
                  继续学习
                </Button>
              )}
              {userRole === 'teacher' && (
                <Button 
                  type="primary" 
                  icon={<VideoCameraOutlined />} 
                  style={{ marginTop: 16, width: '100%' }}
                >
                  开始上课
                </Button>
              )}
            </Card>
          </Col>
        </Row>

        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab} 
          style={{ marginTop: 24 }}
          items={getTabItems()}
        />
      </Card>
    </div>
  );
};

export default CourseDetailView; 